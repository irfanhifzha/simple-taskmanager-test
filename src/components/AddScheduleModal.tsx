import { useEffect, useState } from "react";
import Modal from "./Modal";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const days = [
  { label: "Senin", value: 1 },
  { label: "Selasa", value: 2 },
  { label: "Rabu", value: 3 },
  { label: "Kamis", value: 4 },
  { label: "Jumat", value: 5 }
];

const slotOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export default function AddScheduleModal({ open, onClose, onSuccess }: any) {
  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [lecturers, setLecturers] = useState("");
  const [type, setType] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState<number>(0);
  const [dayIndex, setDayIndex] = useState<number>(0);
  const [slots, setSlots] = useState<number[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);

  // validation (UNCHANGED LOGIC FIX ONLY)
  const isInvalid =
    !program.trim() ||
    semester === 0 ||
    !course.trim() ||
    !room.trim() ||
    !lecturers.trim() ||
    !type.trim() ||
    dayIndex === 0 ||
    slots.length === 0;

  const resetForm = () => {
    setProgram("");
    setSemester(0);
    setType("");
    setDayIndex(0);
    setSlots([]);
    setShowInvalid(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // 🔥 FIXED: now includes program + semester
  const loadConflicts = async () => {
    const snap = await getDocs(collection(db, "schedules"));

    const occupied = new Set<string>();

    snap.forEach((doc) => {
      const d = doc.data();

      const day = d.dayIndex;
      const s = d.slots || [];

      const existingProgram = d.program;
      const existingSemester = d.semester;

      s.forEach((slot: number) => {
        // ✅ NEW KEY STRUCTURE (IMPORTANT FIX)
        occupied.add(
          `${existingProgram}-${existingSemester}-${day}-${slot}`
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

  // 🔥 FIXED: check includes program + semester
  const toggleSlot = (slot: number) => {
    const key = `${program}-${semester}-${dayIndex}-${slot}`;

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
      program,
      semester,
      dayIndex,
      slots,
      course,
      room,
      lecturers: lecturers
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

      <label>Program Studi</label>
      <select value={program} onChange={(e) => setProgram(e.target.value)}>
        <option value="" disabled>Pilih Program Studi</option>
        <option value="TRPL">TRPL</option>
        <option value="BISDIG">BISDIG-Reguler</option>
        <option value="BISDIGeks">BISDIG-Eksekutif</option>
      </select>

      <label>Semester</label>
      <select value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
        <option value={0} disabled>Pilih Semester</option>
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
        <option value={4}>4</option>
        <option value={5}>5</option>
        <option value={6}>6</option>
        <option value={7}>7</option>
        <option value={8}>8</option>
      </select>

      

      <label>Mata Kuliah</label>
      <input
        placeholder="Mata Kuliah"
        value={course}
        onChange={(e) => setCourse(e.target.value)}
      />


      <label>Ruangan</label>
      <input
        placeholder="Ruangan"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />

      <label>Dosen</label>
      <input
        placeholder="Dosen (dipisah dengan koma)"
        value={lecturers}
        onChange={(e) => setLecturers(e.target.value)}
      />

      <label>Tipe</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="" disabled>Pilih Tipe</option>
        <option value="teori">Teori</option>
        <option value="praktek">Praktek</option>
        <option value="tambahan">Matkul Tambahan</option>
      </select>

      <label>Hari</label>
      <select
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

        <label>Jam</label>

        <div style={{ display: "flex", width:"100%", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10}}>
          {slotOptions.map((slot) => {
            const key = `${program}-${semester}-${dayIndex}-${slot}`;
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

      <label>Note</label>
      <input
        placeholder="Note (Optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

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
    </Modal>
  );
}