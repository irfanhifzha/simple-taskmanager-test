import { useState, useEffect } from "react";
import {
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
    Timestamp,
    deleteField,
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
        setProgressDate("");
        setProgressTime("");
        setDoneDate("");
        setDoneTime("");

        setErrors({});
        setFormError(null);
        setLoading(false);
        onClose();
    };


    const handleDelete = async () => {
        if (!data?.task.id) return;


        const confirmed = window.confirm(
            `Delete "${data?.task?.title.length > 13 ? `${data.task.title.slice(0, 13)}...` : data?.task.title || "null"} [${data?.task?.status ? data.task.status : "null"}]" dari kanban?`
        );

        if (confirmed) {
            await deleteDoc(doc(db, "todos", data.task.id));

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

            const dataToUpdate: any = {
                ...rest,
                peoples: (people || "")
                    .split(",")
                    .map((p) => p.trim())
                    .filter(Boolean),
                editAt: serverTimestamp(),
            };

            if (progressTarget instanceof Timestamp) {
                dataToUpdate.progressTarget = progressTarget;
            } else if (progressTarget === null) {
                dataToUpdate.progressTarget = deleteField();
            }

            if (doneTarget instanceof Timestamp) {
                dataToUpdate.doneTarget = doneTarget;
            } else if (doneTarget === null) {
                dataToUpdate.doneTarget = deleteField();
            }

            await updateDoc(doc(db, "todos", data.task.id), dataToUpdate);


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
        people: "",
    });

    const { people, ...rest } = form;


    // LOAD DATA
    const loadTask = () => {
        if (!data?.task) return;

        setForm({
            ...data.task,
            people: (data.task.peoples || []).join(", "),
        });

        const progress = timestampToDateTime(data.task.progressTarget);
        const done = timestampToDateTime(data.task.doneTarget);

        setProgressDate(progress.date);
        setProgressTime(progress.time);

        setDoneDate(done.date);
        setDoneTime(done.time);

        setEditMode(false);
    };

    useEffect(() => {
        if (!open) return;
        loadTask();
    }, [open]);



    // OPTIONAL TARGET
    const [progressDate, setProgressDate] = useState("");
    const [progressTime, setProgressTime] = useState("");

    const [doneDate, setDoneDate] = useState("");
    const [doneTime, setDoneTime] = useState("");

    function toTimestamp(date: string, time: string) {
        if (!date || !time) return null;

        return Timestamp.fromDate(new Date(`${date}T${time}`));
    }

    const progressTarget = toTimestamp(progressDate, progressTime);
    const doneTarget = toTimestamp(doneDate, doneTime);



    // OPTIONAL TARGET LOAD HELPER
    function timestampToDateTime(ts?: Timestamp) {
        if (!ts) return { date: "", time: "" };

        const d = ts.toDate();

        const date = d.toISOString().split("T")[0];
        const time = d.toTimeString().slice(0, 5); // HH:MM

        return { date, time };
    }






    return (
        <Modal open={open} onClose={handleClose}>

            <h2>Detail Card</h2>


            <form onSubmit={handleUpdate}>

                {editMode ? (

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">

                        <div>
                            <label htmlFor="title">📝 Title<span>*</span></label>
                            <input className="w-full"
                                id="title"
                                name="title"
                                value={form.title}
                                placeholder="Title"
                                onChange={handleChange}
                            />
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


                ) : (
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
                            <div className="flex mb-3 items-center py-1">
                                <div className={`mt-0.5 px-3 py-0.5 rounded-lg inline-block me-2 ${statusStylesStatus[data?.task?.status] || "bg-gray-200"}`}>
                                    <div className="text-white text-sm">{form.status?.charAt(0).toUpperCase() + form.status?.slice(1)}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {editMode ? (
                    <div>
                        <label htmlFor="subtitle">📢 Subheading</label>
                        <input className="w-full"
                            id="subtitle"
                            name="subtitle"
                            value={form.subtitle}
                            placeholder="Subheading"
                            onChange={handleChange}
                        />
                    </div>) : (
                    data?.task?.subtitle && (
                        <div>
                            <label>📢 Subheading</label>
                            <div className="mt-1 py-1">
                                <p className="whitespace-pre-line">{form.subtitle}</p>
                            </div>
                        </div>
                    )
                )}













                {editMode ? (
                    <>
                        <label htmlFor="peoples">👥 Pihak Terkait</label>
                        <input
                            id="peoples"
                            name="people"
                            placeholder="A, B, .. (dipisah dengan koma)"
                            value={form.people}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    data?.task?.peoples?.length > 0 && (
                        <div>
                            <label>👥 Pihak Terkait</label>
                            <div className="mt-2 flex flex-wrap gap-2  mb-4">
                                {form.people
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
                            name="desc"
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


                {editMode ? (
                    <>
                        <label htmlFor="note">📌 Note / Link URL</label>
                        <textarea
                            rows={4}
                            id="note"
                            name="note"
                            placeholder="Note rencana / Link url"
                            value={form.note}
                            onChange={handleChange}
                        />
                    </>
                ) : (
                    data?.task?.note && (
                        <div>
                            <label>📌 Note / Link URL</label>
                            <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                                <p className="mb-0! whitespace-pre-line text-blue-500">{form.note}</p>
                            </div>
                        </div>
                    )
                )}





                {/* OPTIONAL TARGET */}
                {editMode && form.status == "todo" && (
                    <div className="pt-4 mt-2 border-t-1 border-black">

                        <div className="text-gray-500 text-sm pointer-events-none mb-3">📂 Rencana Todo (Optional)</div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button type="button" className="w-fit! py-1! px-3! border-red-500! text-red-500!"
                                onClick={() => {
                                    setProgressDate("");
                                    setProgressTime("");
                                }}
                            >Clear Target Progress</button>
                            <button type="button" className="w-fit! py-1! px-3! border-red-500! text-red-500!"
                                onClick={() => {
                                    setDoneDate("");
                                    setDoneTime("");
                                }}
                            >Clear Target Done</button>
                        </div>
                        <div className="flex w-full flex-wrap">
                            <div>
                                <label htmlFor="progressTarget">Target Progress</label>
                                <div className="flex gap-3">
                                    <input
                                        id="progressTarget"
                                        type="date"
                                        value={progressDate}
                                        onChange={(e) => setProgressDate(e.target.value)}
                                    />

                                    <input
                                        type="time"
                                        value={progressTime}
                                        onChange={(e) => setProgressTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="doneTarget">Target Done</label>

                                <div className="flex gap-3">
                                    <input
                                        id="doneTarget"
                                        type="date"
                                        value={doneDate}
                                        onChange={(e) => setDoneDate(e.target.value)}
                                    />

                                    <input
                                        type="time"
                                        value={doneTime}
                                        onChange={(e) => setDoneTime(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {editMode && form.status == "progress" && (
                    <div className="pt-4 mt-2 border-t-1 border-black">
                        <div className="text-gray-500 text-sm pointer-events-none mb-2">📂 Rencana Progress (Optional)</div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <button type="button" className="w-fit! py-1! px-3! border-red-500! text-red-500!"
                                onClick={() => {
                                    setDoneDate("");
                                    setDoneTime("");
                                }}
                            >Clear Target Done</button>
                        </div>

                        <label htmlFor="doneTarget">Target Done</label>
                        <div className="flex gap-3 w-full">
                            <input
                                id="doneTarget"
                                type="date"
                                value={doneDate}
                                onChange={(e) => setDoneDate(e.target.value)}
                            />

                            <input
                                type="time"
                                value={doneTime}
                                onChange={(e) => setDoneTime(e.target.value)}
                            />

                        </div>

                    </div>
                )}












                {!editMode && (

                    data?.task?.createdAt && (
                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <div>
                                <label>📪 Dibuat Pada</label>
                                <div className="mt-1 py-1">
                                    <p className="text-gray-400 text-xs">{data.task.createdAt.toDate().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} {data.task.createdAt.toDate().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>

                            <div>
                                <label>✒️ Diedit Pada</label>
                                <div className="mt-1 py-1">
                                    <p className="text-gray-400 text-xs">
                                        {data.task.editAt ? (() => {
                                            const date = data.task.editAt.toDate();
                                            return `${date.toLocaleDateString('id-ID', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                            })} ${date.toLocaleTimeString('en-GB', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}`;
                                        })() : 'Belum pernah diedit'}
                                    </p>
                                </div>
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
                                <button type="button" onClick={loadTask}>
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