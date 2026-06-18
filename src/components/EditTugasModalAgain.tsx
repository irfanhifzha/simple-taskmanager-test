import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";


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

  // ✅ load existing data into form
  useEffect(() => {
    if (open && data) {
      setStatus(data.statusTugasAgain || "");
      setTitle(data.titleTugasAgain || "");
      setH1(data.h1TugasAgain || "");
      setNote1(data.note1TugasAgain || "");
      setNote2(data.note2TugasAgain || "");
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
      return;
    }

    if (!data?.id) return;

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
      <h2>Edit Tugas</h2>

    <label>Status</label>
      <select value={statusTugasAgain} onChange={(e) => setStatus(e.target.value)}>
        <option value="orange-bg">Oranye</option>
        <option value="green-bg">Hijau</option>
        <option value="red-bg">Merah</option>
        <option value="blue-bg">Biru</option>
      </select>

      <label>Judul Tugas</label>
      <input
        placeholder="Judul"
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
        placeholder="Note 1, Deskripsi Tugas..."
        value={note1TugasAgain}
        onChange={(e) => setNote1(e.target.value)}
      />
    
      <label>Note</label>
      <textarea
        placeholder="Note 2, Deadline:..."
        value={note2TugasAgain}
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