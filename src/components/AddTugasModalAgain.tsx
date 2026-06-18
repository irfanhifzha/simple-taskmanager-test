import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function AddTugasModalAgain({
  open,
  onClose,
  onSuccess,
  data,
}: any) {
  const [statusTugasAgain, setStatus] = useState("");
  const [titleTugasAgain, setTitle] = useState("");
  const [h1TugasAgain, setH1] = useState("");
  const [note1TugasAgain, setNote1] = useState("");
  const [note2TugasAgain, setNote2] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  // ✅ now ALWAYS works because data is full doc
  useEffect(() => {
    if (open && data) {
      setShowInvalid(false);
    }
  }, [open, data]);

  const isInvalid =
    !statusTugasAgain ||
    !titleTugasAgain.trim() ||
    !h1TugasAgain.trim();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    setLoading(true);


    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    if (!data?.id) return;

    // 🔥 extend SAME document (schedule + tugas fields together)
    await updateDoc(doc(db, "schedules", data.id), {
      statusTugasAgain,
      titleTugasAgain,
      h1TugasAgain,
      note1TugasAgain,
      note2TugasAgain,
    });

    setLoading(false);

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2>Tambah Tugas Lagi</h2>


      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Menambah tugas ke {data?.course || "notfound"} - Hari {dayLabels[data?.dayIndex-1] || "harinotfound"}
      </p>


      <label>Status</label>
      <select value={statusTugasAgain} onChange={(e) => setStatus(e.target.value)}>
        <option value="" disabled hidden>
          Pilih status
        </option>
        <option value="orange-bg">Oranye</option>
        <option value="green-bg">Hijau</option>
        <option value="red-bg">Merah</option>
        <option value="blue-bg">Biru</option>
      </select>

      <label>Judul Tugas</label>
      <input
        placeholder="Judul Tugas"
        value={titleTugasAgain}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Nama Tugas</label>
      <textarea
        placeholder="Nama Tugas"
        value={h1TugasAgain}
        onChange={(e) => setH1(e.target.value)}
      />

<label>Deskripsi Tugas</label>
      <textarea
        placeholder="Note 1"
        value={note1TugasAgain}
        onChange={(e) => setNote1(e.target.value)}
      />

<label>Note</label>
      <textarea
        placeholder="Note 2"
        value={note2TugasAgain}
        onChange={(e) => setNote2(e.target.value)}
      />

      {showInvalid && (
        <div style={{
          background: "#ffe5e5",
          color: "#b00020",
          padding: 10,
          marginTop: 10,
          borderRadius: 6
        }}>
          Semua field tugas wajib diisi
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isInvalid || loading}
        style={{
          marginTop: 12,
          opacity: isInvalid || loading ? 0.5 : 1,
          cursor: isInvalid || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? ("Loading...") : ("Simpan")}
      </button>
    </Modal>
  );
}