import { useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, arrayUnion, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function AddTugasModalAgain({
  open,
  onClose,
  onSuccess,
  data,
}: any) {
  const [statusTugasAgain, setStatus] = useState("");
  const [titleTugasAgain, setTitle] = useState("");
  const [h1TugasAgain, setH1] = useState("");
  const [note1TugasAgain, setNote1] = useState("");
  const [note2TugasAgain, setNote2] = useState("");


  const handleClose = () => {
    setTitle("");
    setStatus("");
    setH1("");
    setNote1("");
    setNote2("");

    setErrors({});
    setFormError(null);
    setLoading(false);
    onClose();
  };


  const [loading, setLoading] = useState(false);



  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!statusTugasAgain.trim()) errors.statusTugasAgain = "Tipe task wajib diisi";
    if (!titleTugasAgain.trim()) errors.titleTugasAgain = "Judul task wajib diisi";

    return errors;
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);


  // ===== SUBMIT =====
  const handleSubmit = async () => {
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
      await updateDoc(doc(db, "schedules", data.id), {
        tugasAgain: arrayUnion({
          id: Date.now(),
          statusTugasAgain,
          titleTugasAgain,
          h1TugasAgain,
          note1TugasAgain,
          note2TugasAgain,
          createdAt: Timestamp.now(),
        }),
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
      <h2>+ Tambah Task</h2>


      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Menambah task ke: {data?.course ? (data.course.length > 15 ? `${data.course.slice(0, 15)}...` : data.course) : "notfound"}  [Hari {dayLabels[data?.dayIndex - 1] || "null"},
        {" "}
        {data?.slots?.length > 1
          ? `Jam ${data.slots.at(0)}.00 - ${data.slots.at(-1)}.00`
          : `Jam ${data?.slots?.at(0) ?? "?"}.00`
        }
        ]
      </p>

      <form onSubmit={handleSubmit}>
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

        <label htmlFor="h1">🎯 Nama Task</label>
        <textarea id="h1"
          placeholder="Nama task"
          value={h1TugasAgain}
          onChange={(e) => setH1(e.target.value)}
        />

        <label htmlFor="note1">💬 Deskripsi Task</label>
        <textarea id="note1"
          placeholder="Deskripsi task"
          value={note1TugasAgain}
          onChange={(e) => setNote1(e.target.value)}
        />

        <label htmlFor="note2">✍️ Note</label>
        <textarea id="note2"
          placeholder="Note"
          value={note2TugasAgain}
          onChange={(e) => setNote2(e.target.value)}
        />



        {formError && (
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



        <button type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`mt-2 border border-blue-200! px-4 py-2 rounded-md transition ${loading ? "bg-blue-300! opacity-50 cursor-not-allowed!" : "hover:bg-blue-600 hover:text-white! active:bg-blue-800! active:text-white! cursor-pointer"}`}>
          {loading ? "⏳ Loading..." : "+ Tambah Jadwal"}
        </button>
      </form>
    </Modal>

  );
}