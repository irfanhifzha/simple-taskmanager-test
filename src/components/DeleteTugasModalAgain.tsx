import Modal from "./Modal";
import { updateDoc, doc, deleteField } from "firebase/firestore";
import { db } from "../firebase";
import { useState } from "react";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function DeleteTugasModalAgain({ open, onClose, data, onSuccess }: any) {
    const [loading, setLoading] = useState(false);
    const handleDelete = async () => {
        setLoading(true);
        if (!data?.id) return;

        await updateDoc(doc(db, "schedules", data.id), {
            statusTugasAgain: deleteField(),
            titleTugasAgain: deleteField(),
            h1TugasAgain: deleteField(),
            note1TugasAgain: deleteField(),
            note2TugasAgain: deleteField(),
        });
        setLoading(false);

        onSuccess();
        onClose();
    };

    return (
        <Modal open={open} onClose={onClose}>
            <h2>Yakin mau hapus tugas?</h2>
            <p>"{data?.h1Tugas}" dari {data?.course || "null"} [Hari {dayLabels[data?.dayIndex - 1] || "null"},
          {" "}
          {data?.slots?.length > 1
            ? `Jam ${data.slots.at(0)}.00 - ${data.slots.at(-1)}.00`
            : `Jam ${data?.slots?.at(0) ?? "?"}.00`
          }
        ]</p>

            <button
                className="border-red-500! text-red-700"
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