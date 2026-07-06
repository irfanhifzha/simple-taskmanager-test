import { useEffect, useState } from "react";
import Modal from "./Modal";
import { addDoc, collection, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const days = [
  { label: "Senin", value: 1 },
  { label: "Selasa", value: 2 },
  { label: "Rabu", value: 3 },
  { label: "Kamis", value: 4 },
  { label: "Jumat", value: 5 },
  { label: "Sabtu", value: 6 }, { label: "Minggu", value: 7 },
];

const slotOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export default function AddScheduleModal({ open, onClose, onSuccess, category }: any) {

  const kategori = category;
  
  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [peoples, setPeoples] = useState("");
  const [type, setType] = useState("");
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [slots, setSlots] = useState<number[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [desc, setDesc] = useState("");
  const [note, setNote] = useState("");

  



  const resetForm = () => {
    setCourse("");
    setPeoples("");
    setRoom("");
    setDesc("");
    setNote("");
    setType("");
    setDayIndex(0);
    setSlots([]);
  };

  const handleClose = () => {
    setErrors({});
    setFormError(null);
    setLoading(false);
    resetForm();
    onClose();
  };


  const loadConflicts = async () => {
    const snap = await getDocs(collection(db, "schedules"));

    const occupied = new Set<string>();

    snap.forEach((doc) => {
      const d = doc.data();

      const day = d.dayIndex;
      const s = d.slots || [];

      const existingCategory = d.kategori;


      s.forEach((slot: number) => {
        occupied.add(
          `${existingCategory}-${day}-${slot}`
        );
      });
    });

    setOccupiedSlots(occupied);
  };

  useEffect(() => {
    if (open) {
      loadConflicts();
      resetForm();
    }
  }, [open]);

  useEffect(() => {
    setSlots([]);
  }, [dayIndex]);


  const toggleSlot = (slot: number) => {
    const key = `${kategori}-${dayIndex}-${slot}`;

    if (occupiedSlots.has(key)) return;

    setSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const [loading, setLoading] = useState(false);




  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!course.trim()) errors.course = "Judul wajib diisi";
    if (!type.trim()) errors.type = "Tipe wajib diisi";
    if (dayIndex === 0) errors.dayIndex = "Hari wajib diisi";
    if (slots.length === 0) errors.slots = "Jam wajib diisi";

    return errors;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);


  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (loading) return;

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setFormError("Mohon lengkapi form terlebih dahulu");
      return;
    }

    setErrors({});
    setFormError(null);
    setLoading(true);

    try {
      const payload = {
        dayIndex,
        slots,
        course,
        room,
        peoples: peoples
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        type,
        desc,
        note,
        kategori,
        createdAt: serverTimestamp(),
      };


      await addDoc(collection(db, "schedules"), payload);

      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(`(${err})\n\nGagal menyimpan data`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>+ Tambah Jadwal</h2>

      <form onSubmit={handleSubmit}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
          <div>
            <label htmlFor="title">📝 Judul<span>*</span></label>
            <input
              className="w-full"
              id="title"
              placeholder="Judul rencana"
              value={course}
              onChange={(e) => setCourse(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
            <select className="w-full" id="tipe" value={type} onChange={(e) => setType(e.target.value)}>
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





        <label htmlFor="ruangan">🏢 Tempat</label>
        <input
          className="w-full"
          id="ruangan"
          placeholder="Ruangan"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <label htmlFor="peoples">👥 Pihak Terkait</label>
        <input
          id="peoples"
          placeholder="A, B, .. (dipisah dengan koma)"
          value={peoples}
          onChange={(e) => setPeoples(e.target.value)}
        />

        <label htmlFor="desc">💬 Deskripsi</label>
        <textarea
          id="desc"
          rows={4}
          placeholder="Deskripsi rencana"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <label htmlFor="note">📌 Note / Link URL</label>
        <textarea
          rows={4}
          id="note"
          placeholder="Note rencana / Link url"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />





        <label htmlFor="hari">📅 Hari<span>*</span></label>
        <select
          className="w-full"
          id="hari"
          value={dayIndex}
          onChange={(e) => setDayIndex(Number(e.target.value))}
        >
          <option value={0} disabled>Pilih Hari</option>
          {days.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>




        <label htmlFor="jam">🕒 Jam<span>*</span></label>
        <input id="jam" disabled value={[...slots].sort((a, b) => a - b).join(", ")} className="flex w-full h-8"></input>
        <div className="flex flex-wrap w-full gap-1 mt-1 mb-1">
          {slotOptions.map((slot) => {
            const key = `${kategori}-${dayIndex}-${slot}`;
            const isBlocked = occupiedSlots.has(key);
            const isSelected = slots.includes(slot);

            return (
              <div
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`button-jam 
                  ${isBlocked ? "blocked" : "enabled"} 
                  ${isSelected && !isBlocked ? "selected" : ""}`}
              >
                {slot}
              </div>
            );
          })}
        </div>

        {formError && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            <div className="whitespace-pre-line break-words">
              {formError}
            </div>

            {Object.keys(errors).length > 0 && (
              <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                {errors.course && <li>• {errors.course}</li>}
                {errors.type && <li>• {errors.type}</li>}
                {errors.dayIndex && <li>• {errors.dayIndex}</li>}
                {errors.slots && <li>• {errors.slots}</li>}
              </ul>
            )}
          </div>
        )}



        <button type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-2 border border-blue-200! px-4 py-2 rounded-md transition ${loading ? "bg-blue-300! opacity-50 cursor-not-allowed!" : "hover:bg-blue-600 hover:text-white! active:bg-blue-800! active:text-white! cursor-pointer"}`}>
          {loading ? "⏳ Loading..." : "+ Tambah Jadwal"}
        </button>
      </form>
    </Modal>
  );
}