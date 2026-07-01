import { useState } from "react";
import {
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import Modal from "./Modal";


export default function TodoModal({ open, onClose }: any) {

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
        setForm((prev) => ({
            ...prev,
            title: "",
            subtitle: "",
            tipe: "",
            status: "todo",
        }));
        onClose();
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

    const handleSubmit = async (e: any) => {
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
            await addDoc(collection(db, "todos"), {
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








    return (
        <Modal open={open} onClose={handleClose}>

            <h2>+ Tambah Card</h2>

            <form onSubmit={handleSubmit}>


                <label htmlFor="title">📝 Title<span>*</span></label>
                <input
                    id="title"
                    name="title"
                    value={form.title}
                    placeholder="Title todo"
                    onChange={handleChange}
                />

                <label htmlFor="subtitle">📢 Subheading<span>*</span></label>
                <input
                    id="subtitle"
                    name="subtitle"
                    value={form.subtitle}
                    placeholder="Subheading todo"
                    onChange={handleChange}
                />

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




                <label htmlFor="people">👥 Pihak Terkait</label>
                <input
                    id="people"
                    name="people"
                    placeholder="A, B, .. (dipisah dengan koma)"
                    value={form.peoples}
                    onChange={handleChange}
                />



                <label htmlFor="desc">💬 Deskripsi</label>
                <textarea rows={3}
                    id="desc"
                    name="desc"
                    value={form.desc}
                    placeholder="Deskripsi todo"
                    onChange={handleChange}
                />

                <label htmlFor="note">📌 Note / Link URL</label>
                <textarea
                    rows={3}
                    id="note"
                    name="note"
                    placeholder="Note rencana / Link url"
                    value={form.note}
                    onChange={handleChange}
                />

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




                <button type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className={`mt-2 border border-blue-200! px-4 py-2 rounded-md transition ${loading ? "bg-blue-300! opacity-50 cursor-not-allowed!" : "hover:bg-blue-600 hover:text-white! active:bg-blue-800! active:text-white! cursor-pointer"}`}>
                    {loading ? "⏳ Loading..." : "+ Tambah Card"}
                </button>


            </form>
        </Modal >
    );
}