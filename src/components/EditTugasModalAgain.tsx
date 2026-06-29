import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

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

  const [showInvalid, setShowInvalid] = useState(false);

  const statusStyles: Record<string, string> = {
    "blue": "bg-blue-600",
    "red": "bg-red-600",
    "green": "bg-green-600",
    "orange": "bg-orange-600",
    "purple": "bg-purple-500",
    "abu": "bg-gray-500",
  };

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

  useEffect(() => {
    if (open) {
      setShowInvalid(false);
    }
  }, [open]);



  const isInvalid =
    !titleTugasAgain.trim() ||
    !statusTugasAgain.trim();

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




  const handleUpdate = async () => {
    setLoading(true);

    if (isInvalid) {
      setShowInvalid(true);
      setLoading(false);
      return;
    }

    if (!data?.schedule?.id || !data?.tugas?.id) return;

    const ref = doc(db, "schedules", data.schedule.id);

    const oldItem = data.tugas;

    const updatedItem = {
      ...oldItem,
      statusTugasAgain,
      titleTugasAgain,
      h1TugasAgain,
      note1TugasAgain,
      note2TugasAgain,
    };

    await updateDoc(ref, {
      tugasAgain: arrayRemove(oldItem),
    });

    await updateDoc(ref, {
      tugasAgain: arrayUnion(updatedItem),
    });

    setLoading(false);
    onSuccess();
    onClose();
  };



  return (
    <Modal open={open} onClose={onClose}>
      <h2>Detail Task ke-{(data?.index ?? 0) + 1}</h2>

      {editMode && (
        <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
          Mengedit task dari: {data?.schedule?.course || "notfound"}  [Hari {dayLabels[data?.schedule?.dayIndex - 1] || "null"},
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

                <button type="button" className="active:cursor-default! border-red-300! hover:bg-red-600 hover:text-white! active:bg-red-700! active:text-white!"
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

                <button className="border-gray-300! hover:bg-gray-600 hover:text-white! active:bg-gray-700! active:text-white!"
                  onClick={handleUpdate}
                  disabled={isInvalid || loading}
                  style={{
                    opacity: isInvalid || loading ? 0.5 : 1,
                    cursor: isInvalid || loading ? "not-allowed" : "pointer",
                  }}
                >
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