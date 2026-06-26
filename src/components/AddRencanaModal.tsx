import { useEffect, useState } from "react";
import Modal from "./Modal";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const months = [
  { label: "Januari", value: 1 },
  { label: "Februari", value: 2 },
  { label: "Maret", value: 3 },
  { label: "April", value: 4 },
  { label: "Mei", value: 5 },
  { label: "Juni", value: 6 },
  { label: "Juli", value: 7 },
  { label: "Agustus", value: 8 },
  { label: "September", value: 9 },
  { label: "Oktober", value: 10 },
  { label: "November", value: 11 },
  { label: "Desember", value: 12 },
];

export default function AddRencanaModal({ open, onClose, onSuccess }: any) {
  const today = new Date();
  const [bulan, setBulan] = useState<number>(today.getMonth() + 1);
  const [tahun, setTahun] = useState<number>(today.getFullYear());

  const [type, setType] = useState("");

  const [tanggal, setTanggal] = useState<number[]>([]);

  const [content, setContent] = useState("");
  const [task, setTask] = useState("");

  const [_, setShowInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== HELPERS =====
  const getDaysInMonth = (month: number, year: number) => {
    if (!month || !year) return 0;
    return new Date(year, month, 0).getDate();
  };

  const availableDates = Array.from(
    { length: getDaysInMonth(bulan, tahun) },
    (_, i) => i + 1
  );


  useEffect(() => {
    if (bulan > 0) {
      setTanggal([]);
    }
  }, [bulan, tahun]);

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open]);

  // ===== VALIDATION =====
  const isInvalid =
    !task.trim() ||
    !content.trim() ||
    !type.trim() ||
    tanggal.length === 0;

  // ===== RESET =====
  const resetForm = () => {
    setTanggal([]);
    setBulan(today.getMonth() + 1);
    setTahun(today.getFullYear());
    setType("");
    setTask("");
    setContent("");
    setShowInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDate = (day: number) => {
    setTanggal((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };


  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    setLoading(true);

    try {
      await addDoc(collection(db, "calendar"), {
        bulan,
        tahun,
        tanggal,
        task,
        type,
        content,
        createdAt: new Date(),
      });

      onSuccess();
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Tambah Rencana</h2>


      <label>Title<span>*</span></label>
      {/* TASK */}
      <input
        placeholder="Title rencana..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
      />

      <label>Deskripsi<span>*</span></label>
      {/* CONTENT */}
      <textarea
        placeholder="Deskripsi rencana..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />



      <label>Tipe<span>*</span></label>
      {/* TYPE */}
      <select
        value={type} onChange={(e) => setType(e.target.value)}>
        <option value="" disabled>Pilih Tipe</option>
        <option value="orange-bg">Oranye</option>
        <option value="red-bg">Merah</option>
        <option value="blue-bg">Biru</option>
        <option value="purple-bg">Purple</option>
        <option value="green-bg">Hijau</option>
      </select>




      <div className="grid grid-cols-2 gap-4">
        <div>
          <label>Bulan<span>*</span></label>
          {/* BULAN */}
          <select className="w-full" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
            <option value={0} disabled>Pilih Bulan</option>
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Tahun<span>*</span></label>
          {/* TAHUN */}
          <input className="w-full"
            placeholder="Tahun"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          />
        </div>
      </div>

      {/* TANGGAL */}
      <div style={{ marginTop: 10 }}>
        <label>Tanggal<span>*</span></label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10, }}>
          {availableDates.map((day) => {
            const isSelected = tanggal.includes(day);

            return (
              <div
                key={day}
                onClick={() => toggleDate(day)}
                className={`button-jam
                  ${isSelected ? "selected enabled" : "enabled"}`}
                style={{
                  borderColor: isSelected ? "#362dde" : "",
                  background: isSelected ? "#4f46e5" : "",
                  color: isSelected ? "#fff" : "#000",
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>





      {/* BUTTON */}
      <button
        onClick={handleSubmit}
        disabled={isInvalid || loading}
        style={{
          marginTop: 12,
          opacity: isInvalid || loading ? 0.5 : 1,
          cursor: isInvalid || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Simpan"}
      </button>
    </Modal>
  );
}