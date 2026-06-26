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

  const [startTanggal, setStartTanggal] = useState("");
  const [endTanggal, setEndTanggal] = useState("");
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
      setBulan(data.bulan || today.getMonth() + 1);
      setTahun(data.tahun || today.getFullYear());

      setTanggal(data.tanggal || []);

      // ✅ convert array to start & end
      if (data.tanggal?.length > 0) {
        const sorted = [...data.tanggal].sort((a, b) => a - b);

        setStartTanggal(sorted[0]);
        setEndTanggal(sorted[sorted.length - 1]);
      } else {
        setStartTanggal("");
        setEndTanggal("");
      }

      setType(data.type || "");
      setTask(data.task || "");
      setContent(data.content || "");
      setEditMode(false);
    }
  }, [open, data]);


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
    if (bulan > 0) setTanggal([]);
  }, [bulan, tahun]);

  const isInvalid =
    !task.trim() ||
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
          bulan,
          tahun,
          tanggal,
          task,
          type,
          content,
        });
      } else {
        await addDoc(collection(db, "calendar"), {
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


        {/* <form onSubmit={handleSubmit} > */}

          {!editMode ? (<label>📌 Title</label>) : (<label htmlFor="title">📌 Title<span>*</span></label>)}

          {editMode || !data ? (
            <input
              id="title"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Title rencana..."
            />
          ) : (
            <p className="pt-1">{task}</p>
          )}



          {!editMode ? (<label>💬 Deskripsi</label>) : (<label htmlFor="desc">💬 Deskripsi</label>)}

          {editMode || !data ? (
            <textarea
              id="desc"
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
              <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
              <select id="tipe" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="" disabled hidden>Pilih Warna</option>
                <option value="orange">Oranye</option>
                <option value="red">Merah</option>
                <option value="blue">Biru</option>
                <option value="purple">Purple</option>
                <option value="green">Hijau</option>
                <option value="abu">Abu</option>
              </select>
            </>
          )}





          {/* BULAN */}
          <div>


            {editMode && (
              <div className="grid grid-cols-2 gap-4">
                {/* BULAN */}
                <div>
                  <label htmlFor="bulan">Bulan<span>*</span></label>
                  <select
                    id="bulan"
                    className="w-full"
                    value={bulan}
                    onChange={(e) => setBulan(Number(e.target.value))}
                  >
                    <option value={0} disabled hidden>Pilih Bulan</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TAHUN */}
                <div>
                  <label htmlFor="tahun">Tahun<span>*</span></label>

                  {editMode || !data ? (
                    <input
                      id="tahun"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
                <div>
                  <label>Dari Tgl<span>*</span></label>
                  <select
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
                  <label className="mt-3">Sampai Tgl<span>*</span></label>
                  <select
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
            </>
          ) : (
            <>
              <label>📅 Waktu</label>
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
                  >
                    <div>🗑️ Delete</div>
                  </button>
                </>
              )}

              {/* EDIT MODE */}
              {editMode && (
                <>
                  <button
                    onClick={() => {
                      if (originalData) {
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

        {/* </form> */}

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