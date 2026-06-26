import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function EditTugasModalAgain({
  open,
  onClose,
  data,
  onSuccess,
}: any) {
  const [statusTugasAgain, setStatus] = useState("");
  const [titleTugasAgain, setTitle] = useState("");
  const [h1TugasAgain, setH1] = useState("");
  const [note1TugasAgain, setNote1] = useState("");
  const [note2TugasAgain, setNote2] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  useEffect(() => {
    const t = data?.tugas;

    if (open && t) {
      setStatus(t.statusTugasAgain || "");
      setTitle(t.titleTugasAgain || "");
      setH1(t.h1TugasAgain || "");
      setNote1(t.note1TugasAgain || "");
      setNote2(t.note2TugasAgain || "");
    }
  }, [open, data]);

  useEffect(() => {
    if (open) {
      setShowInvalid(false);
    }
  }, [open]);


  // ✅ validation
  const isInvalid =
    !titleTugasAgain.trim() ||
    !h1TugasAgain.trim();

  const [loading, setLoading] = useState(false);



  const handleUpdate = async () => {
    setLoading(true);

    if (isInvalid) {
      setShowInvalid(true);
      setLoading(false);
      return;
    }

    if (!data?.schedule?.id || !data?.tugas?.id) return;

    const ref = doc(db, "schedules", data.schedule.id);

    const oldItem = data.tugas;

    const updatedItem = {
      ...oldItem,
      statusTugasAgain,
      titleTugasAgain,
      h1TugasAgain,
      note1TugasAgain,
      note2TugasAgain,
    };

    await updateDoc(ref, {
      tugasAgain: arrayRemove(oldItem),
    });

    await updateDoc(ref, {
      tugasAgain: arrayUnion(updatedItem),
    });

    setLoading(false);
    onSuccess();
    onClose();
  };



  return (
    <Modal open={open} onClose={onClose}>
      <h2>Edit Tugas</h2>
      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Mengedit tugas: {data?.schedule?.course || "notfound"}  [Hari {dayLabels[data?.schedule?.dayIndex - 1] || "null"},
        {" "}
        {data?.schedule?.slots?.length > 1
          ? `Jam ${data.schedule.slots.at(0)}.00 - ${data.schedule.slots.at(-1)}.00`
          : `Jam ${data?.schedule?.slots?.at(0) ?? "?"}.00`
        }
        ]
      </p>

      <form onSubmit={handleUpdate}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div>
            <label htmlFor="title">📝 Judul Tugas<span>*</span></label>
            <input className="w-full" id="title"
              placeholder="Judul Tugas"
              value={titleTugasAgain}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
            <select id="tipe" className="w-full" value={statusTugasAgain} onChange={(e) => setStatus(e.target.value)}>
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

        <label htmlFor="h1">🎯 Nama Tugas</label>
        <textarea id="h1"
          placeholder="Nama Tugas"
          value={h1TugasAgain}
          onChange={(e) => setH1(e.target.value)}
        />

        <label htmlFor="note1">💬 Deskripsi Tugas</label>
        <textarea id="note1"
          placeholder="Deskripsi Tugas"
          value={note1TugasAgain}
          onChange={(e) => setNote1(e.target.value)}
        />

        <label htmlFor="note2">✍️ Note</label>
        <textarea id="note2"
          placeholder="Note"
          value={note2TugasAgain}
          onChange={(e) => setNote2(e.target.value)}
        />

        <button
          onClick={handleUpdate}
          disabled={isInvalid || loading}
          style={{
            marginTop: 12,
            opacity: isInvalid || loading ? 0.5 : 1,
            cursor: isInvalid || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? ("Loading...") : ("Simpan")}
        </button>
      </form>
    </Modal>
  );
}