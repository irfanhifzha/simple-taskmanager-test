import { useEffect, useState } from "react";
import Modal from "./Modal";
import { addDoc, collection, getDocs } from "firebase/firestore";
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

export default function AddScheduleModal({ open, onClose, onSuccess }: any) {
  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [peoples, setPeoples] = useState("");
  const [type, setType] = useState("");
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [slots, setSlots] = useState<number[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  // validation (UNCHANGED LOGIC FIX ONLY)
  const isInvalid =
    !course.trim() ||
    !type.trim() ||
    dayIndex === 0 ||
    slots.length === 0;

  const resetForm = () => {
    setType("");
    setDayIndex(0);
    setSlots([]);
    setShowInvalid(false);
  };

  const handleClose = () => {
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


      s.forEach((slot: number) => {
        // ✅ NEW KEY STRUCTURE (IMPORTANT FIX)
        occupied.add(
          `${day}-${slot}`
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
    const key = `${dayIndex}-${slot}`;

    if (occupiedSlots.has(key)) return;

    setSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    setLoading(true);

    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    await addDoc(collection(db, "schedules"), {
      dayIndex,
      slots,
      course,
      room,
      peoples: peoples
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean),
      type,
      note,
    });

    setLoading(false);

    onSuccess();
    handleClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Tambah Jadwal</h2>

      <form onSubmit={handleSubmit}>



        <label htmlFor="task">Nama Task<span>*</span></label>
        <input
          className="w-full"
          id="task"
          placeholder="Nama task"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        />



        <label htmlFor="ruangan">Ruangan</label>
        <input
          className="w-full"
          id="ruangan"
          placeholder="Ruangan"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <label htmlFor="peoples">Orang terkait</label>
        <input
          id="peoples"
          placeholder="Related person (dipisah dengan koma)"
          value={peoples}
          onChange={(e) => setPeoples(e.target.value)}
        />

        <label htmlFor="note">Note</label>
        <textarea
          id="note"
          placeholder="Deskripsi task"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        <label htmlFor="tipe">Tipe<span>*</span></label>
        <select id="tipe" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="" disabled>Pilih Tipe</option>
          <option value="green">Hijau</option>
          <option value="blue">Biru</option>
          <option value="red">Merah</option>
          <option value="orange">Oranye</option>
          <option value="purple">Purple</option>
          <option value="abu">Abu</option>
        </select>

        <label htmlFor="hari">Hari<span>*</span></label>
        <select
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



        <label>Jam<span>*</span></label>
        <div style={{ display: "flex", width: "100%", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10 }}>
          {slotOptions.map((slot) => {
            const key = `${dayIndex}-${slot}`;
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



        <button
          onClick={handleSubmit}
          disabled={isInvalid || loading}
          style={{
            marginTop: 12,
            opacity: isInvalid || loading ? 0.5 : 1,
            cursor: isInvalid || loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? ("Loading...") : ("Simpan")}
        </button>
      </form>
    </Modal>
  );
}