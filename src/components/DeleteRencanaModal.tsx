import Modal from "./Modal";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";

export default function DeleteScheduleModal({ open, onClose, data, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        if (!data?.id) return;

        await deleteDoc(doc(db, "calendar", data.id));
        setLoading(false);

        onSuccess();
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <h2>Yakin mau hapus?</h2>
            <p>{data?.task}</p>


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