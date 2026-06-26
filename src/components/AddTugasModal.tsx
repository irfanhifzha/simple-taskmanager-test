import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

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
    !titleTugas.trim()

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
      <h2>+ Tambah Tugas</h2>

      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Menambah tugas: {data?.course || "notfound"}  [Hari {dayLabels[data?.dayIndex - 1] || "null"},
        {" "}
        {data?.slots?.length > 1
          ? `Jam ${data.slots.at(0)}.00 - ${data.slots.at(-1)}.00`
          : `Jam ${data?.slots?.at(0) ?? "?"}.00`
        }
        ]
      </p>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div>
            <label htmlFor="title">📝 Judul Tugas<span>*</span></label>
            <input className="w-full" id="title"
              placeholder="Judul Tugas"
              value={titleTugas}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
            <select id="tipe" className="w-full" value={statusTugas} onChange={(e) => setStatus(e.target.value)}>
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
          value={h1Tugas}
          onChange={(e) => setH1(e.target.value)}
        />

        <label htmlFor="note1">💬 Deskripsi Tugas</label>
        <textarea id="note1"
          placeholder="Deskripsi Tugas"
          value={note1Tugas}
          onChange={(e) => setNote1(e.target.value)}
        />

        <label htmlFor="note2">✍️ Note</label>
        <textarea id="note2"
          placeholder="Note"
          value={note2Tugas}
          onChange={(e) => setNote2(e.target.value)}
        />

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
      </form>
    </Modal>
  );
}