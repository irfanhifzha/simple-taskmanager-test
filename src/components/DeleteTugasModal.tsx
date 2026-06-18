import Modal from "./Modal";
import { updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";

export default function DeleteTugasModal({ open, onClose, data, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        if (!data?.id) return;

        await updateDoc(doc(db, "schedules", data.id), {
            statusTugas: deleteField(),
            titleTugas: deleteField(),
            h1Tugas: deleteField(),
            note1Tugas: deleteField(),
            note2Tugas: deleteField(),
        });
        setLoading(false);

        onSuccess();
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <h2>Yakin mau hapus tugas?</h2>
            <p>"{data?.h1Tugas}"</p>

            <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                marginTop: 12,
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer"
                }}
            >
                {loading ? ("Loading...") : ("Yes, Delete")}
            </button>
            
        </Modal>
    );
}