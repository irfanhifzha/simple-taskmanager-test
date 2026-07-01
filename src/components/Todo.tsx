import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    doc,
    writeBatch,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

import {
    Category,
    colorClasses,
    StatusColor,
} from "../types/scheduleTypes";

import TodoModal from "./TodoModal";
import TodoModalView from "./TodoModalUpdate";

import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragOverEvent,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export type TodoEvent = {
    id: string;

    order: number;
    status: string;

    title: string;
    subtitle: string;
    desc: string;

    tipe: StatusColor;
    note: string;
    peoples: string[];

    createdAt: Timestamp;
    updatedAt: Timestamp;
};

export type TodoStatus = "todo" | "progress" | "done" | "archived";

export const todoColumns: { key: TodoStatus; label: string; theme: string }[] = [
    { key: "todo", label: "Todo", theme: "blueStat" },
    { key: "progress", label: "Progress", theme: "yellowStat" },
    { key: "done", label: "Done", theme: "greenStat" },
    { key: "archived", label: "Archived", theme: "grayStat" },
];

const themeClasses: Record<string, { card: string; title: string }> = {
    blueStat: { card: "bg-red-600", title: "text-red-600" },
    yellowStat: { card: "bg-blue-600", title: "text-blue-600" },
    greenStat: { card: "bg-green-600", title: "text-green-600" },
    grayStat: { card: "bg-gray-600", title: "text-gray-600" },
};

type Props = {
    kategori: Category;
    user: User | null;
};

type Selected = {
    task: TodoEvent;
    order?: number;
    login?: boolean;
};

/* ---------- Shared card content ---------- */
function TaskCardContent({ task, theme }: { task: TodoEvent; theme: { card: string; title: string } }) {
    return (
        <>
            <div className={`h-2 w-full rounded-md ${theme.card}`}></div>
            {task.title && (
                <button className="flex justify-start mt-1 text-lg font-bold pointer-events-none">
                    {task.title}
                </button>
            )}
            {task.subtitle && <p className="-mt-1 text-xs font-semibold">{task.subtitle}</p>}
            {task.peoples.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {task.peoples.map((person, idx) => (
                        <div key={idx} className="text-black px-2 py-1 rounded-lg bg-white w-fit">
                            {person}
                        </div>
                    ))}
                </div>
            )}
            {task.desc && <p className="font-medium brightness-50 whitespace-pre-line">{task.desc}</p>}
            {task.note && <p className="text-blue-500 whitespace-pre-line">{task.note}</p>}
        </>
    );
}

/* ---------- Sortable card ---------- */
function SortableTaskCard({
    task,
    editMode,
    theme,
    onOpen,
}: {
    task: TodoEvent;
    editMode: boolean;
    theme: { card: string; title: string };
    onOpen: () => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: { status: task.status },
        disabled: !editMode,
        transition: {
            duration: 250,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
        },
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.35 : 1,
        zIndex: isDragging ? 10 : "auto",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(editMode ? attributes : {})}
            {...(editMode ? listeners : {})}
            onClick={!editMode ? onOpen : undefined}
            className={`flex flex-col gap-2 flex-wrap p-3 rounded-lg transition! duration-200 ease hover:-translate-y-0.5 active:scale-98 touch-none
                ${colorClasses[task.tipe] ?? "border border-black bg-white"}
                ${editMode ? "cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md" : "cursor-pointer"}`}
        >
            <TaskCardContent task={task} theme={theme} />
        </div>
    );
}

/* ---------- Droppable column body ---------- */
function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-3 min-h-[60px] rounded-lg transition-colors duration-200 ${isOver ? "bg-gray-100" : ""
                }`}
        >
            {children}
        </div>
    );
}

export default function TodoBoard({ kategori, user }: Props) {
    const isLoggedIn = !!user;

    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<Selected | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const [activeTask, setActiveTask] = useState<TodoEvent | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );


    const visibleColumns = editMode
        ? todoColumns
        : todoColumns.filter((col) => col.key !== "archived");


    useEffect(() => {
        const q = query(collection(db, "todos"), orderBy("order", "asc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as TodoEvent[];

            setTasks(data);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const grouped: Record<TodoStatus, TodoEvent[]> = {
        todo: tasks.filter((t) => t.status === "todo"),
        progress: tasks.filter((t) => t.status === "progress"),
        done: tasks.filter((t) => t.status === "done"),
        archived: tasks.filter((t) => t.status === "archived"),
    };

    async function persistColumn(columnTasks: TodoEvent[]) {
        const batch = writeBatch(db);
        columnTasks.forEach((t, idx) => {
            batch.update(doc(db, "todos", t.id), {
                order: idx * 10,
                status: t.status,
                updatedAt: Timestamp.now(),
            });
        });
        try {
            await batch.commit();
        } catch (err) {
            console.error("Failed to persist order:", err);
        }
    }

    function resolveStatus(overId: string): TodoStatus | null {
        if (overId.startsWith("col-")) {
            return overId.replace("col-", "") as TodoStatus;
        }
        const overTask = tasks.find((t) => t.id === overId);
        return overTask ? (overTask.status as TodoStatus) : null;
    }

    function handleDragStart(event: DragStartEvent) {
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task ?? null);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        const activeTaskItem = tasks.find((t) => t.id === activeId);
        if (!activeTaskItem) return;

        const overStatus = resolveStatus(overId);
        if (!overStatus || activeTaskItem.status === overStatus) return;

        setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: overStatus } : t)));
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeTaskItem = tasks.find((t) => t.id === activeId);
        if (!activeTaskItem) return;

        const overStatus = resolveStatus(overId) ?? (activeTaskItem.status as TodoStatus);

        const columnTasks = tasks.filter((t) => t.status === overStatus);
        const oldIndex = columnTasks.findIndex((t) => t.id === activeId);
        const overTaskIndex = columnTasks.findIndex((t) => t.id === overId);
        const newIndex = overTaskIndex >= 0 ? overTaskIndex : columnTasks.length - 1;

        if (oldIndex === -1) return;

        const reordered =
            oldIndex === newIndex ? columnTasks : arrayMove(columnTasks, oldIndex, newIndex);

        setTasks((prev) => {
            const others = prev.filter((t) => t.status !== overStatus);
            return [...others, ...reordered];
        });

        persistColumn(reordered);
    }

    return (
        <>
            <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
                <p className="text-black text-md font-bold">Kanban Board</p>

                {user && (
                    <div className="flex gap-3 mb-[10px] flex-wrap">
                        <button
                            onClick={() => setIsOpen(true)}
                            className="bg-blue-600 text-white px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold w-fit"
                        >
                            + Add Card
                        </button>

                        <button
                            className="p-3 py-2 border border-gray-200 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                            onClick={() => setEditMode((prev) => !prev)}
                        >
                            {editMode ? "🗃️ Ubah Urutan" : "📋 View Mode"}
                        </button>
                    </div>
                )}

                {/* DndContext now wraps the whole table, NOT the <tr> — fixes hydration error */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
                    <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                        <table className="relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 max-lg:w-[850px]">
                            <thead>
                                <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                                    {visibleColumns.map((col) => {
                                        const theme = themeClasses[col.theme];
                                        return (
                                            <th key={col.key}>
                                                {col.label}
                                                <span
                                                    className={`w-[10px] h-[10px] rounded-full inline-block ms-2 ${theme.card || "bg-gray-200"
                                                        }`}
                                                />
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>

                            <tbody>
                                <tr className="h-[50px] px-2 items-center">
                                    {loading ? (
                                        <td colSpan={visibleColumns.length} className="text-center text-gray-400 py-6">
                                            Memuat card...
                                        </td>
                                    ) : (
                                        visibleColumns.map((col) => {
                                            const theme = themeClasses[col.theme];
                                            const colTasks = grouped[col.key];

                                            return (
                                                <td key={col.key} className="p-3 border border-gray-200 align-top">
                                                    <SortableContext
                                                        id={`col-${col.key}`}
                                                        items={colTasks.map((t) => t.id)}
                                                        strategy={verticalListSortingStrategy}
                                                    >
                                                        <DroppableColumn id={`col-${col.key}`}>
                                                            {colTasks.map((task) => (
                                                                <SortableTaskCard
                                                                    key={task.id}
                                                                    task={task}
                                                                    editMode={editMode}
                                                                    theme={theme}
                                                                    onOpen={() => {
                                                                        setSelected({ task, login: isLoggedIn });
                                                                        setOpenEdit(true);
                                                                    }}
                                                                />
                                                            ))}
                                                        </DroppableColumn>
                                                    </SortableContext>
                                                </td>
                                            );
                                        })
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <DragOverlay dropAnimation={{ duration: 220, easing: "cubic-bezier(0.25, 1, 0.5, 1)" }}>
                        {activeTask ? (
                            <div
                                className={`flex flex-col gap-2 p-3 rounded-lg shadow-2xl rotate-2 scale-105 w-[220px] ${colorClasses[activeTask.tipe] ?? "border border-black bg-white"
                                    }`}
                            >
                                <TaskCardContent
                                    task={activeTask}
                                    theme={
                                        themeClasses[
                                        todoColumns.find((c) => c.key === activeTask.status)?.theme ?? "blueStat"
                                        ]
                                    }
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            <TodoModal open={isOpen} onClose={() => setIsOpen(false)} />
            <TodoModalView open={openEdit} onClose={() => setOpenEdit(false)} data={selected} />
        </>
    );
}