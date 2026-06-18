import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

export default function AddTugasModal({
  open,
  onClose,
  onSuccess,
  data,
}: any) {
  const [statusTugas, setStatus] = useState("");
  const [titleTugas, setTitle] = useState("");
  const [h1Tugas, setH1] = useState("");
  const [note1Tugas, setNote1] = useState("");
  const [note2Tugas, setNote2] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  // ✅ now ALWAYS works because data is full doc
  useEffect(() => {
    if (open && data) {
      setShowInvalid(false);
    }
  }, [open, data]);

  const isInvalid =
    !statusTugas ||
    !titleTugas.trim() ||
    !h1Tugas.trim();

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
      statusTugas,
      titleTugas,
      h1Tugas,
      note1Tugas,
      note2Tugas,
    });

    setLoading(false);

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2>Tambah Tugas</h2>

      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13}}>
        Menambah tugas ke {data?.course || "notfound"} - Hari {dayLabels[data?.dayIndex-1] || "null"}
      </p>

      <label>Status</label>
      <select value={statusTugas} onChange={(e) => setStatus(e.target.value)}>
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
        value={titleTugas}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>Nama Tugas</label>
      <textarea
        placeholder="Nama Tugas"
        value={h1Tugas}
        onChange={(e) => setH1(e.target.value)}
      />

      <label>Deskripsi Tugas</label>
      <textarea
        placeholder="Note 1"
        value={note1Tugas}
        onChange={(e) => setNote1(e.target.value)}
      />

      <label>Note</label>
      <textarea
        placeholder="Note 2"
        value={note2Tugas}
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