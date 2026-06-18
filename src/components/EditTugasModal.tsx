import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";


export default function EditTugasModal({
  open,
  onClose,
  data,
  onSuccess,
}: any) {
  const [statusTugas, setStatus] = useState("");
  const [titleTugas, setTitle] = useState("");
  const [h1Tugas, setH1] = useState("");
  const [note1Tugas, setNote1] = useState("");
  const [note2Tugas, setNote2] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  // ✅ load existing data into form
  useEffect(() => {
    if (open && data) {
      setStatus(data.statusTugas || "");
      setTitle(data.titleTugas || "");
      setH1(data.h1Tugas || "");
      setNote1(data.note1Tugas || "");
      setNote2(data.note2Tugas || "");
    }
  }, [open, data]);


  useEffect(() => {
    if (open) {
      setShowInvalid(false);
    }
  }, [open]);


  // ✅ validation
  const isInvalid =
    !titleTugas.trim() ||
    !h1Tugas.trim();

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    if (!data?.id) return;

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
      <h2>Edit Tugas</h2>

      <label>Status</label>
      <select value={statusTugas} onChange={(e) => setStatus(e.target.value)}>
        <option value="orange-bg">Oranye</option>
        <option value="green-bg">Hijau</option>
        <option value="red-bg">Merah</option>
        <option value="blue-bg">Biru</option>
      </select>

      <label>Judul Tugas</label>
      <input
        placeholder="Judul"
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
        placeholder="Note 1, Deskripsi Tugas..."
        value={note1Tugas}
        onChange={(e) => setNote1(e.target.value)}
      />
    
      <label>Note</label>
      <textarea
        placeholder="Note 2, Deadline:..."
        value={note2Tugas}
        onChange={(e) => setNote2(e.target.value)}
      />



      {/* warning */}
      {showInvalid && (
        <div style={{
          background: "#ffe5e5",
          color: "#b00020",
          padding: 10,
          marginTop: 10,
          borderRadius: 6
        }}>
          Semua field wajib diisi dan minimal 1 jam harus dipilih
        </div>
      )}


      {/* button */}
      <button
        onClick={handleUpdate}
        disabled={isInvalid || loading}
        style={{
          marginTop: 12,
          opacity: isInvalid || loading ? 0.5 : 1,
          cursor: isInvalid || loading ? "not-allowed" : "pointer"
        }}
      >
        {loading ? ("Loading...") : ("Simpan")}
      </button>
    </Modal>
  );
}