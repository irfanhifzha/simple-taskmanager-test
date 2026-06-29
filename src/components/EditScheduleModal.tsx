import { useEffect, useState, useRef } from "react";
import Modal from "./Modal";
import { updateDoc, doc, getDocs, collection, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

import AddTugasModalAgain from "../components/AddTugasModalAgain";

const slotOptions = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

const dayLabels = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

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
  const [desc, setDesc] = useState("");
  const [note, setNote] = useState("");

  const [tugasAgain, setTugas] = useState<TugasAgainType[]>([]);;


  const [editMode, setEditMode] = useState(false);

  const [showInvalid, setShowInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const isInitialLoad = useRef(true);

  const [openTugasAddAgain, setOpenTugasAddAgain] = useState(false);
  const selectedSchedule = data?.schedule ?? null;




  const itemRefs = useRef(new Map());

  const recordPositions = () => {
    const map = new Map();

    tugasAgain.forEach((task) => {
      const el = itemRefs.current.get(task.id);
      if (!el) return;

      map.set(task.id, el.getBoundingClientRect());
    });

    return map;
  };

  const [dragId, setDragId] = useState<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [overIndex, setOverIndex] = useState<number | null>(null);

  const handlePointerDown = (index: number, id: number) => {
    setDragIndex(index);
    setDragId(id);
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const el = document.elementFromPoint(e.clientX, e.clientY);
    if (!el) return;

    const target = el.closest("[data-index]");
    if (!target) return;

    const index = Number(target.getAttribute("data-index"));
    setOverIndex(index);
  };

  const handlePointerUp = () => {
    if (dragIndex === null || overIndex === null) {
      setIsDragging(false);
      setDragIndex(null);
      setDragId(null);
      setOverIndex(null);
      return;
    }

    // Record current positions
    const first = recordPositions();

    setTugas((prev) => {
      const updated = [...prev];

      const item = updated.splice(dragIndex, 1)[0];
      updated.splice(overIndex, 0, item);

      return updated;
    });

    requestAnimationFrame(() => {
      itemRefs.current.forEach((el, id) => {
        const last = el.getBoundingClientRect();
        const prev = first.get(id);

        if (!prev) return;

        const dx = prev.left - last.left;
        const dy = prev.top - last.top;

        if (dx || dy) {
          el.animate(
            [
              {
                transform: `translate(${dx}px, ${dy}px)`,
              },
              {
                transform: "translate(0, 0)",
              },
            ],
            {
              duration: 180,
              easing: "ease",
            }
          );
        }
      });
    });

    setIsDragging(false);
    setDragIndex(null);
    setDragId(null);
    setOverIndex(null);
  };


  const handlePointerCancel = () => {
    setIsDragging(false);
    setDragIndex(null);
  };






  const statusStyles: Record<string, string> = {
    "blue": "bg-blue-600",
    "red": "bg-red-600",
    "green": "bg-green-600",
    "orange": "bg-orange-600",
    "purple": "bg-purple-500",
    "abu": "bg-gray-500",
  };




  // ✅ load existing data
  useEffect(() => {
    const s = data?.schedule;

    if (open && s) {
      setCourse(s.course || "");
      setRoom(s.room || "");
      setPeoples((s.peoples || []).join(", "));
      setType(s.type || "");
      setDayIndex(s.dayIndex || 1);
      setSlots(s.slots || []);
      setDesc(s.desc || "");
      setNote(s.note || "");
      setTugas(s.tugasAgain || []);

      isInitialLoad.current = true; // mark initial load
    }

    setEditMode(false);
  }, [open, data]);


  type TugasAgainType = {
    id: number;
    titleTugasAgain: string;
    statusTugasAgain: string;
    h1TugasAgain?: string;
    note1TugasAgain?: string;
    note2TugasAgain?: string;
  };





  const loadConflicts = async () => {
    const snap = await getDocs(collection(db, "schedules"));

    const occupied = new Set<string>();

    snap.forEach((docSnap) => {
      const d = docSnap.data();


      if (docSnap.id === data?.schedule?.id) return;

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


  const handleDelete = async () => {
    if (!data?.schedule?.id) return;

    const confirmed = window.confirm(
      `Delete "${data?.schedule?.course?.length > 13
        ? `${data.schedule.course.slice(0, 13)}...`
        : data?.schedule?.course || "null"
      } [${dayLabels?.[data?.schedule?.dayIndex - 1] || "null"
      }, ${(data?.schedule?.slots || []).length > 1
        ? `Jam ${(data?.schedule?.slots || []).at(0)}.00 - ${(data?.schedule?.slots || []).at(-1)}.00`
        : `Jam ${(data?.schedule?.slots || []).at(0) ?? "?"}.00`
      }]" dari jadwal?`
    );

    if (confirmed) {
      await deleteDoc(doc(db, "schedules", data.schedule.id));

      onSuccess();
      onClose();
    }
  };


  const handleUpdate = async () => {
    setLoading(true);
    if (isInvalid) {
      setShowInvalid(true);
      return;
    }

    if (!data?.schedule?.id) { setLoading(false); return; }

    await updateDoc(doc(db, "schedules", data.schedule.id), {
      course,
      room,
      peoples: peoples
        .split(",")
        .map((l: string) => l.trim())
        .filter(Boolean),
      type,
      dayIndex,
      slots,
      desc,
      note,
      tugasAgain,
    });
    setLoading(false);

    onSuccess();
    onClose();
  };

  return (<>
    <Modal open={open && !openTugasAddAgain} onClose={onClose}>
      <h2>Detail Jadwal</h2>



      {editMode && (
        <p style={{ marginTop: -6, marginBottom: 12, fontSize: 13 }}>
          Mengedit: {data?.schedule?.course || "notfound"}{" "}
          [Hari {dayLabels[data?.schedule?.dayIndex - 1] || "null"},
          {" "}
          {data?.schedule?.slots?.length > 1
            ? `Jam ${data.schedule.slots.at(0)}.00 - ${data.schedule.slots.at(-1)}.00`
            : `Jam ${data?.schedule?.slots?.at(0) ?? "?"}.00`
          }
          ]
        </p>
      )
      }


      <form onSubmit={handleUpdate}>

        {editMode ? (<>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
            <div>
              <label htmlFor="title">📝 Judul<span>*</span></label>
              <input
                className="w-full"
                id="title"
                placeholder="Judul rencana"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="tipe">🏷️ Tipe<span>*</span></label>
              <select className="w-full" id="tipe" value={type} onChange={(e) => setType(e.target.value)}>
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
          data?.schedule?.room ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-4">
              <div>
                <label>📝 Judul</label>
                <div className="flex mb-3 items-center pt-1">
                  <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStyles[data?.schedule?.type] || "bg-gray-200"}`}></div>
                  <div className="pt-1">{course}</div>
                </div>
              </div>


              <div>
                <label>🏢 Tempat</label>
                <p className="pt-1">{data?.schedule?.room || ""}</p>
              </div>
            </div>
          ) : (
            <div>
              <label>📝 Judul</label>
              <div className="flex mb-3 items-center pt-1">
                <div className={`w-[10px] h-[10px] rounded-[100%] inline-block me-2 translate-y-0.5 ${statusStyles[data?.schedule?.type] || "bg-gray-200"}`}></div>
                <div className="pt-1">{course}</div>
              </div>
            </div>
          )
        )}


        {editMode ? (
          <>
            <label htmlFor="ruangan">🏢 Tempat</label>
            <input
              className="w-full"
              id="ruangan"
              placeholder="Ruangan"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
          </>
        ) : (
          data?.schedule && (
            <div>
              <label>🕒 Waktu</label>
              <p className="pt-1">
                {days.find(d => d.value === dayIndex)?.label}, Jam{" "}
                {slots.length > 1
                  ? `${Math.min(...slots)} - ${Math.max(...slots)}`
                  : `${slots[0]}`}
              </p>
            </div>
          )
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
          data?.schedule?.peoples?.length > 0 && (
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



        {editMode ? (
          <>
            <label htmlFor="desc">💬 Deskripsi</label>
            <textarea
              id="desc"
              rows={4}
              placeholder="Deskripsi rencana"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </>
        ) : (
          data?.schedule?.desc && (
            <div>
              <label>💬 Deskripsi</label>
              <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                <p className="mb-0! whitespace-pre-line">{desc}</p>
              </div>
            </div>
          )
        )}


        {editMode ? (<>
          <label htmlFor="note">📌 Note / Link URL</label>
          <textarea
            rows={4}
            id="note"
            placeholder="Note rencana / Link url"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </>)
          : (
            data?.schedule?.note && (
              <div>
                <label>📌 Note / Link URL</label>
                <div className="rounded-lg p-3 bg-gray-100 mb-4 mt-2">
                  <p className="mb-0! whitespace-pre-line text-blue-500">{note}</p>
                </div>
              </div>
            )
          )}


        {editMode && (<>



          <label htmlFor="hari">📅 Hari<span>*</span></label>
          <select
            className="w-full"
            id="hari"
            value={dayIndex}
            onChange={(e) => setDayIndex(Number(e.target.value))}
          >
            <option value={0} disabled>Pilih Hari</option>
            {days.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>



          <label htmlFor="jam">🕒 Jam<span>*</span></label>


          <input id="jam" disabled value={[...slots].sort((a, b) => a - b).join(", ")} className="flex w-full h-8"></input>

          <div className="flex flex-wrap w-full gap-1 mt-1 mb-3">
            {slotOptions.map((slot) => {
              const key = `${dayIndex}-${slot}`;
              const isBlocked = occupiedSlots.has(key);
              const isSelected = slots.includes(slot);

              return (
                <div
                  key={slot}
                  onClick={() => toggleSlot(slot)}
                  className={`button-jam 
                  ${isBlocked ? "blocked" : "enabled"} 
                  ${isSelected && !isBlocked ? "selected" : ""}`}
                >
                  {slot}
                </div>
              );
            })}
          </div>
        </>)
        }

        {/* {tugasAgain && (<div>{JSON.stringify(tugasAgain, null, 2)}</div>)} */}


        {!editMode ? (

          tugasAgain.length > 0 && (

            <div className="pt-4 mt-2 border-t-1 border-black">
              <div className="text-gray-500 text-sm pointer-events-none">📂 Daftar task [{tugasAgain.length}]</div>
              <div className="px-4 py-2 bg-gray-100 mt-2 mb-2 pb-3 rounded-lg">
                {tugasAgain?.map((task, index) => (
                  <div key={index}>
                    <div className="flex flex-col mb-1">
                      <div className="flex mb-1 items-center pt-1">
                        {/* <div className="pt-1 me-2">[{index + 1}]</div> */}
                        <div
                          className={`w-[10px] h-[10px] rounded-full inline-block me-2 translate-y-0.5 ${statusStyles[task.statusTugasAgain] || "bg-gray-200"}`}></div>
                        <div>{task.titleTugasAgain}</div>
                      </div>
                      {task.h1TugasAgain &&
                        (<div className="-mt-1 ps-5 flex gap-0.5 w-full text-gray-600/60 text-xs">
                          {task.h1TugasAgain && (<div className="truncate">{task.h1TugasAgain}</div>)}
                          {task.note1TugasAgain && (<div className="truncate">({task.note1TugasAgain})</div>)}
                        </div>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : (
          <div className="pt-4 mt-2 border-t-1 border-black">
            <div className="text-gray-500 text-sm pointer-events-none">📂 Daftar task [{tugasAgain.length}]</div>
            <div
              className="px-4 py-2 bg-gray-100 my-2 pb-4 rounded-lg touch-none"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              {tugasAgain.length > 0 ? (
                tugasAgain?.map((task, index) => (
                  <div key={task.id}>
                    <div
                      key={task.id}
                      data-index={index}
                      ref={(el) => {
                        if (el) itemRefs.current.set(task.id, el);
                      }}
                      className={`border border-gray-200 bg-white mt-2 p-1 px-3 rounded-lg relative flex flex-col mb-1 transition-all duration-150 ${isDragging && dragIndex === index ? "opacity-40 scale-[0.97]" : ""} ${isDragging ? "cursor-grabbing" : ""}`}
                    >

                      <div
                        className="absolute h-full flex w-13 items-center me-3 justify-end top-0 right-0 cursor-grab active:cursor-grabbing touch-none select-none"
                        onPointerDown={() => handlePointerDown(index, task.id)}>
                        <div className="text-xs text-gray-400 me-1">{index + 1}</div>
                        <span className="material-symbols-rounded text-xs text-gray-400">
                          unfold_more
                        </span>
                      </div>


                      <div className="flex mb-1 items-center">

                        <div
                          className={`w-[10px] h-[10px] rounded-full inline-block me-2 translate-y-0.5 ${statusStyles[task.statusTugasAgain] || "bg-gray-200"}`}></div>
                        <div className="pe-15 truncate">{task.titleTugasAgain}</div>
                      </div>
                      {task.h1TugasAgain &&
                        (<div className="-mt-1 ps-5 flex gap-0.5 w-full text-gray-600/60 text-xs pe-15">
                          {task.h1TugasAgain && (<div className="truncate">{task.h1TugasAgain}</div>)}
                          {task.note1TugasAgain && (<div className="truncate">({task.note1TugasAgain})</div>)}
                        </div>)}
                    </div>
                  </div>
                ))) : (
                <div className="flex items-center pt-2">
                  <div className="flex w-full text-gray-600/60 text-sm justify-start h-5 items-center select-none">Tidak ada task :)</div>
                </div>
              )}
            </div>
          </div>
        )}




        {/* EDIT TOGGLE */}
        {/* USER CONTROLS */}
        {data?.login && (
          <div>
            {/* NOT IN EDIT MODE */}
            {!editMode && (
              <>

                <button type="button" className="bg-gray-800! text-white w-full mt-4 flex justify-center"
                  onClick={() => {
                    setOpenTugasAddAgain(true);
                  }}
                >
                  <div>+ Tambah Task</div>
                </button>




                <div className="grid grid-cols-2 gap-4 mt-4">
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
                </div>

              </>
            )}

            {/* EDIT MODE */}
            {editMode && (<>

              <button type="button" className="bg-gray-800! text-white w-full mt-4 flex justify-center"
                onClick={() => {
                  setOpenTugasAddAgain(true);
                }}
              >
                <div>+ Tambah Task</div>
              </button>



              <div className="grid grid-cols-2 gap-4 mt-4">
                <button type="button"
                  onClick={() => {
                    const s = data?.schedule;
                    setCourse(s.course || "");
                    setRoom(s.room || "");
                    setPeoples((s.peoples || []).join(", "));
                    setType(s.type || "");
                    setDayIndex(s.dayIndex || 1);
                    setSlots(s.slots || []);
                    setDesc(s.desc || "");
                    setNote(s.note || "");
                    setTugas(s.tugasAgain || []);

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
              </div>






            </>)}
          </div>
        )}


      </form>

    </Modal >

    <AddTugasModalAgain open={openTugasAddAgain} data={selectedSchedule} onClose={() => { setOpenTugasAddAgain(false); onClose(); }}
      onSuccess={() => {
        setOpenTugasAddAgain(false);
        onSuccess();
        onClose();
      }} />

  </>
  );
}