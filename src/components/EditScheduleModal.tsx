import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

const slotOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const days = [
  { label: "Senin", value: 1 },
  { label: "Selasa", value: 2 },
  { label: "Rabu", value: 3 },
  { label: "Kamis", value: 4 },
  { label: "Jumat", value: 5 }
];

export default function EditScheduleModal({
  open,
  onClose,
  data,
  onSuccess,
}: any) {

  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [lecturers, setLecturers] = useState("");
  const [type, setType] = useState("teori");
  const [dayIndex, setDayIndex] = useState<number>(1);
  const [slots, setSlots] = useState<number[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);


  // ✅ load existing data
  useEffect(() => {
    if (open && data) {
      setCourse(data.course || "");
      setRoom(data.room || "");
      setLecturers((data.lecturers || []).join(", "));
      setType(data.type || "teori");
      setDayIndex(data.dayIndex || 1);
      setSlots(data.slots || []);
      setNote(data.note || "");
    }
  }, [open, data]);

  // 🔥 FIXED: include program + semester + exclude self
  const loadConflicts = async () => {
    const snap = await getDocs(collection(db, "schedules"));

    const occupied = new Set<string>();

    snap.forEach((docSnap) => {
      const d = docSnap.data();

      // ❌ skip current schedule
      if (docSnap.id === data?.id) return;

      const day = d.dayIndex;
      const program = d.program;
      const semester = d.semester;

      if (!program || !semester) return;
      if (day < 1 || day > 5) return;

      (d.slots || []).forEach((slot: number) => {
        occupied.add(`${program}-${semester}-${day}-${slot}`);
      });
    });

    setOccupiedSlots(occupied);
  };

  useEffect(() => {
    if (open) {
      loadConflicts();
      setShowInvalid(false);
    }
  }, [open, dayIndex]);

  useEffect(() => {
    setSlots([]);
  }, [dayIndex]);

  // 🔥 FIXED toggle logic (now includes program + semester)
  const toggleSlot = (slot: number) => {
    const program = data?.program;
    const semester = data?.semester;

    const key = `${program}-${semester}-${dayIndex}-${slot}`;

    if (occupiedSlots.has(key)) return;

    setSlots((prev) =>
      prev.includes(slot)
        ? prev.filter((s) => s !== slot)
        : [...prev, slot]
    );
  };

  const isInvalid =
    !course.trim() ||
    !room.trim() ||
    !lecturers.trim() ||
    slots.length === 0;

  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    if (!data?.id) return;

    await updateDoc(doc(db, "schedules", data.id), {
      course,
      room,
      lecturers: lecturers
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean),
      type,
      dayIndex,
      slots,
      note,
    });
    setLoading(false);

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2>Edit Jadwal</h2>

      <label>Program Studi</label>
      <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Mata Kuliah" />

      <label>Ruangan</label>
      <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Ruangan" />
      
      <label>Dosen</label>
      <input value={lecturers} onChange={(e) => setLecturers(e.target.value)} placeholder="Dosen (dipisah dengan koma)" />

      <label>Tipe</label>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="teori">Teori</option>
        <option value="praktek">Praktek</option>
        <option value="tambahan">Matkul Tambahan</option>
      </select>

      <label>Hari</label>
      <select
        value={dayIndex}
        onChange={(e) => setDayIndex(Number(e.target.value))}
      >
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

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10 }}>
          {slotOptions.map((slot) => {
            const program = data?.program;
            const semester = data?.semester;

            const key = `${program}-${semester}-${dayIndex}-${slot}`;

            const isBlocked =
              occupiedSlots.has(key) && !slots.includes(slot);

            const isSelected = slots.includes(slot);

            return (
              <div
                key={slot}
                onClick={() => toggleSlot(slot)}
                className={`button-jam 
                  ${isBlocked ? "blocked" : "enabled"} 
                  ${isSelected ? "selected" : ""}`}
              >
                {slot}
              </div>
            );
          })}
        </div>

          <label>Note</label>
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (Optional)" />

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