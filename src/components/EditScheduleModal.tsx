import { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import { updateDoc, doc, getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";

const slotOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

const days = [
  { label: "Senin", value: 1 },
  { label: "Selasa", value: 2 },
  { label: "Rabu", value: 3 },
  { label: "Kamis", value: 4 },
  { label: "Jumat", value: 5 },
  { label: "Sabtu", value: 6 }, { label: "Minggu", value: 7 },
];

export default function EditScheduleModal({
  open,
  onClose,
  data,
  onSuccess,
}: any) {

  const [course, setCourse] = useState("");
  const [room, setRoom] = useState("");
  const [peoples, setPeoples] = useState("");
  const [type, setType] = useState("teori");
  const [dayIndex, setDayIndex] = useState<number>(1);
  const [slots, setSlots] = useState<number[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<Set<string>>(new Set());
  const [note, setNote] = useState("");

  const [showInvalid, setShowInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);



  // ✅ load existing data
  useEffect(() => {
    if (open && data) {
      setCourse(data.course || "");
      setRoom(data.room || "");
      setPeoples((data.peoples || []).join(", "));
      setType(data.type || "");
      setDayIndex(data.dayIndex || 1);
      setSlots(data.slots || []);
      setNote(data.note || "");

      isInitialLoad.current = true; // mark initial load
    }
  }, [open, data]);

  
  const loadConflicts = async () => {
    const snap = await getDocs(collection(db, "schedules"));

    const occupied = new Set<string>();

    snap.forEach((docSnap) => {
      const d = docSnap.data();

     
      if (docSnap.id === data?.id) return;

      const day = d.dayIndex;
      

      (d.slots || []).forEach((slot: number) => {
        occupied.add(`${day}-${slot}`);
      });
    });

    setOccupiedSlots(occupied);
  };

  useEffect(() => {
    if (open) {
      loadConflicts();
      setShowInvalid(false);
    }
  }, [open, dayIndex, data?.id]);

  useEffect(() => {
    if (isInitialLoad.current) {
      // skip reset on first load
      isInitialLoad.current = false;
      return;
    }

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

  const isInvalid =
    !course.trim() ||
    dayIndex === 0 ||
    slots.length === 0;



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
      peoples: peoples
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
      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Mengedit data: {data?.course || "notfound"}{" "}
        [Hari {dayLabels[data?.dayIndex - 1] || "null"},
        {" "}
        {data?.slots?.length > 1
          ? `Jam ${data.slots.at(0)}.00 - ${data.slots.at(-1)}.00`
          : `Jam ${data?.slots?.at(0) ?? "?"}.00`
        }
        ]
      </p>

      <form onSubmit={handleUpdate}>
        <label>Nama Task<span>*</span></label>
        <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Nama task" />

        <label>Ruangan</label>
        <input value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Ruangan" />

        <label>Orang terkait</label>
        <input value={peoples} onChange={(e) => setPeoples(e.target.value)} placeholder="Related person (dipisah dengan koma)" />

        <label>Note</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Deskripsi task" />


        <label>Tipe<span>*</span></label>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="green">Hijau</option>
          <option value="blue">Biru</option>
          <option value="red">Merah</option>
          <option value="orange">Oranye</option>
          <option value="purple">Purple</option>
          <option value="abu">Abu</option>
        </select>

        <label>Hari<span>*</span></label>
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

       

        <label>Jam<span>*</span></label>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6, marginBottom: 10 }}>
          {slotOptions.map((slot) => {
            

            const key = `${dayIndex}-${slot}`;

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
      </form>
    </Modal>
  );
}