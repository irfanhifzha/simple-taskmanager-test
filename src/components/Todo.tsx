import { useEffect, useState } from "react";
import {
    collection,
    onSnapshot,
    query,
    orderBy,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";

import { db } from "../firebase";

export type TodoEvent = {
    id: string;

    order: number;
    status: string;
    title: string;
    subtitle: string;
    description: string;

    createdAt: Timestamp;
    updatedAt: Timestamp;
};


export default function Home() {

    // utama dasar
    const [tasks, setTasks] = useState<TodoEvent[]>([]);

    useEffect(() => {
        const q = query(
            collection(db, "todo"),
            orderBy("order", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TodoEvent[];

            setTasks(data);
        });

        return () => unsubscribe();
    }, []);

    const todo = tasks.filter((t) => t.status === "todo");
    const progress = tasks.filter((t) => t.status === "progress");
    const done = tasks.filter((t) => t.status === "done");


    // modal functions
    const openAddModal = () => {
        setEditId(null);
        setForm({
            title: "",
            subtitle: "",
            description: "",
            status: "todo",
            order: 0,
        });
        setIsOpen(true);
    };

    const openEditModal = (task : any) => {
        setEditId(task.id);
        setForm(task);
        setIsOpen(true);
    };

    const handleChange = (e : any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const [isOpen, setIsOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        description: "",
        status: "todo",
        order: 0,
    });

    const handleDelete = async (id : string) => {
        await deleteDoc(doc(db, "todo", id));
    };

    const handleSubmit = async (e : any) => {
        e.preventDefault();

        if (editId) {
            const ref = doc(db, "todo", editId);

            await updateDoc(ref, {
                ...form,
                updatedAt: serverTimestamp(),
            });
        } else {
            await addDoc(collection(db, "todo"), {
                ...form,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
        }

        setIsOpen(false);
    };



    return (
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">




            {/* TOP BUTTON */}
            <div className="flex gap-3 mb-[10px] flex-wrap">
                <button
                    onClick={openAddModal}
                    className="bg-blue-600 text-white px-3 py-2 border border-gray-200 outline-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold w-fit">
                    + Add Todo
                </button>
            </div>

            <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                <table className={`relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200`}>

                    {/* HEADER */}
                    <thead>
                        <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                            <th>Todo</th>
                            <th>Progress</th>
                            <th>Done</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody>
                        <tr className="h-[50px] px-2 items-center">

                            {/* TODO */}
                            <td className="p-3 border border-gray-200 align-top">
                                <div className="flex flex-col gap-3">
                                    {todo.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-3 rounded-lg border border-blue-200 bg-blue-100 shadow-sm hover:shadow-md transition"
                                        >
                                            {task.title && (<h1 className="text-lg text-blue-600 font-semibold">{task.title}</h1>)}
                                            {task.subtitle && (<h2 className="text-xs text-blue-600 font-semibold">{task.subtitle}</h2>)}
                                            {task.description && (<h2 className="my-5 text-xs text-blue-600">{task.description}</h2>)}

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => openEditModal(task)}
                                                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </td>

                            {/* PROGRESS */}
                            <td className="p-3 border border-gray-200 align-top ">
                                <div className="flex flex-col gap-3">
                                    {progress.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-3 rounded-lg border border-yellow-100 bg-yellow-50 shadow-sm hover:shadow-md transition"
                                        >
                                            {task.title && (<h1 className="text-lg text-yellow-600 font-semibold">{task.title}</h1>)}
                                            {task.subtitle && (<h2 className="text-xs text-yellow-600 font-semibold">{task.subtitle}</h2>)}
                                            {task.description && (<h2 className="my-5 text-xs text-yellow-600">{task.description}</h2>)}

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => openEditModal(task)}
                                                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-md"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </td>

                            {/* DONE */}
                            <td className="p-3 border border-gray-200 align-top">
                                <div className="flex flex-col gap-3">
                                    {done.map((task) => (
                                        <div
                                            key={task.id}
                                            className="p-3 rounded-lg border border-green-100 bg-green-50 shadow-sm hover:shadow-md transition"
                                        >
                                            {task.title && (<h1 className="text-lg text-green-600 font-semibold">{task.title}</h1>)}
                                            {task.subtitle && (<h2 className="text-xs text-green-600 font-semibold">{task.subtitle}</h2>)}
                                            {task.description && (<h2 className="my-5 text-xs text-green-600">{task.description}</h2>)}

                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => openEditModal(task)}
                                                    className="px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(task.id)}
                                                    className="px-2 py-1 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </td>

                        </tr>
                    </tbody>
                </table>
            </div>

            {/* MODAL */}
            {isOpen && (
                <div className="fixed inset-0 z-30 bg-black/40 flex justify-center items-center">
                    <div className="bg-white w-[380px] rounded-xl shadow-xl p-5">

                        <h2 className="text-lg font-semibold mb-4">
                            {editId ? "Edit Todo" : "Add Todo"}
                        </h2>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="Title"
                                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <input
                                name="subtitle"
                                value={form.subtitle}
                                onChange={handleChange}
                                placeholder="Subtitle"
                                className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="border rounded-md p-2 text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />

                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="border rounded-md p-2 text-sm"
                            >
                                <option value="todo">Todo</option>
                                <option value="progress">Progress</option>
                                <option value="done">Done</option>
                            </select>

                            <button className="bg-blue-600 text-white py-2 rounded-md text-sm hover:bg-blue-700 transition">
                                {editId ? "Update Task" : "Create Task"}
                            </button>

                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-gray-500 hover:text-black"
                            >
                                Cancel
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}