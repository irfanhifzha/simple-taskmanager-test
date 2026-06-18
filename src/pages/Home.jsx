

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
  program: "",
  semester: 0,
  dayIndex: 0,
  slots: [],
  course: "",
  room: "",
  lecturers: [],
  type: "",

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


    const statusStyles = {
        "blue-bg": "bg-blue-600",
        "red-bg": "bg-red-600",
        "green-bg": "bg-green-600",
        "orange-bg": "bg-orange-600",
        "purple-bg": "bg-purple-500",
    };


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
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white">
            <p className="text-black text-md font-bold">{title}</p>

            <div className="flex gap-3 mb-[10px]" style={{animation:"fadeUp 0.5s ease-out"}}>

                <button className="px-3 py-2 border border-gray-200 outline-none select-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                onClick={() => setTugasVisibility(prev => !prev)}>
                    {tugasVisibility ? "👀 Hide Tugas" : "🔍 Show Tugas"}
                </button>

            


            </div>


            

            <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200">
                <table className="relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 
                [&_td]:h-[36px] [&_td]:p-2 max-lg:w-[960px]">
                    <thead>
                        <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                            <th className="sticky z-5 top-0 left-0 bg-white shadow-lg w-[60px] text-gray-400 font-[IBM_Plex_Sans]">Jam</th>
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
                                <td className="sticky z-5 top-0 left-0 bg-white shadow-lg text-center text-gray-400 font-[IBM_Plex_Sans] font-semibold">{hour}:00</td>

                                {days.map(day => {
                                    const s = getSession(data, day, hour);

                                    return (
                                        <td key={day}>
                                            {s && (
                                                
                                                <div className={`relative flex flex-col gap-2 rounded-lg overflow-hidden h-full justify-center m-0 px-2 py-3 hover:-translate-y-1 transition duration-200 ease
                                                    active:-translate-y-1 wrap-break-word text-[10px]
                                                    
                                                
                                                ${s.type === "teori"
                                                    ? "border border-green-200 bg-green-100 text-green-700"
                                                    : s.type === "praktek"
                                                    ? "border border-blue-200 bg-blue-100 text-blue-800"
                                                    : s.type === "tambahan"
                                                    ? "border border-gray-200 bg-gray-100 text-gray-600"
                                                    : "border border-white bg-white"
                                                }`}>

                                                    {/* LIVE BADGE (ONLY FOR ACTIVE CLASS) */}
                                                    {liveMatkul && liveMatkul.id === s.id && (
                                                        <div className="flex justify-center items-center gap-1 mt-2 rounded-lg border border-green-300 bg-white p-2 text-green-700 text-[8px] w-fit">
                                                            <div className="inline-block w-2 h-2 me-[3px] align-middle rounded-full bg-current transition-all duration-200 animate-[pulse_0.75s_infinite]"></div>
                                                            <span> Kelas Live | Segera Absen</span>
                                                        </div>
                                                    )}
                                                    

                                                    {/* CRUD BUTTONS (UNCHANGED) */}
                                                    

                                                    {/* CONTENT (UNCHANGED) */}
                                                    <p className="font-semibold text-sm wrap-break-word mt-2 me-10">{s.course}</p>
                                                    <p>{s.room}</p>
                                                    <p className="text-blue-700">
                                                        {s.lecturers.join(", ")}
                                                    </p>

                                                    {s.note && <p className="text-gray-500 mb-2">{s.note}</p>}

                                                    {/* TUGAS */}
                                                    {tugasVisibility && (
                                                        <>
                                                            {s.titleTugas && (
                                                                <div className="bg-white px-3 py-2 rounded-lg text-black" 
                                                                style={{display:"block"}}>

                                                                    {/* adain lagi crud for tugas */}
                                                           
                                                                    
                                                                    <p className="mb-2 font-bold text-xs">
                                                                        <div className={`
                                                                            w-[10px] h-[10px] rounded-[100%] inline-block m-1 align-middle

                                                                            bg-blue-600
                                                                            
                                                                            ${statusStyles[s.statusTugas] || "bg-gray-200"}
                                                                            
                                                                            
                                                                            
                                                                            `}></div>
                                                                        {s.titleTugas}
                                                                    </p>
                                                                    <p className="font-bold mb-2">{s.h1Tugas}</p>
                                                                    <p className="mb-2">{s.note1Tugas}</p>
                                                                    <p className="mb-2">{s.note2Tugas}</p>
                                                                </div>
                                                            )}

                                                            {s.titleTugasAgain && (
                                                                <div className="bg-white px-3 py-2 rounded-lg text-black" 
                                                                style={{display:"block"}}>

                                                                    {/* adain lagi crud for tugas */}
                                                           
                                                                    
                                                                    <p className="mb-2 font-bold text-xs">
                                                                        <div className={`
                                                                            w-[10px] h-[10px] rounded-[100%] inline-block m-1 align-middle

                                                                            bg-blue-600
                                                                            
                                                                            ${statusStyles[s.statusTugas] || "bg-gray-200"}
                                                                            
                                                                            
                                                                            
                                                                            `}></div>
                                                                        {s.titleTugasAgain}
                                                                    </p>
                                                                    <p className="font-bold mb-2">{s.h1TugasAgain}</p>
                                                                    <p className="mb-2">{s.note1TugasAgain}</p>
                                                                    <p className="mb-2">{s.note2TugasAgain}</p>
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


            <div className="m-0 p-0 flex flex-col">
                <div className="bg-red-100 w-full h-fit flex flex-col overflow-hidden my-2 p-7">

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