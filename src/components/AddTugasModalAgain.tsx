import { useEffect, useState } from "react";
import Modal from "./Modal";
import { updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];

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

  const [showInvalid, setShowInvalid] = useState(false);


  useEffect(() => {
    if (open && data) {
      setShowInvalid(false);
    }
  }, [open, data]);

  const isInvalid =
    !statusTugasAgain ||
    !titleTugasAgain.trim()

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    setLoading(true);


    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    if (!data?.id) return;


    await updateDoc(doc(db, "schedules", data.id), {
      tugasAgain: arrayUnion({
        id: Date.now(),
        statusTugasAgain,
        titleTugasAgain,
        h1TugasAgain,
        note1TugasAgain,
        note2TugasAgain,
      }),
    });

    setLoading(false);

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2>+ Tambah Tugas Lagi</h2>


      <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
        Menambah tugas lagi: {data?.course || "notfound"}  [Hari {dayLabels[data?.dayIndex - 1] || "null"},
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
            <label htmlFor="title">📝 Judul Tugas<span>*</span></label>
            <input className="w-full" id="title"
              placeholder="Judul Tugas"
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

        <label htmlFor="h1">🎯 Nama Tugas</label>
        <textarea id="h1"
          placeholder="Nama Tugas"
          value={h1TugasAgain}
          onChange={(e) => setH1(e.target.value)}
        />

        <label htmlFor="note1">💬 Deskripsi Tugas</label>
        <textarea id="note1"
          placeholder="Deskripsi Tugas"
          value={note1TugasAgain}
          onChange={(e) => setNote1(e.target.value)}
        />

        <label htmlFor="note2">✍️ Note</label>
        <textarea id="note2"
          placeholder="Note"
          value={note2TugasAgain}
          onChange={(e) => setNote2(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={isInvalid || loading}
          style={{
            marginTop: 12,
            opacity: isInvalid || loading ? 0.5 : 1,
            cursor: isInvalid || loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? ("Loading...") : ("Simpan")}
        </button>
      </form>
    </Modal>

  );
}