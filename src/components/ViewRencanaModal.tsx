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

  const [originalData, setOriginalData] = useState<any>(null);

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
    <>
      <Modal open={open} onClose={handleClose}>
        <h2>Detail Rencana</h2>



        {/* <label>Program</label>

        {editMode || !data ? (
          <select
            value={program}
            onChange={(e) => setProgram(e.target.value)}
          >
            <option value="" disabled>Pilih Program Studi</option>
            <option value="TRPL">TRPL</option>
            <option value="BISDIG">BISDIG-Reguler</option>
            <option value="BISDIGeks">BISDIG-Eksekutif</option>
          </select>
        ) : (
          <p className="pt-1">{program}</p>
        )}



        <label>Semester</label>

        {editMode || !data ? (
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value))}
          >
            <option value={0} disabled>Pilih Semester</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        ) : (
          <p className="pt-1">{semester}</p>
        )} */}


        { !editMode ? (<label>Title</label>) : (<label>Title<span>*</span></label>)}

        {editMode || !data ? (
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="Title rencana..."
          />
        ) : (
          <p className="pt-1">{task}</p>
        )}



        { !editMode ? (<label>Deskripsi</label>) : (<label>Deskripsi<span>*</span></label>)}

        {editMode || !data ? (
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Deskripsi rencana..."
          />
        ) : (
          <div className="bg-gray-100 p-2 rounded-lg my-2 mb-4">
            <p className="whitespace-pre-line mb-0!">{content}</p>
          </div>
        )}




        {editMode && (
          <>
            <label>Tipe<span>*</span></label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="" disabled>Pilih Tipe</option>
              <option value="orange-bg">Oranye</option>
              <option value="red-bg">Merah</option>
              <option value="blue-bg">Biru</option>
              <option value="purple-bg">Purple</option>
              <option value="green-bg">Hijau</option>
            </select>
          </>
        )}





        {/* BULAN */}
        <div>


          {editMode && (
            <div className="grid grid-cols-2 gap-4">
              {/* BULAN */}
              <div>
                <label>Bulan<span>*</span></label>
                <select
                  className="w-full"
                  value={bulan}
                  onChange={(e) => setBulan(Number(e.target.value))}
                >
                  <option value={0} disabled>Pilih Bulan</option>
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAHUN */}
              <div>
                <label>Tahun<span>*</span></label>

                {editMode || !data ? (
                  <input
                    className="w-full"
                    value={tahun}
                    onChange={(e) => setTahun(Number(e.target.value))}
                  />
                ) : (
                  <p className="pt-1">{tahun}</p>
                )}
              </div>



            </div>
          )}
        </div>







        {editMode || !data ? (
          <>
            <label>Tanggal<span>*</span></label>
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              {availableDates.map((day) => {
                const isSelected = tanggal.includes(day);

                return (
                  <div
                    key={day}
                    onClick={() => toggleDate(day)}
                    className={`button-jam ${isSelected ? "selected enabled" : "enabled"}`}
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
          </>
        ) : (
          <>
            <label>Waktu</label>
            <p className="py-2">
              {tanggal.length > 0 && (
                <>
                  {tanggal.length === 1
                    ? tanggal[0]
                    : `${Math.min(...tanggal)}-${Math.max(...tanggal)}`}{" "}
                  {months.find(m => m.value === bulan)?.label || bulan} {tahun}
                </>
              )}
            </p>
          </>
        )}








        {/* EDIT TOGGLE */}
        {/* USER CONTROLS */}
        {user && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            {/* NOT IN EDIT MODE */}
            {!editMode && (
              <>
                <button
                  onClick={() => {
                    setOriginalData({
                      program,
                      semester,
                      bulan,
                      tahun,
                      tanggal,
                      type,
                      task,
                      content,
                    });

                    setEditMode(true);
                  }}
                >
                  ✏️ Edit Mode
                </button>

                <button
                  onClick={() => {
                    setSelectedDelete(data);
                    setOpenDeleteRencana(true);
                  }}
                  className="flex justify-center items-center gap-1"
                >
                  <span className="material-symbols-rounded">delete</span>
                  <div>Delete</div>
                </button>
              </>
            )}

            {/* EDIT MODE */}
            {editMode && (
              <>
                <button
                  onClick={() => {
                    if (originalData) {
                      setProgram(originalData.program);
                      setSemester(originalData.semester);
                      setBulan(originalData.bulan);
                      setTahun(originalData.tahun);
                      setTanggal(originalData.tanggal);
                      setType(originalData.type);
                      setTask(originalData.task);
                      setContent(originalData.content);
                    }
                    setEditMode(false);
                  }}
                >
                  ❌ Cancel Edit
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={isInvalid || loading}
                  style={{
                    opacity: isInvalid || loading ? 0.5 : 1,
                    cursor: isInvalid || loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Loading..." : "💾 Simpan"}
                </button>
              </>
            )}
          </div>
        )}
      </Modal>

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

    </>
  );
}