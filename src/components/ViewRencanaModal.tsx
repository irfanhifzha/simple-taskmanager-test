import { useEffect, useState } from "react";
import Modal from "./Modal";
import {
  addDoc,
  collection,
  updateDoc,
  doc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import DeleteRencanaModal from "../components/DeleteRencanaModal";

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

export default function ViewRencanaModal({ open, data, onClose, onSuccess }: any) {
  const today = new Date();

  const [bulan, setBulan] = useState<number>(today.getMonth() + 1);
  const [tahun, setTahun] = useState<number>(today.getFullYear());

  const [type, setType] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState<number>(0);

  const [tanggal, setTanggal] = useState<number[]>([]);
  const [content, setContent] = useState("");
  const [task, setTask] = useState("");

  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [editMode, setEditMode] = useState(false);

  const [openDeleteRencana, setOpenDeleteRencana] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState<any>(null);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // LOAD DATA
  useEffect(() => {
    if (open && data) {
      setProgram(data.program || "");
      setSemester(data.semester || 0);
      setBulan(data.bulan || today.getMonth() + 1);
      setTahun(data.tahun || today.getFullYear());
      setTanggal(data.tanggal || []);
      setType(data.type || "");
      setTask(data.task || "");
      setContent(data.content || "");
      setEditMode(false);
    }
  }, [open, data]);

  const getDaysInMonth = (month: number, year: number) =>
    new Date(year, month, 0).getDate();

  const availableDates = Array.from(
    { length: getDaysInMonth(bulan, tahun) },
    (_, i) => i + 1
  );

  useEffect(() => {
    if (bulan > 0) setTanggal([]);
  }, [bulan, tahun]);

  const isInvalid =
    !program.trim() ||
    semester === 0 ||
    !task.trim() ||
    !content.trim() ||
    !type.trim() ||
    tanggal.length === 0;

  const handleClose = () => {
    onClose();
    setEditMode(false);
  };

  const toggleDate = (day: number) => {
    if (!editMode && data) return;

    setTanggal((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  // CREATE / UPDATE
  const handleSubmit = async () => {
    if (isInvalid) return;

    setLoading(true);

    try {
      if (data?.id) {
        await updateDoc(doc(db, "calendar", data.id), {
          program,
          semester,
          bulan,
          tahun,
          tanggal,
          task,
          type,
          content,
        });
      } else {
        await addDoc(collection(db, "calendar"), {
          program,
          semester,
          bulan,
          tahun,
          tanggal,
          task,
          type,
          content,
          createdAt: new Date(),
        });
      }

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
      <h2>View / Edit Rencana</h2>

      {/* EDIT TOGGLE */}
      {user && (
        <>
          <button
            onClick={() => setEditMode((prev) => !prev)}
            style={{ marginBottom: 10 }}
          >
            {editMode ? "👁 View Mode" : "✏️ Edit Mode"}
          </button>

          <button
            onClick={() => {
              setSelectedDelete(data);
              setOpenDeleteRencana(true);
            }}
            className="crud-button-icon material-symbols-rounded "
          >
            delete
          </button>
        </>
      )}

      <label>Program</label>
      {/* PROGRAM */}
      <select
        value={program}
        onChange={(e) => setProgram(e.target.value)}
        disabled={!editMode && !!data}
      >
        <option value="" disabled>Pilih Program Studi</option>
        <option value="TRPL">TRPL</option>
        <option value="BISDIG">BISDIG-Reguler</option>
        <option value="BISDIGeks">BISDIG-Eksekutif</option>
      </select>

      <label>Semester</label>
      {/* SEMESTER */}
      <select
        value={semester}
        onChange={(e) => setSemester(Number(e.target.value))}
        disabled={!editMode && !!data}
      >
        <option value={0} disabled>Pilih Semester</option>
        {[1,2,3,4,5,6,7,8].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <label>Bulan</label>
      {/* BULAN */}
      <select
        value={bulan}
        onChange={(e) => setBulan(Number(e.target.value))}
        disabled={!editMode && !!data}
      >
        <option value={0} disabled>Pilih Bulan</option>
        {months.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      <label>Tahun</label>
      {/* TAHUN */}
      <input
        type="number"
        value={tahun}
        onChange={(e) => setTahun(Number(e.target.value))}
        disabled={!editMode && !!data}
      />


      {/* TANGGAL */}
      <div style={{ marginTop: 10 }}>
        <label>Tanggal</label>
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
                  cursor: editMode || !data ? "pointer" : "not-allowed",
                  background: isSelected ? "#4f46e5" : "",
                  color: isSelected ? "#fff" : "#000",
                  opacity: !editMode && !!data ? 0.6 : 1,
                }}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <label>Tipe</label>
      {/* TYPE */}
      <select
        value={type}
        onChange={(e) => setType(e.target.value)}
        disabled={!editMode && !!data}
      >
        <option value="" disabled>Pilih Tipe</option>
        <option value="orange-bg">Oranye</option>
        <option value="red-bg">Merah</option>
        <option value="blue-bg">Biru</option>
        <option value="purple-bg">Purple</option>
        <option value="green-bg">Hijau</option>
      </select>

      <label>Title</label>
      {/* TASK */}
      <input
        placeholder="Title rencana..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        readOnly={!editMode && !!data}
      />

      <label>Deskripsi</label>
      {/* CONTENT */}
      <input
        placeholder="Deskripsi rencana..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={!editMode && !!data}
      />

      {/* SAVE */}
      {editMode && ( <button
        onClick={handleSubmit}
        disabled={(!editMode && !!data) || isInvalid || loading}
        style={{
          marginTop: 12,
          opacity: isInvalid || loading ? 0.5 : 1,
          cursor: isInvalid || loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Loading..." : "Simpan"}
      </button>
      )}

      {/* DELETE MODAL */}
      <DeleteRencanaModal
        open={openDeleteRencana}
        data={selectedDelete}
        onClose={() => setOpenDeleteRencana(false)}
        onSuccess={() => {
          setOpenDeleteRencana(false);
          onSuccess();
          onClose();
        }}
      />
    </Modal>
  );
}