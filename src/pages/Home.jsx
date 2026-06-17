

import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    getDoc,
    doc
} from "firebase/firestore";
import { db } from "../firebase";

// MODALS (UNCHANGED)
// import AddScheduleModal from "../components/AddScheduleModal";
// import EditScheduleModal from "../components/EditScheduleModal";
// import DeleteScheduleModal from "../components/DeleteScheduleModal";

// import AddTugasModal from "../components/AddTugasModal";
// import EditTugasModal from "../components/EditTugasModal";
// import DeleteTugasModal from "../components/DeleteTugasModal";

// import AddTugasModalAgain from "../components/AddTugasModalAgain";
// import EditTugasModalAgain from "../components/EditTugasModalAgain";
// import DeleteTugasModalAgain from "../components/DeleteTugasModalAgain";
// import Dashboard from "../components/Dashboard";

// MODALS UNTUK CALENDAR
// import AddRencanaModal from "../components/AddRencanaModal";
// import ViewRencanaModal from "../components/ViewRencanaModal";


// import fotokurikulum from "../assets/kurikulumTRPL.png"

const initialSchedule = {
  id: undefined,
  program: "TRPL",
  semester: 0,
  dayIndex: 0,
  slots: [],
  course: "",
  room: "",
  lecturers: [],
  type: "teori",

  note: "",

  statusTugas: "",
  titleTugas: "",
  h1Tugas: "",
  note1Tugas: "",
  note2Tugas: "",

  statusTugasAgain: "",
  titleTugasAgain: "",
  h1TugasAgain: "",
  note1TugasAgain: "",
  note2TugasAgain: ""
};


export default function TrplReg24() {

    useEffect(() => {
        document.title = "Jadwal ADB | TRPL REG 24";
    }, []);



    const [schedule, setSchedule] = useState([]);

    const [editMode, setEditMode] = useState(false);
    const [tugasVisibility, setTugasVisibility] = useState(true);

    // modals (UNCHANGED)
    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);

    const [openTugasAdd, setOpenTugasAdd] = useState(false);
    const [openTugasEdit, setOpenTugasEdit] = useState(false);
    const [openTugasDelete, setOpenTugasDelete] = useState(false);

    const [openTugasAddAgain, setOpenTugasAddAgain] = useState(false);
    const [openTugasEditAgain, setOpenTugasEditAgain] = useState(false);
    const [openTugasDeleteAgain, setOpenTugasDeleteAgain] = useState(false);

    const [selected, setSelected] = useState(null);

    const days = [1, 2, 3, 4, 5];
    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];


    // new live
    const [now, setNow] = useState(new Date());

        useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 60000); // update tiap 1 menit

        return () => clearInterval(interval);
    }, []);

    const currentDayIndex = () => {
    const day = now.getDay();
        // JS: Sunday=0 ... Saturday=6
        // your system: Monday=1 ... Friday=5

        if (day === 0 || day === 6) return -1;
        return day;
    };

    const currentHour = now.getHours();


    const liveMatkul = schedule.find(s =>
        s.dayIndex === currentDayIndex() &&
        Array.isArray(s.slots) &&
        s.slots.includes(currentHour)
    );

    // end of live



    // fetch data semester
    const [semester, setSemester] = useState(null);
    const [kategori, setKategori] = useState(null);
    const [sks_semesterini, setSKS] = useState(null);


    useEffect(() => {
    getDoc(doc(db, "kelas", "trplreg24")).then((snap) => {
        if (snap.exists()) {
        setSemester(snap.data().semester);
        setKategori(snap.data().kategori);
        setSKS(snap.data().sks_semesterini);
        }
    });
    }, []);

    // FETCH (FIXED FILTER ONLY)
    const fetchSchedules = async () => {
        const snap = await getDocs(collection(db, "schedules"));

        const data = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setSchedule(
            data.filter(d => d.program === "TRPL" && d.semester === semester)
        );
    };

    useEffect(() => {
    if (semester !== null) {
        fetchSchedules();
    }
    }, [semester]);

    // SESSION LOOKUP (SIMPLE, NO RESTRICTION)
    const getSession = (data, dayIndex, hour) => {
        return data.find(
            s =>
                s.dayIndex === dayIndex &&
                Array.isArray(s.slots) &&
                s.slots.includes(hour)
        ) || null;
    };

    const renderTable = (title, data) => (
        <div className="m-5 flex flex-col h-fit w-fit rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white">
            <p className="text-black text-md font-bold">{title}</p>

            <div className="flex gap-3 mb-[10px]" style={{animation:"fadeUp 0.5s ease-out"}}>

                <button className="px-3 py-2 border border-gray-200 outline-none select-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95"
                onClick={() => setTugasVisibility(prev => !prev)}>
                    {tugasVisibility ? "👀 Hide Tugas" : "🔍 Show Tugas"}
                </button>

            


            </div>


            

            <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200">
                <table className="jadwal-table">
                    <thead>
                        <tr>
                            <th className="jam">Jam</th>
                            <th>Senin</th>
                            <th>Selasa</th>
                            <th>Rabu</th>
                            <th>Kamis</th>
                            <th>Jumat</th>
                        </tr>
                    </thead>

                    <tbody>
                        {hours.map(hour => (
                            <tr key={hour}>
                                <td className="jam">{hour}:00</td>

                                {days.map(day => {
                                    const s = getSession(data, day, hour);

                                    return (
                                        <td key={day}>
                                            {s && (
                                                
                                                <div className={`jadwal-container add-hover ${s.type}`}>

                                                    {/* LIVE BADGE (ONLY FOR ACTIVE CLASS) */}
                                                    {liveMatkul && liveMatkul.id === s.id && (
                                                        <div className="live-jadwal">
                                                            <div className="circle-blink green-bg"></div>
                                                            <span> Kelas Live | Segera Absen</span>
                                                        </div>
                                                    )}
                                                    

                                                    {/* CRUD BUTTONS (UNCHANGED) */}
                                                    

                                                    {/* CONTENT (UNCHANGED) */}
                                                    <h1>{s.course}</h1>
                                                    <h2>{s.room}</h2>
                                                    <h3 style={{color:"var(--blue-color)"}}>
                                                        {s.lecturers.join(", ")}
                                                    </h3>

                                                    {s.note && <h4>{s.note}</h4>}

                                                    {/* TUGAS */}
                                                    {tugasVisibility && (
                                                        <>
                                                            {s.titleTugas && (
                                                                <div className="card-content-body bg-invert-new" style={{display:"block"}}>

                                                                    {/* adain lagi crud for tugas */}
                                                           
                                                                    
                                                                    <h1>
                                                                        <div className={`circle ${s.statusTugas}`}></div>
                                                                        {s.titleTugas}
                                                                    </h1>
                                                                    <h2><b>{s.h1Tugas}</b></h2>
                                                                    <h2>{s.note1Tugas}</h2>
                                                                    <h2>{s.note2Tugas}</h2>
                                                                </div>
                                                            )}

                                                            {s.titleTugasAgain && (
                                                                <div className="card-content-body bg-invert-new" style={{display:"block"}}>

                                                                     {/* adain lagi crud for tugas */}
                                                                  


                                                                    <h1>
                                                                        <div className={`circle ${s.statusTugasAgain}`}></div>
                                                                        {s.titleTugasAgain}
                                                                    </h1>
                                                                    <h2><b>{s.h1TugasAgain}</b></h2>
                                                                    <h2>{s.note1TugasAgain}</h2>
                                                                    <h2>{s.note2TugasAgain}</h2>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}

                                                </div>
                                                
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>       
            </div>
        </div>
    );





    return (
        <>


            <div className="main-flex">
                <div className="card-container">

                    <div className="card-content-header">
                        <h1>Dashboard Jadwal Kuliah - TRPL REG 24</h1>
                    </div>
                    
                   

                    {renderTable(`TRPL REG 24 - Semester ${semester} (${kategori}) / SKS ${sks_semesterini}`, schedule)}

         
                     
             


                </div>
            </div>

            {/* MODALS (UNCHANGED) */}
            {/* <AddScheduleModal open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={fetchSchedules} />
            <EditScheduleModal open={openEdit} onClose={() => setOpenEdit(false)} data={selected} onSuccess={fetchSchedules} />
            <DeleteScheduleModal open={openDelete} onClose={() => setOpenDelete(false)} data={selected} onSuccess={fetchSchedules} />

            <AddTugasModal open={openTugasAdd} data={selected} onClose={() => setOpenTugasAdd(false)} onSuccess={fetchSchedules} />
            <EditTugasModal open={openTugasEdit} data={selected} onClose={() => setOpenTugasEdit(false)} onSuccess={fetchSchedules} />
            <DeleteTugasModal open={openTugasDelete} data={selected} onClose={() => setOpenTugasDelete(false)} onSuccess={fetchSchedules} />

            <AddTugasModalAgain open={openTugasAddAgain} data={selected} onClose={() => setOpenTugasAddAgain(false)} onSuccess={fetchSchedules} />
            <EditTugasModalAgain open={openTugasEditAgain} data={selected} onClose={() => setOpenTugasEditAgain(false)} onSuccess={fetchSchedules} />
            <DeleteTugasModalAgain open={openTugasDeleteAgain} data={selected} onClose={() => setOpenTugasDeleteAgain(false)} onSuccess={fetchSchedules} />
 */}

       

        </>
    );
}