import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
} from "firebase/firestore";
import type { User } from "firebase/auth";
import { db } from "../firebase";

import {
    Category,
    colorClasses,
    StatusColor,
} from "../types/scheduleTypes";

import TodoModal from "./TodoModal";
import TodoModalView from "./TodoModal";



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




export type TodoStatus = "todo" | "progress" | "done";

export const todoColumns: { key: TodoStatus; label: string; theme: string }[] = [
    { key: "todo", label: "Todo", theme: "blueStat" },
    { key: "progress", label: "Progress", theme: "yellowStat" },
    { key: "done", label: "Done", theme: "greenStat" },
];

type Props = {
    kategori: Category;
    user: User | null;
};

type Selected = {
    task: TodoEvent;
    order?: number;
    login?: boolean;
};

export default function TodoBoard({ kategori, user }: Props) {
    const isLoggedIn = !!user;

    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<Selected | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [openEdit, setOpenEdit] = useState(false);


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
    };

    const [isOpen, setIsOpen] = useState(false);


    const themeClasses: Record<string, { card: string; title: string }> = {
        blueStat: {
            card: "border border-blue-200 bg-blue-100",
            title: "text-blue-600",
        },
        yellowStat: {
            card: "border border-orange-200 bg-orange-100",
            title: "text-orange-600",
        },
        greenStat: {
            card: "border border-green-200 bg-green-100",
            title: "text-green-600",
        },
    };



    return (<>
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">




            {/* TOP BUTTON */}
            {user && (
                <div className="flex gap-3 mb-[10px] flex-wrap">
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-blue-600 text-white px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold w-fit">
                        + Add Card
                    </button>

                    <button className="p-3 py-2 border border-gray-200 rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setEditMode(prev => !prev)}>
                        {editMode ? "🗃️ Ubah Urutan" : "📋 View Mode"}
                        {/* 📋 View Mode || 🗃️ Rearrange Mode || ✏️ Update Data || 🔒 Exit Edit Mode || */}
                    </button>
                </div>
            )}

            <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                <table className="relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 max-lg:w-[850px]">
                    <thead>
                        <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                            {todoColumns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        <tr className="h-[50px] px-2 items-center">
                            {loading ? (
                                <td colSpan={todoColumns.length} className="text-center text-gray-400 py-6">
                                    Memuat card...
                                </td>
                            ) : (
                                todoColumns.map((col) => {
                                    const theme = themeClasses[col.theme];

                                    return (
                                        <td key={col.key} className="p-3 border border-gray-200 align-top">
                                            <div className="flex flex-col gap-3">
                                                {grouped[col.key].map((task) => (
                                                    <div
                                                        onClick={
                                                            !editMode
                                                                ? () => {
                                                                    setSelected({ task, login: isLoggedIn });
                                                                    setOpenEdit(true);
                                                                }
                                                                : undefined
                                                        }
                                                        key={task.id}
                                                        className={`flex flex-col gap-2 flex-wrap p-3 rounded-lg transition duration-200 ease hover:-translate-y-0.5 active:scale-98 ${colorClasses[task.tipe] ?? "border border-black bg-white"} ${!editMode ? "cursor-pointer" : ""}`}
                                                    >
                                                        <div className={`h-5 w-5 border-5! rounded-md bg-white! ${theme.card}`}></div>
                                                        {task.title && <button className={`flex justify-start ${!editMode ? "cursor-pointer" : ""} mt-2 text-lg font-bold`}>{task.title}</button>}
                                                        {task.subtitle && <p className={`-mt-1 text-xs font-semibold`}>{task.subtitle}</p>}
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

                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                    );
                                })
                            )}
                        </tr>
                    </tbody>
                </table>
            </div>


        </div>

        <TodoModal open={isOpen} onClose={() => setIsOpen(false)} />
        <TodoModalView open={openEdit} onClose={() => setOpenEdit(false)} data={selected} />

    </>
    );
}