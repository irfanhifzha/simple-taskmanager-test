import { useState, useEffect } from "react";
import {
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import Modal from "./Modal";

import {
    statusStyles,
    statusStylesStatus,
} from "../types/scheduleTypes";


export default function TodoModal({ open, onClose, data }: any) {

    const [editMode, setEditMode] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChange = (e: any) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleClose = () => {
        setErrors({});
        setFormError(null);
        setLoading(false);
        onClose();
    };


    const handleDelete = async () => {
        if (!data?.task.id) return;


        const confirmed = window.confirm(
            // `Delete "${data?.task?.length > 13 ? `${data.task.slice(0, 13)}...` : data?.task || "null"} [${data?.tanggal?.length > 1 ? `${startTanggal}-${endTanggal}` : `${startTanggal}` || "null"} ${monthLabel} ${tahun}]" dari rencana?`

            `Delete This?`
        );

        if (confirmed) {
            await deleteDoc(doc(db, "calendars", data.task.id));

            onClose();
        }
    };



    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!form.title.trim()) errors.title = "Judul wajib diisi";
        if (!form.status.trim()) errors.status = "Status wajib diisi";
        if (!form.tipe.trim()) errors.tipe = "Tipe wajib diisi";

        return errors;
    };

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formError, setFormError] = useState<string | null>(null);

    const handleUpdate = async (e: any) => {
        if (loading) return;

        const validationErrors = validateForm();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setFormError("Mohon lengkapi form terlebih dahulu");
            return;
        }

        setErrors({});
        setFormError(null);
        setLoading(true);

        try {
            await updateDoc(doc(db, "todos", data.task.id), {
                ...rest,
                peoples: (peoples || "")
                    .split(",")
                    .map((p) => p.trim())
                    .filter(Boolean),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });


            handleClose();
        } catch (err) {
            setFormError(`(${err})\n\nGagal menyimpan data`);
        } finally {
            setLoading(false);
        }
    };

    const [form, setForm] = useState({
        title: "",
        subtitle: "",
        desc: "",
        status: "todo",
        order: 0,
        tipe: "",
        note: "",
        peoples: "",
    });

    const { peoples, ...rest } = form;


    // LOAD DATA
    useEffect(() => {
        if (open && data?.task) {


            setForm({
                ...data.task,
                peoples: (data.task.peoples || []).join(", "),
            });

            setEditMode(false);
        }
    }, [open, data]);










    return (
        <Modal open={open} onClose={handleClose}>

            <h2>Detail Card</h2>


            <form onSubmit={handleUpdate}>

                {editMode ? (
                    <div>
                        <label htmlFor="title">📝 Title<span>*</span></label>
                        <input className="w-full"
                            id="title"
                            name="title"
                            value={form.title}
                            placeholder="Title todo"
                            onChange={handleChange}
                        />
                    </div>) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                        <div>
                            <label>📝 Judul</label>
                            <div className="flex mb-3 items-center pt-1">
                                <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStyles[data?.task?.tipe] || "bg-gray-200"}`}></div>
                                <div className="pt-1">{form.title}</div>
                            </div>
                        </div>

                        <div>
                            <label>🚩 Status</label>
                            <div className="flex mb-3 items-center pt-1">
                                <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStylesStatus[data?.task?.status] || "bg-gray-200"}`}></div>
                                <div className="pt-1">{form.status?.charAt(0).toUpperCase() + form.status?.slice(1)}</div>
                            </div>
                        </div>
                    </div>
                )}

                {editMode ? (
                    <div>
                        <label htmlFor="subtitle">📢 Subheading<span>*</span></label>
                        <input className="w-full"
                            id="subtitle"
                            name="subtitle"
                            value={form.subtitle}
                            placeholder="Subheading todo"
                            onChange={handleChange}
                        />
                    </div>) : (
                    data?.task?.desc && (
                        <div>
                            <label>📢 Subheading</label>
                            <div className="mt-1 py-1">
                                <p className="whitespace-pre-line">{form.subtitle}</p>
                            </div>
                        </div>
                    )
                )}

                {editMode && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                        <div>
                            <label htmlFor="status">🚩 Status<span>*</span></label>
                            <select className="w-full"
                                id="status"
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                            >
                                <option value="todo">Todo</option>
                                <option value="progress">Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
                            <select className="w-full" id="tipe" name="tipe" value={form.tipe} onChange={handleChange}>
                                <option value="" disabled hidden>Pilih Warna</option>
                                <option value="green">Hijau</option>
                                <option value="blue">Biru</option>
                                <option value="red">Merah</option>
                                <option value="orange">Oranye</option>
                                <option value="purple">Purple</option>
                                <option value="abu">Abu</option>
                            </select>
                        </div>
                    </div>
                )}




                {editMode ? (
                    <>
                        <label htmlFor="peoples">👥 Pihak Terkait</label>
                        <input
                            id="peoples"
                            placeholder="A, B, .. (dipisah dengan koma)"
                            value={form.peoples}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    data?.task?.peoples?.length > 0 && (
                        <div>
                            <label>👥 Pihak Terkait</label>
                            <div className="mt-2 flex flex-wrap gap-2  mb-4">
                                {form.peoples
                                    ?.split(", ")
                                    .filter(Boolean)
                                    .map((person, index) => (
                                        <div key={index} className="rounded-lg px-3 py-1 bg-gray-100">
                                            {person}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )
                )}



                {editMode ? (
                    <>
                        <label htmlFor="desc">💬 Deskripsi</label>
                        <textarea
                            id="desc"
                            rows={4}
                            placeholder="Deskripsi rencana"
                            value={form.desc}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    data?.task?.desc && (
                        <div>
                            <label>💬 Deskripsi</label>
                            <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                                <p className="mb-0! whitespace-pre-line">{form.desc}</p>
                            </div>
                        </div>
                    )
                )}


                {editMode ? (<>
                    <label htmlFor="note">📌 Note / Link URL</label>
                    <textarea
                        rows={4}
                        id="note"
                        placeholder="Note rencana / Link url"
                        value={form.note}
                        onChange={handleChange}
                    />
                </>)
                    : (
                        data?.task?.note && (
                            <div>
                                <label>📌 Note / Link URL</label>
                                <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                                    <p className="mb-0! whitespace-pre-line text-blue-500">{form.note}</p>
                                </div>
                            </div>
                        )
                    )}

                {formError && (
                    <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                        <div className="whitespace-pre-line break-words">
                            {formError}
                        </div>

                        {Object.keys(errors).length > 0 && (
                            <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                                {errors.title && <li>• {errors.title}</li>}
                                {errors.status && <li>• {errors.status}</li>}
                                {errors.tipe && <li>• {errors.tipe}</li>}
                            </ul>
                        )}
                    </div>
                )}




                {/* EDIT TOGGLE */}
                {/* USER CONTROLS */}
                {data?.login && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        {/* NOT IN EDIT MODE */}
                        {!editMode && (
                            <>
                                <button type="button"
                                    onClick={() => {
                                        setEditMode(true);
                                    }}
                                >
                                    ✏️ Edit
                                </button>

                                <button type="button" className="active:cursor-default! border-red-300! hover:bg-red-700 hover:text-white! active:bg-red-800! active:text-white!"
                                    onClick={handleDelete}
                                >
                                    <div>🗑️ Delete</div>
                                </button>
                            </>
                        )}

                        {/* EDIT MODE */}
                        {editMode && (
                            <>
                                <button type="button"
                                    onClick={() => {

                                        setForm({
                                            ...data.task,
                                            peoples: (data.task.peoples || []).join(", "),
                                        });

                                        setEditMode(false);
                                    }}
                                >
                                    ❌ Cancel
                                </button>

                                <button type="button"
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    className={`border border-gray-200! px-4 py-2 rounded-md transition ${loading ? "bg-gray-400! opacity-50 cursor-not-allowed!" : "hover:bg-gray-800 hover:text-white! active:bg-gray-900! active:text-white! cursor-pointer"}`}>
                                    {loading ? "⏳ Loading..." : "💾 Simpan"}
                                </button>
                            </>


                        )}
                    </div>
                )}

            </form>
        </Modal >
    );
}