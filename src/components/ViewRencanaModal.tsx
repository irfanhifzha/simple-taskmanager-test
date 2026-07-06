import { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import {
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";

import {
  statusStyles,
} from "../types/scheduleTypes";

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
  const isInitialLoad = useRef(true);
  const skipResetRef = useRef(false);

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

  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);

  const monthLabel = months.find(m => m.value === bulan)?.label || bulan;

  const date = new Date(tahun, bulan - 1, tanggal[0]);
  const hari = date.toLocaleDateString("id-ID", {
    weekday: "long",
  });

  const firstHari =
    tanggal.length > 0
      ? new Date(tahun, bulan - 1, Math.min(...tanggal)).toLocaleDateString("id-ID", {
        weekday: "long",
      })
      : "-";

  const lastHari =
    tanggal.length > 0
      ? new Date(tahun, bulan - 1, Math.max(...tanggal)).toLocaleDateString("id-ID", {
        weekday: "long",
      })
      : "-";

  // LOAD DATA
  useEffect(() => {
    if (open && data) {
      setBulan(data.item.bulan || today.getMonth() + 1);
      setTahun(data.item.tahun || today.getFullYear());

      setTanggal(data.item.tanggal || []);

      if (data.item.tanggal?.length > 0) {
        const sorted = [...data.item.tanggal].sort((a, b) => a - b);

        setStartTanggal(sorted[0]);
        setEndTanggal(sorted[sorted.length - 1]);
      } else {
        setStartTanggal("");
        setEndTanggal("");
      }

      setType(data.item.type || "");
      setTask(data.item.task || "");
      setContent(data.item.content || "");
      setNotes(data.item.notes || "");
      setPeoples((data.item.peoples || []).join(", "));


      isInitialLoad.current = true; // mark initial load
      setEditMode(false);
    }
  }, [open, data]);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (skipResetRef.current) {
      skipResetRef.current = false;
      return;
    }

    setTanggal([]);
    setStartTanggal("");
    setEndTanggal("");
  }, [bulan, tahun]);


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



  const handleClose = () => {
    setErrors({});
    setFormError(null);
    setLoading(false);
    onClose();
    setEditMode(false);
  };




  const handleDelete = async () => {
    if (!data?.item.id) return;


    const confirmed = window.confirm(
      `Delete "${data?.item?.task?.length > 13 ? `${data.item.task.slice(0, 13)}...` : data.item?.task || "null"} [${data?.item?.tanggal?.length > 1 ? `${startTanggal}-${endTanggal}` : `${startTanggal}` || "null"} ${monthLabel} ${tahun}]" dari rencana?`
    );

    if (confirmed) {
      await deleteDoc(doc(db, "calendars", data.item.id));

      onSuccess();
      onClose();
    }
  };




  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!task.trim()) errors.task = "Task wajib diisi";
    if (!type.trim()) errors.type = "Type wajib diisi";
    if (tanggal.length === 0) errors.tanggal = "Tanggal wajib dipilih";

    return errors;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleUpdate = async () => {
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
        editAt: serverTimestamp(),
      };


      await updateDoc(doc(db, "calendars", data.item.id), payload);


      onSuccess();
      handleClose();
    } catch (err) {
      setFormError(`(${err})\n\nGagal menyimpan data`);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Modal open={open} onClose={handleClose}>
        <h2>Detail Rencana</h2>

        {editMode && (
          <p className="-mt-2 text-xs text-gray-400">
            Mengedit:{" "}
            {data?.item.task
              ? data.item.task?.length > 15
                ? `${data.item.task.slice(0, 15)}...`
                : data.item.task
              : "notfound"}{" "}
            [
            {data?.item?.tanggal?.length === 1
              ? `${hari}, ${tanggal[0]} ${monthLabel} ${tahun}`
              : `${firstHari} - ${lastHari}, ${startTanggal}-${endTanggal} ${monthLabel} ${tahun}`}
            ]
          </p>
        )
        }


        <form onSubmit={handleUpdate} >


          {editMode ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
              <div>
                <label htmlFor="title">📌 Title<span>*</span></label>
                <input className="w-full"
                  id="title"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Title rencana"
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

          ) : (<>
            <label>📝 Title</label>
            <div className="flex mb-3 items-center pt-1">
              <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStyles[data?.item?.type] || "bg-gray-200"}`}></div>
              <div className="pt-1">{task}</div>
            </div>
          </>
          )}


          {editMode ? (
            <>
              <label htmlFor="peoples">👥 Pihak Terkait</label>
              <input
                id="peoples"
                placeholder="A, B, .. (dipisah dengan koma)"
                value={peoples}
                onChange={(e) => setPeoples(e.target.value)}
              />
            </>
          ) : (
            data?.item?.peoples?.length > 0 && (
              <div>
                <label>👥 Pihak Terkait</label>
                <div className="mt-2 flex flex-wrap gap-2  mb-4">
                  {peoples.split(",").map((peoples, index) => (
                    <div key={index} className="rounded-lg px-3 py-1 bg-gray-100">
                      {peoples}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}


          {editMode || !data ? (<>
            <label htmlFor="desc">💬 Deskripsi</label>
            <textarea
              id="desc"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Deskripsi rencana"
            /></>
          ) : (
            data?.item?.content && (<>
              <label>💬 Deskripsi</label>
              <div className="bg-gray-100 p-2 rounded-lg my-2 mb-4">
                <p className="whitespace-pre-line mb-0!">{content}</p>
              </div></>
            )
          )}



          {editMode || !data ? (<>
            <label htmlFor="notes">📌 Note / Link URL</label>
            <textarea
              id="notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes rencana"
            /></>
          ) : (
            data?.item?.notes && (<>
              <label>📌 Note / Link URL</label>
              <div className="bg-gray-100 p-2 rounded-lg my-2 mb-4">
                <p className="whitespace-pre-line text-blue-500 mb-0!">{notes}</p>
              </div></>
            )
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
                  <label htmlFor="startTgl">Dari Tgl<span>*</span></label>
                  <select id="startTgl"
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
                  <label htmlFor="endTgl">Sampai Tgl<span>*</span></label>
                  <select id="endTgl"
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
            </>
          ) : (
            <>
              <label>📅 Waktu</label>
              <p className="py-2">
                {tanggal.length > 0 && (() => {
                  if (tanggal.length === 1) { return `${hari}, ${tanggal[0]} ${monthLabel} ${tahun}`; }
                  return `${firstHari} - ${lastHari}, ${startTanggal}-${endTanggal} ${monthLabel} ${tahun}`;
                })()}
              </p>
            </>
          )}





          {!editMode && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <label>📪 Dibuat Pada</label>
                <div className="mt-1 py-1">
                  <p className="text-gray-400 text-xs">
                    {data?.item?.createdAt ? (() => {
                      const date = data.item.createdAt.toDate();
                      return `${date.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })} ${date.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;
                    })() : 'Tidak diketahui'}
                  </p>
                </div>
              </div>

              <div>
                <label>✒️ Diedit Pada</label>
                <div className="mt-1 py-1">
                  <p className="text-gray-400 text-xs">
                    {data?.item?.editAt ? (() => {
                      const date = data.item.editAt.toDate();
                      return `${date.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })} ${date.toLocaleTimeString('en-GB', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}`;
                    })() : 'Belum pernah diedit'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {formError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              <div className="whitespace-pre-line break-words">
                {formError}
              </div>

              {Object.keys(errors).length > 0 && (
                <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                  {errors.task && <li>• {errors.task}</li>}
                  {errors.type && <li>• {errors.type}</li>}
                  {errors.tanggal && <li>• {errors.tanggal}</li>}
                </ul>
              )}
            </div>
          )}



          {/* EDIT TOGGLE */}
          {/* USER CONTROLS */}
          {data?.login && (
            <div className="grid grid-cols-2 gap-4 mt-2">
              {/* NOT IN EDIT MODE */}
              {!editMode && (
                <>
                  <button type="button"
                    onClick={() => {
                      setEditMode(true);
                    }}
                  >
                    ✏️ Edit
                  </button>

                  <button type="button" className="active:cursor-default! border-red-300! hover:bg-red-700 hover:text-white! active:bg-red-800! active:text-white!"
                    onClick={handleDelete}
                  >
                    <div>🗑️ Delete</div>
                  </button>
                </>
              )}

              {/* EDIT MODE */}
              {editMode && (
                <>
                  <button type="button"
                    onClick={() => {
                      skipResetRef.current = true;

                      setBulan(data.item.bulan || today.getMonth() + 1);
                      setTahun(data.item.tahun || today.getFullYear());

                      setTanggal(data.item.tanggal || []);

                      if (data.item.tanggal?.length > 0) {
                        const sorted = [...data.item.tanggal].sort((a, b) => a - b);
                        setStartTanggal(sorted[0]);
                        setEndTanggal(sorted[sorted.length - 1]);
                      } else {
                        setStartTanggal("");
                        setEndTanggal("");
                      }

                      setType(data.item.type || "");
                      setTask(data.item.task || "");
                      setContent(data.item.content || "");
                      setNotes(data.item.notes || "");

                      setEditMode(false);
                    }}
                  >
                    ❌ Cancel
                  </button>

                  <button type="button"
                    onClick={handleUpdate}
                    disabled={loading}
                    className={`border border-gray-200! px-4 py-2 rounded-md transition ${loading ? "bg-gray-400! opacity-50 cursor-not-allowed!" : "hover:bg-gray-800 hover:text-white! active:bg-gray-900! active:text-white! cursor-pointer"}`}>
                    {loading ? "⏳ Loading..." : "💾 Simpan"}
                  </button>
                </>
              )}
            </div>
          )}

        </form>

      </Modal>



    </>
  );
}