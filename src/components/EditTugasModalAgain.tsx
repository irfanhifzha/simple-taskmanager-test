import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, arrayRemove, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

import {
  statusStyles,
} from "../types/scheduleTypes";

export default function EditTugasModalAgain({
  open,
  onClose,
  data,
  onSuccess,
}: any) {
  const [statusTugasAgain, setStatus] = useState("");
  const [titleTugasAgain, setTitle] = useState("");
  const [h1TugasAgain, setH1] = useState("");
  const [note1TugasAgain, setNote1] = useState("");
  const [note2TugasAgain, setNote2] = useState("");

  const [editMode, setEditMode] = useState(false);



  useEffect(() => {
    const t = data?.tugas;

    if (open && t) {
      setStatus(t.statusTugasAgain || "");
      setTitle(t.titleTugasAgain || "");
      setH1(t.h1TugasAgain || "");
      setNote1(t.note1TugasAgain || "");
      setNote2(t.note2TugasAgain || "");
    }

    setEditMode(false);
  }, [open, data]);



  const [loading, setLoading] = useState(false);


  const handleDelete = async () => {
    if (!data?.schedule?.id || !data?.tugas?.id) return;

    const confirmed = window.confirm(
      `Delete task "${data?.tugas.titleTugasAgain?.length > 20 ? `${data.tugas.titleTugasAgain.slice(0, 20)}...` : data?.tugas?.titleTugasAgain || "null"}" dari jadwal '${data?.schedule.course?.length > 20 ? `${data.schedule?.course.slice(0, 15)}...` : data?.schedule?.course || "null"}'?`
    );

    if (confirmed) {

      const ref = doc(db, "schedules", data.schedule.id);

      await updateDoc(ref, {
        tugasAgain: arrayRemove(data.tugas)
      });

      onSuccess();
      onClose();
    }
  };


  const handleClose = () => {
    setErrors({});
    setFormError(null);
    setLoading(false);
    onClose();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!statusTugasAgain.trim()) errors.statusTugasAgain = "Tipe task wajib diisi";
    if (!titleTugasAgain.trim()) errors.titleTugasAgain = "Judul task wajib diisi";

    return errors;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);


  // ===== SUBMIT =====
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
      const ref = doc(db, "schedules", data.schedule.id);

      const oldItem = data.tugas;

      const updatedItem = {
        ...oldItem,
        statusTugasAgain,
        titleTugasAgain,
        h1TugasAgain,
        note1TugasAgain,
        note2TugasAgain,
        editAt: Timestamp.now(),
      };

      await updateDoc(ref, {
        tugasAgain: arrayRemove(oldItem),
      });

      await updateDoc(ref, {
        tugasAgain: arrayUnion(updatedItem),
      });

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
      <h2>Detail Task ke-{(data?.index ?? 0) + 1}</h2>

      {editMode ? (
        <p className="-mt-2 text-xs text-gray-400">
          Mengedit task dari: {data?.schedule?.course || "notfound"}  [Hari {dayLabels[data?.schedule?.dayIndex - 1] || "null"},
          {" "}
          {data?.schedule?.slots?.length > 1
            ? `Jam ${data.schedule.slots.at(0)}.00 - ${data.schedule.slots.at(-1)}.00`
            : `Jam ${data?.schedule?.slots?.at(0) ?? "?"}.00`
          }
          ]
        </p>
      ) : (
        <p className="-mt-2 text-xs text-gray-400">
          Task dari: {data?.schedule.course ? (data.schedule?.course.length > 15 ? `${data.schedule?.course.slice(0, 15)}...` : data.schedule?.course) : "notfound"}  [Hari {dayLabels[data?.schedule?.dayIndex - 1] || "null"},
          {" "}
          {data?.schedule?.slots?.length > 1
            ? `Jam ${data.schedule.slots.at(0)}.00 - ${data.schedule.slots.at(-1)}.00`
            : `Jam ${data?.schedule?.slots?.at(0) ?? "?"}.00`
          }
          ]
        </p>
      )}

      <form onSubmit={handleUpdate}>

        {editMode ? (<>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
            <div>
              <label htmlFor="title">📝 Judul Task<span>*</span></label>
              <input className="w-full" id="title"
                placeholder="Judul task"
                value={titleTugasAgain}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
              <select id="tipe" className="w-full" value={statusTugasAgain} onChange={(e) => setStatus(e.target.value)}>
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
        </>) : (
          <div>
            <div>
              <label>📝 Judul Task</label>
              <div className="flex mb-3 items-center pt-1">
                <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStyles[data?.tugas?.statusTugasAgain] || "bg-gray-200"}`}></div>
                <div className="pt-1">{titleTugasAgain}</div>
              </div>
            </div>
          </div>
        )}



        {editMode ? (<>
          <label htmlFor="h1">🎯 Nama Task</label>
          <textarea id="h1"
            placeholder="Nama task"
            value={h1TugasAgain}
            onChange={(e) => setH1(e.target.value)}
          />
        </>) : (
          data?.tugas?.h1TugasAgain && (
            <div>
              <label>🎯 Nama Task</label>
              <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                <p className="mb-0! whitespace-pre-line">{h1TugasAgain}</p>
              </div>
            </div>
          )
        )}

        {editMode ? (<>
          <label htmlFor="note1">💬 Deskripsi Task</label>
          <textarea id="note1" rows={3}
            placeholder="Deskripsi task"
            value={note1TugasAgain}
            onChange={(e) => setNote1(e.target.value)}
          /></>) : (
          data?.tugas?.note1TugasAgain && (
            <div>
              <label>💬 Deskripsi Task</label>
              <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                <p className="mb-0! whitespace-pre-line">{note1TugasAgain}</p>
              </div>
            </div>
          ))}

        {editMode ? (<>
          <label htmlFor="note2">✍️ Note</label>
          <textarea id="note2" rows={3}
            placeholder="Note"
            value={note2TugasAgain}
            onChange={(e) => setNote2(e.target.value)}
          /></>) : (
          data?.tugas?.note2TugasAgain && (
            <div>
              <label>✍️ Note</label>
              <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                <p className="mb-0! text-blue-500 whitespace-pre-line">{note2TugasAgain}</p>
              </div>
            </div>)
        )}


        {!editMode && (
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <label>📪 Dibuat Pada</label>
              <div className="mt-1 py-1">
                <p className="text-gray-400 text-xs">
                  {data?.tugas?.createdAt ? (() => {
                    const date = data.tugas.createdAt.toDate();
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
                  {data?.tugas?.editAt ? (() => {
                    const date = data.tugas.editAt.toDate();
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




        {editMode && formError && (
          <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            <div className="whitespace-pre-line break-words">
              {formError}
            </div>

            {Object.keys(errors).length > 0 && (
              <ul className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
                {errors.titleTugasAgain && <li>• {errors.titleTugasAgain}</li>}
                {errors.statusTugasAgain && <li>• {errors.statusTugasAgain}</li>}
              </ul>
            )}
          </div>
        )}




        {/* EDIT TOGGLE */}
        {/* USER CONTROLS */}
        {data?.login && (
          <div className="grid grid-cols-2 gap-4 mt-4">
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
                    const t = data?.tugas;
                    setStatus(t.statusTugasAgain || "");
                    setTitle(t.titleTugasAgain || "");
                    setH1(t.h1TugasAgain || "");
                    setNote1(t.note1TugasAgain || "");
                    setNote2(t.note2TugasAgain || "");

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
  );
}