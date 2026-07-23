import { useEffect, useState, useRef } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
    doc,
    writeBatch
} from "firebase/firestore";

import { db } from "../firebase";

import {
    TodoEvent,
    TodoStatus,
    colorClasses,
    Props,
} from "../types/scheduleTypes";

import TodoModal from "./TodoModal";
import TodoModalView from "./TodoModalUpdate";

import TodoGantt from "../components/TodoGantt";

import {
    DndContext,
    DragOverlay,
    closestCenter,
    PointerSensor,
    TouchSensor,
    useDroppable,
    useSensor,
    useSensors,
    MeasuringStrategy,
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
    grayStat: { card: "bg-gray-400", title: "text-gray-400" },
};

type Selected = {
    task: TodoEvent;
    order?: number;
    login?: boolean;
};

const truncate = (text: string, max = 20) =>
    text.length > max ? text.slice(0, max).trimEnd() + "..." : text;

const truncateVIEW = (text: string, max = 1500) =>
    text.length > max ? text.slice(0, max).trimEnd() + "..." : text;

/* ---------- Shared card content ---------- */
function TaskCardContent({ task, theme, editMode, isValidKategori }: { isValidKategori: boolean; editMode: boolean; task: TodoEvent; theme: { card: string; title: string } }) {
    return (
        <>
            <div className="flex items-center gap-2">
                {!isValidKategori && (<div className="text-xs text-red-700 bg-white px-2 py-1 rounded-lg">[{task.kategori}]</div>)}
                <div className={`h-2 w-full rounded-md ${theme.card}`} />
                {editMode && (<div className={`h-2 w-2 rounded-md ${theme.card} animate-[pulse_0.75s_infinite]`} />)}
            </div>

            {task.title && (
                <button className={`flex justify-start text-start select-text! mt-1 text-lg font-bold cursor-pointer`}>
                    {editMode ? truncate(task.title) : truncateVIEW(task.title)}
                </button>
            )}

            {task.subtitle && (
                <p className="-mt-1 text-xs font-semibold">
                    {editMode ? truncate(task.subtitle) : truncateVIEW(task.subtitle)}
                </p>
            )}

            {task.peoples.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {task.peoples.map((person, idx) => (
                        <div key={idx} className="text-black px-2 py-1 rounded-lg bg-white w-fit">
                            {editMode ? truncate(person) : truncateVIEW(person)}
                        </div>
                    ))}
                </div>
            )}

            {(task.desc || task.note) && (
                <div className="flex flex-col gap-2 bg-white px-3 py-2 rounded-lg text-black">
                    {task.desc && (
                        <p className="font-medium whitespace-pre-line">
                            {editMode ? truncate(task.desc) : truncateVIEW(task.desc)}
                        </p>
                    )}
                    {task.note && (
                        <p className="text-blue-500 whitespace-pre-line">
                            {editMode ? truncate(task.note) : truncateVIEW(task.note)}
                        </p>
                    )}
                </div>
            )}

            <div className="flex flex-col gap-2 [&_p]:text-[10px]!">

                {task.status === "todo" && task.createdAt &&
                    (<div className="flex items-center bg-white px-2 py-1 rounded-md">
                        <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-red-600! transition-all duration-200"/>
                        <p className=" text-gray-700">
                            Dibuat pada - {" "}
                            {task?.createdAt ? (() => {
                                const d = task.createdAt.toDate();
                                const date = `${d.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })} ${d.toLocaleTimeString('en-GB', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}`;
                                return editMode ? truncate(date) : truncateVIEW(date);
                            })() : ""}
                        </p>
                    </div>)
                }

                {task.status === "progress" && task.startAt &&
                    (<div className="flex items-center bg-white px-2 py-1 rounded-md">
                        <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-blue-600! transition-all duration-200 animate-[pulse_0.75s_infinite]"/>
                        <p className="text-gray-700">
                            Dimulai dari - {" "}
                            {(() => {
                                const d = task.startAt.toDate();
                                const date = `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                                return editMode ? truncate(date) : truncateVIEW(date);
                            })()}
                        </p>
                    </div>)
                }

                {task.status === "done" && (
                    task.doneAt ? (<>
                        {task.startAt ? (<div className="flex items-center bg-white px-2 py-1 rounded-md">
                            <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-blue-600! transition-all duration-200"/>
                            <p className="text-gray-700">
                                Dimulai pada - {" "}
                                {(() => {
                                    const d = task.startAt?.toDate();
                                    if (!d) return "-";
                                    const date = `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                                    return editMode ? truncate(date) : truncateVIEW(date);
                                })()}
                            </p>
                        </div>) : (<div className="flex items-center bg-white px-2 py-1 rounded-md">
                            <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-red-600! transition-all duration-200"/>
                            <p className="text-gray-700">
                                Dibuat pada - {" "}
                                {(() => {
                                    const d = task.createdAt?.toDate();
                                    if (!d) return "-";
                                    const date = `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                                    return editMode ? truncate(date) : truncateVIEW(date);
                                })()}
                            </p>
                        </div>

                        )}
                        <div className="flex items-center bg-white px-2 py-1 rounded-md">
                            <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-green-600! transition-all duration-200"/>
                            <p className="text-gray-700">
                                Selesai pada - {" "}
                                {(() => {
                                    const d = task.doneAt.toDate();
                                    const date = `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                                    return editMode ? truncate(date) : truncateVIEW(date);
                                })()}
                            </p>
                        </div>
                    </>) : (
                        <div className="flex items-center bg-white px-2 py-1 rounded-md">
                            <span className="inline-block w-2 h-2 me-1 align-middle rounded-full bg-red-600! transition-all duration-200"/>
                            <p className="text-gray-700">
                                Dibuat pada - {" "}
                                {(() => {
                                    const d = task.createdAt.toDate();
                                    const date = `${d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })} ${d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
                                    return editMode ? truncate(date) : truncateVIEW(date);
                                })()}
                            </p>
                        </div>
                    )
                )}


            </div>
        </>
    );
}

/* ---------- Sortable card ---------- */
function SortableTaskCard({
    task,
    editMode,
    theme,
    isValidKategori,
    onOpen,
}: {
    isValidKategori: boolean;
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
            className={`flex flex-col gap-2 flex-wrap p-3 rounded-lg transition! duration-200 ease hover:-translate-y-0.5 active:scale-98 wrap-break-word overflow-hidden [&_div]:w-full
                ${colorClasses[task.tipe] ?? "border border-black bg-white"}
                ${editMode ? "[&_button]:cursor-grab! cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md touch-none" : "cursor-pointer"}`}
        >
            <TaskCardContent task={task} theme={theme} editMode={editMode} isValidKategori={isValidKategori} />
        </div>
    );
}

/* ---------- Droppable column body ---------- */
function DroppableColumn({ id, children, isEmpty }: { id: string; children: React.ReactNode; isEmpty: boolean }) {
    const { setNodeRef, isOver } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col gap-3 min-h-[60px] rounded-lg transition-colors duration-200 ${isOver ? "bg-gray-100" : ""
                }`}
        >
            {isEmpty && (
                <div className="h-[60px] rounded-lg border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-[10px]">
                    Kosong
                </div>
            )}
            {children}
        </div>
    );
}

export default function TodoBoard({ kategori, user }: Props) {
    const isValidKategori = !!kategori;
    const isLoggedIn = !!user;

    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [viewRoad, setViewRoad] = useState(true);

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

    // const visibleColumns = todoColumns


    useEffect(() => {
        const q = query(collection(db, "todos"), orderBy("order", "asc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as TodoEvent[];

                setTasks(data);
                setLoading(false);
            },
            (err) => console.error("todos onSnapshot error:", err)
        );

        return () => unsubscribe();
    }, []); // no `kategori` dependency needed now — query doesn't depend on it

    const filterByKategori = (t: TodoEvent) =>
        !kategori || t.kategori === kategori;

    const grouped: Record<TodoStatus, TodoEvent[]> = {
        todo: tasks.filter((t) => filterByKategori(t) && t.status === "todo"),
        progress: tasks.filter((t) => filterByKategori(t) && t.status === "progress"),
        done: tasks.filter((t) => filterByKategori(t) && t.status === "done"),
        archived: tasks.filter((t) => filterByKategori(t) && t.status === "archived"),
    };

    async function persistColumn(
        columnTasks: TodoEvent[],
        statusChangedTaskId?: string,
        newStatus?: TodoStatus
    ) {
        const batch = writeBatch(db);
        columnTasks.forEach((t, idx) => {
            const data: Record<string, unknown> = {
                order: idx * 10,
                status: t.status,
                // editAt: Timestamp.now(),
            };

            if (t.id === statusChangedTaskId) {
                if (newStatus === "todo") {
                    data.startAt = Timestamp.now();
                } else if (newStatus === "progress") {
                    if (!t.startAt) {
                        data.startAt = Timestamp.now();
                    }
                } else if (newStatus === "done") {
                    data.doneAt = Timestamp.now();
                }
            }

            batch.update(doc(db, "todos", t.id), data);
        });
        try {
            await batch.commit();
        } catch (err) {
            console.error("Failed to persist order:", err);
        }
    }

    const dragOverRAF = useRef<number | null>(null);
    const isDraggingRef = useRef(false);

    function resolveStatus(overId: string, taskList: TodoEvent[]): TodoStatus | null {
        if (overId.startsWith("col-")) {
            return overId.replace("col-", "") as TodoStatus;
        }
        const overTask = taskList.find((t) => t.id === overId);
        return overTask ? (overTask.status as TodoStatus) : null;
    }

    function handleDragStart(event: DragStartEvent) {
        isDraggingRef.current = true;
        const task = tasks.find((t) => t.id === event.active.id);
        setActiveTask(task ?? null);
    }

    function handleDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;
        if (activeId === overId) return;

        // Guard: never let more than one pending update queue up per frame.
        if (dragOverRAF.current !== null) return;

        dragOverRAF.current = requestAnimationFrame(() => {
            dragOverRAF.current = null;
            if (!isDraggingRef.current) return;

            setTasks((prev) => {
                const activeIndex = prev.findIndex((t) => t.id === activeId);
                if (activeIndex === -1) return prev;
                const activeTaskItem = prev[activeIndex];

                const overStatus = resolveStatus(overId, prev);
                if (!overStatus) return prev;

                const overIndex = prev.findIndex((t) => t.id === overId);

                // Hovering the empty area of a column (over.id is "col-xxx",
                // not a specific card) — just flip status, nothing to reorder.
                if (overIndex === -1) {
                    if (activeTaskItem.status === overStatus) return prev;
                    const next = prev.slice();
                    next[activeIndex] = { ...activeTaskItem, status: overStatus };
                    return next;
                }

                // Same column: pure reorder.
                if (activeTaskItem.status === overStatus) {
                    if (activeIndex === overIndex) return prev;
                    return arrayMove(prev, activeIndex, overIndex);
                }

                // Different column: flip status AND slot it in at the
                // hovered position in one go.
                const next = prev.slice();
                next[activeIndex] = { ...activeTaskItem, status: overStatus };
                return arrayMove(next, activeIndex, overIndex);
            });
        });
    }

    function handleDragEnd(event: DragEndEvent) {
        isDraggingRef.current = false;

        if (dragOverRAF.current !== null) {
            cancelAnimationFrame(dragOverRAF.current);
            dragOverRAF.current = null;
        }

        const { active, over } = event;
        const draggedTaskSnapshot = activeTask; // captured on drag start
        setActiveTask(null);
        if (!over || !draggedTaskSnapshot) return;

        const activeId = active.id as string;

        // `tasks` is already in its correct final shape/order thanks to
        // handleDragOver — nothing left to compute, just read and persist it.
        const currentTask = tasks.find((t) => t.id === activeId);
        if (!currentTask) return;

        const statusChanged = draggedTaskSnapshot.status !== currentTask.status;
        const columnTasks = tasks.filter((t) => t.status === currentTask.status);

        persistColumn(
            columnTasks,
            statusChanged ? activeId : undefined,
            currentTask.status as TodoStatus
        );
    }

    useEffect(() => {
        return () => {
            if (dragOverRAF.current !== null) {
                cancelAnimationFrame(dragOverRAF.current);
            }
        };
    }, []);

    return (
        <>
            <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
                <p className="text-black text-md font-bold">Kanban Board</p>

                <div className="flex gap-3 mb-[10px] flex-wrap">

                    <button
                        className="p-3 py-2 border border-gray-200 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setViewRoad((prev) => !prev)}
                    >
                        {viewRoad ? "👀 Hide Timeline" : "🔍 Show Timeline"}
                    </button>

                    {user && (
                        <>

                            <button
                                className="p-3 py-2 border border-gray-200 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                                onClick={() => setEditMode((prev) => !prev)}
                            >
                                {editMode ? "🗃️ Ubah Urutan" : "📋 View Mode"}
                            </button>

                            <button
                                onClick={() => setIsOpen(true)}
                                className="bg-blue-600 text-white px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold w-fit"
                            >
                                + Tambah Todo
                            </button>


                        </>)}

                </div>

                {/* DndContext now wraps the whole table, NOT the <tr> — fixes hydration error */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    measuring={{
                        droppable: {
                            strategy: MeasuringStrategy.BeforeDragging,
                        },
                    }}
                >
                    <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards] max-h-[1200px]">
                        <table className={`relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200  ${editMode ? "max-lg:w-[1000px]" : " max-lg:w-[850px]"}`}>
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
                                                        <DroppableColumn id={`col-${col.key}`} isEmpty={colTasks.length === 0}>
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
                                                                    isValidKategori={isValidKategori}
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
                                    editMode={editMode}
                                    isValidKategori={isValidKategori}
                                />
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>


            {viewRoad && (<TodoGantt category={kategori} />)}

            <TodoModal category={kategori} open={isOpen} onClose={() => setIsOpen(false)} />
            <TodoModalView open={openEdit} onClose={() => setOpenEdit(false)} data={selected} />
        </>
    );
}