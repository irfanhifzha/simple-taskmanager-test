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

  const [startTanggal, setStartTanggal] = useState("");
  const [endTanggal, setEndTanggal] = useState("");
  const [tanggal, setTanggal] = useState<number[]>([]);

  const [content, setContent] = useState("");
  const [task, setTask] = useState("");

  const [_, setShowInvalid] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===== HELPERS =====
  const getDaysInMonth = (month: number, year: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();

    const namaHari = [
      "Minggu",
      "Senin",
      "Selasa",
      "Rabu",
      "Kamis",
      "Jumat",
      "Sabtu",
    ];

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day);

      // Week calculation (simple: every 7 days = new week)
      const week = Math.floor(i / 7) + 1;

      return {
        day,
        label: `${day} - ${namaHari[date.getDay()]} (Week ${week})`,
        weekday: namaHari[date.getDay()],
        week,
      };
    });
  };

  const availableDates = getDaysInMonth(bulan, tahun);


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
    !type.trim() ||
    tanggal.length === 0;

  // ===== RESET =====
  const resetForm = () => {
    setTanggal([]);
    setBulan(today.getMonth() + 1);
    setTahun(today.getFullYear());
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
      <h2>+ Tambah Rencana</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">📌 Title<span>*</span></label>
        {/* TASK */}
        <input
          id="title"
          placeholder="Title rencana..."
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />

        <label htmlFor="desc">💬 Deskripsi</label>
        {/* CONTENT */}
        <textarea
          id="desc"
          placeholder="Deskripsi rencana..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />



        <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
        {/* TYPE */}
        <select
          id="tipe"
          value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled hidden>Pilih Warna</option>
          <option value="orange">Oranye</option>
          <option value="red">Merah</option>
          <option value="blue">Biru</option>
          <option value="purple">Purple</option>
          <option value="green">Hijau</option>
          <option value="abu">Abu</option>
        </select>




        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="bulan">Bulan<span>*</span></label>
            {/* BULAN */}
            <select id="bulan" className="w-full" value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
              <option value={0} disabled hidden>Pilih Bulan</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tahun">Tahun<span>*</span></label>
            {/* TAHUN */}
            <input id="tahun" className="w-full"
              placeholder="Tahun"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
            />
          </div>
        </div>

        {/* TANGGAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div>
            <label htmlFor="tanggalStart">Dari Tgl<span>*</span></label>
            <select
              id="tanggalStart"
              className="w-full"
              value={startTanggal}
              onChange={(e) => setStartTanggal(e.target.value)}
            >
              <option value="" disabled hidden>Pilih Start</option>
              {availableDates.map((d) => (
                <option key={d.day} value={d.day}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="tanggalEnd">Sampai Tgl<span>*</span></label>
            <select
              id="tanggalEnd"
              className="w-full"
              value={endTanggal}
              onChange={(e) => setEndTanggal(e.target.value)}
            >
              <option value="" disabled hidden>Pilih End</option>
              {availableDates.map((d) => (
                <option key={d.day} value={d.day}>
                  {d.label}
                </option>
              ))}
            </select>
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
      </form>
    </Modal>
  );
}