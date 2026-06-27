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
  const [notes, setNotes] = useState("");
  const [task, setTask] = useState("");

  const [peoples, setPeoples] = useState("");

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

      const firstDayOffset = new Date(year, month - 1, 1).getDay();

      const week = Math.floor((i + firstDayOffset) / 7) + 1;

      return {
        day,
        label: `${day} - ${namaHari[date.getDay()]} (Week ${week})`,
        weekday: namaHari[date.getDay()],
        week,
      };
    });
  };


  const availableDates = getDaysInMonth(bulan, tahun);

  const filteredEndDates = availableDates.filter(
    (d) => !startTanggal || d.day >= Number(startTanggal)
  );

  

  useEffect(() => {
    if (startTanggal && endTanggal) {
      const start = Number(startTanggal);
      const end = Number(endTanggal);

      if (start <= end) {
        const range = Array.from(
          { length: end - start + 1 },
          (_, i) => start + i
        );

        setTanggal(range);
      } else {
        setTanggal([]);
      }
    } else {
      setTanggal([]);
    }
  }, [startTanggal, endTanggal]);



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




  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (isInvalid) {
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
        notes,
        peoples: peoples
          .split(",")
          .map((l: string) => l.trim())
          .filter(Boolean),
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div>
            <label htmlFor="title">📝 Title<span>*</span></label>
            <input className="w-full"
              id="title"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Title rencana..."
            />
          </div>


          <div>
            <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
            <select className="w-full" id="tipe" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="" disabled hidden>Pilih Warna</option>
              <option value="orange">Oranye</option>
              <option value="red">Merah</option>
              <option value="blue">Biru</option>
              <option value="purple">Purple</option>
              <option value="green">Hijau</option>
              <option value="abu">Abu</option>
            </select>
          </div>

        </div>



        <label htmlFor="peoples">👥 Pihak Terkait</label>
        <input
          id="peoples"
          placeholder="Individu 1,.. (dipisah dengan koma)"
          value={peoples}
          onChange={(e) => setPeoples(e.target.value)}
        />






        <label htmlFor="desc">💬 Deskripsi</label>
        {/* CONTENT */}
        <textarea rows={3}
          id="desc"
          placeholder="Deskripsi rencana..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label htmlFor="notes">📌 Note / Link URL</label>
        {/* CONTENT */}
        <textarea rows={3}
          id="notes"
          placeholder="Notes rencana..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />








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
              {filteredEndDates.map((d) => (
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
          {loading ? "⏳ Loading..." : "💾 Simpan"}
        </button>
      </form>
    </Modal >
  );
}