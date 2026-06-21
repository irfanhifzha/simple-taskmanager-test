import { useEffect, useState } from "react";
import {
    collection,
    getDocs,
    getDoc,
    doc
} from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

// COMPONENTS
import Navbar from "../components/Navbar";

// MODALS (UNCHANGED)
import AddScheduleModal from "../components/AddScheduleModal";
import EditScheduleModal from "../components/EditScheduleModal";
import DeleteScheduleModal from "../components/DeleteScheduleModal";

import AddTugasModal from "../components/AddTugasModal";
import EditTugasModal from "../components/EditTugasModal";
import DeleteTugasModal from "../components/DeleteTugasModal";

import AddTugasModalAgain from "../components/AddTugasModalAgain";
import EditTugasModalAgain from "../components/EditTugasModalAgain";
import DeleteTugasModalAgain from "../components/DeleteTugasModalAgain";
import Dashboard from "../components/Dashboard";

// MODALS UNTUK CALENDAR
import AddRencanaModal from "../components/AddRencanaModal";
import ViewRencanaModal from "../components/ViewRencanaModal";


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


    const [user, setUser] = useState(null);
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


    // auth
    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);


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
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
            <p className="text-black text-md font-bold">{title}</p>

            <div className="flex gap-3 mb-[10px] flex-wrap">

                <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                    onClick={() => setTugasVisibility(prev => !prev)}>
                    {tugasVisibility ? "👀 Hide Tugas" : "🔍 Show Tugas"}
                </button>

                {user && (
                    <>
                        <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                            onClick={() => setOpenAdd(true)}>
                            + Tambah Jadwal
                        </button>

                        <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                            onClick={() => setEditMode(prev => !prev)}>
                            {editMode ? "🔒 Exit Edit Mode" : "✏️ Update Data"}
                        </button>
                    </>
                )}




            </div>




            <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
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

                                                // sini task mau fit(bisa banyak) atau full(satu doang full)?
                                                <div className={`animate-[fadeUp_0.5s_ease-out_forwards] relative flex flex-col gap-2 rounded-lg overflow-hidden h-full justify-center m-0 p-3 hover:-translate-y-1 transition duration-200 ease active:-translate-y-1 wrap-break-word text-[10px] pb-4
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
                                                        <div className="flex justify-center items-center gap-1 mt-2 rounded-lg border border-green-300 bg-white p-2 text-green-700 text-[8px] w-fit select-none">
                                                            <div className="inline-block w-2 h-2 me-[1px] align-middle rounded-full bg-current transition-all duration-200 animate-[pulse_0.75s_infinite]"></div>
                                                            <span> Live {currentHour}.00 | Jam {s.slots.at(0)}.00 - {s.slots.at(-1)}.00</span>
                                                        </div>
                                                    )}


                                                    {/* CRUD BUTTONS (UNCHANGED) */}
                                                    {user && editMode && (
                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => {
                                                                    setSelected(s);
                                                                    setOpenEdit(true);
                                                                }}
                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-blue-500 rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                            >
                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">
                                                                    edit</span>
                                                            </button>

                                                            <button
                                                                onClick={() => {
                                                                    setSelected(s);
                                                                    setOpenDelete(true);
                                                                }}
                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-blue-500 rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  outline-none active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                            >
                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">
                                                                    delete</span>
                                                            </button>

                                                            {s.titleTugas ? (
                                                                s.titleTugasAgain ? (
                                                                    <button disabled
                                                                        className="bg-white p-0 shadow-md hover:shadow-lg text-gray-400 rounded-md w-[25px] h-[25px] border border-gray-200"
                                                                    >
                                                                        <span className="material-symbols-rounded text-[17px]/[1.5]!">warning</span>
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => {
                                                                            setSelected(s);
                                                                            setOpenTugasAddAgain(true);
                                                                        }}
                                                                        className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-blue-500 rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                                    >
                                                                        <span className="material-symbols-rounded text-[17px]/[1.5]!">playlist_add</span>
                                                                    </button>
                                                                )
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        setSelected(s);
                                                                        setOpenTugasAdd(true);
                                                                    }}
                                                                    className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-blue-500 rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                                >
                                                                    <span className="material-symbols-rounded text-[17px]/[1.5]!">add</span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* CONTENT (UNCHANGED) */}
                                                    <p className="font-semibold text-sm wrap-break-word mt-2 me-10">{s.course}</p>
                                                    <p>{s.room}</p>
                                                    <p className="text-blue-700">
                                                        {s.lecturers.join(", ")}
                                                    </p>

                                                    {s.note && <p className="text-gray-500">{s.note}</p>}

                                                    {/* TUGAS */}
                                                    {tugasVisibility && (
                                                        <>
                                                            {s.titleTugas && (
                                                                <div className="bg-white px-3 py-2 mt-2 rounded-lg text-black"
                                                                    style={{ display: "block" }}>

                                                                    {/* adain lagi crud for tugas */}
                                                                    {user && editMode && (
                                                                        <div className="flex gap-2 mb-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected(s);
                                                                                    setOpenTugasEdit(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600">
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">edit</span>
                                                                            </button>


                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected(s);
                                                                                    setOpenTugasDelete(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600">
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">delete</span>
                                                                            </button>

                                                                        </div>
                                                                    )}


                                                                    <div className="flex mb-2 font-bold text-xs items-center">
                                                                        <div className={`
                                                                            w-[10px] h-[10px] rounded-[100%] inline-block me-1 align-middle
                                                                            ${statusStyles[s.statusTugas] || "bg-gray-200"}
                                                                            `}></div>
                                                                        <div>{s.titleTugas}</div>
                                                                    </div>
                                                                    <p className="font-bold mb-2">{s.h1Tugas}</p>
                                                                    <p className="mb-2">{s.note1Tugas}</p>
                                                                    <p className="mb-2">{s.note2Tugas}</p>
                                                                </div>
                                                            )}

                                                            {s.titleTugasAgain && (
                                                                <div className="bg-white px-3 py-2 rounded-lg text-black"
                                                                    style={{ display: "block" }}>

                                                                    {/* adain lagi crud for tugas */}
                                                                    {user && editMode && (
                                                                        <div className="flex gap-2 mb-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected(s);
                                                                                    setOpenTugasEdit(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600">
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">edit</span>
                                                                            </button>


                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected(s);
                                                                                    setOpenTugasDelete(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600">
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">delete</span></button>

                                                                        </div>
                                                                    )}


                                                                    <div className="flex mb-2 font-bold text-xs items-center">
                                                                        <div className={`
                                                                            w-[10px] h-[10px] rounded-[100%] inline-block me-1 align-middle
                                                                            ${statusStyles[s.statusTugasAgain] || "bg-gray-200"}
                                                                            `}></div>
                                                                        <div>{s.titleTugasAgain}</div>
                                                                    </div>
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











    // NEW CALENDAR

    const Calendar = {
        id: undefined,

        program: "",
        semester: 0,

        tahun: 0,

        bulan: 0,
        tanggal: [],

        task: "",
        type: "",
        content: "",
    };

    // firestore calendar data
    const [calendar, setCalendar] = useState([]);

    // current displayed month
    const [currentDate, setCurrentDate] = useState(new Date());

    // FETCH FIRESTORE
    const fetchCalendar = async () => {

        const snap_calendar = await getDocs(
            collection(db, "calendar")
        );

        const data_calendar = snap_calendar.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setCalendar(
            data_calendar.filter(
                d =>
                    d.program === "TRPL" &&
                    d.semester === semester
            )
        );
    };

    useEffect(() => {
        fetchCalendar();
    }, [semester]);

    // FIND EVENT FOR SPECIFIC DATE
    const getCalendar = (data, bulan, tgl) => {
        return data.filter(
            (s) =>
                s.bulan === bulan &&
                Array.isArray(s.tanggal) &&
                s.tanggal.includes(tgl)
        );
    };

    // BUILD CALENDAR MATRIX
    const buildCalendar = (
        year,
        month
    ) => {

        const firstDay = new Date(
            year,
            month,
            1
        ).getDay();

        const daysInMonth = new Date(
            year,
            month + 1,
            0
        ).getDate();

        const weeks = [];

        let week =
            new Array(7).fill(null);

        let day = 1;

        // first week
        for (let i = firstDay; i < 7; i++) {
            week[i] = day++;
        }

        weeks.push(week);

        // remaining weeks
        while (day <= daysInMonth) {

            week = new Array(7).fill(null);

            for (
                let i = 0;
                i < 7 && day <= daysInMonth;
                i++
            ) {
                week[i] = day++;
            }

            weeks.push(week);
        }

        return weeks;
    };

    // CURRENT YEAR + MONTH
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const weeks = buildCalendar(year, month);

    const daysHeader = [
        "Min",
        "Sen",
        "Sel",
        "Rab",
        "Kam",
        "Jum",
        "Sab"
    ];



    // new const for button crud

    const [selected_cal, setSelected_cal] = useState(null);

    const [openAddRencana, setOpenAddRencana] = useState(false);
    // const [openDeleteRencana, setOpenDeleteRencana] = useState(false);
    const [openViewRencana, setOpenViewRencana] = useState(false);



    const renderCalendar = () => {
        return (
            <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">



                {/* TITLE */}
                <p className="text-black text-md font-bold">
                    TRPL REG 24 - Timeline Kegiatan {" "}
                    {
                        currentDate.toLocaleString(
                            "default",
                            { month: "long" }
                        )
                    } {year}
                </p>

                {/* BUTTONS */}
                <div className="flex gap-3 mb-[10px] flex-wrap">

                    <button className="px-3 py-2 border border-gray-200 outline-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    year,
                                    month - 1,
                                    1
                                )
                            )
                        }
                    >
                        Prev
                    </button>

                    <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                        onClick={() =>
                            setCurrentDate(
                                new Date(
                                    year,
                                    month + 1,
                                    1
                                )
                            )
                        }
                    >
                        Next
                    </button>

                    <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                        onClick={() =>
                            setCurrentDate(
                                new Date()
                            )
                        }
                    >
                        Today
                    </button>

                    {user && (
                        <>
                            <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold"
                                onClick={() => setOpenAddRencana(true)}>
                                + Tambah Rencana
                            </button>
                        </>
                    )}

                </div>

                {/* CALENDAR */}
                <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">

                    <table className="relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 [&_td]:h-[36px] [&_td]:p-2 max-lg:w-[960px] [&_td]:h-[150px]">

                        <thead>
                            <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                                {daysHeader.map(day => (
                                    <th key={day}>
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>

                            {weeks.map((week, i) => (

                                <tr key={i}>

                                    {week.map((day, j) => {

                                        const events =
                                            day !== null
                                                ? getCalendar(
                                                    calendar,
                                                    month + 1,
                                                    day
                                                )
                                                : [];

                                        const isToday = day === new Date().getDate() &&
                                            month === new Date().getMonth() &&
                                            year === new Date().getFullYear();

                                        return (

                                            <td
                                                key={j}
                                                className={
                                                    day !== null
                                                        ? "bg=white"
                                                        : "bg-gray-200"
                                                }
                                            >

                                                <div className="flex flex-col gap-2 h-full">

                                                    {/* DATE */}
                                                    <div className="h-5 w-full text-xs relative flex items-center justify-center font-semibold">
                                                        {day ? (
                                                            <div
                                                                className={
                                                                    isToday
                                                                        ? "w-7 h-7 bg-blue-100 border border-blue-300 text-blue-700 rounded-full flex items-center justify-center"
                                                                        : "w-7 h-7 flex items-center justify-center"
                                                                }
                                                            >
                                                                {day}
                                                            </div>
                                                        ) : null}
                                                    </div>


                                                    {/* TASKS */}
                                                    {events.map((item, idx) => (
                                                        item.tanggal.length === 1 ? (

                                                            /* SHORT TASK */
                                                            <div
                                                                key={idx}
                                                                className="relative flex flex-col my-1 items-center justify-center rounded-lg border border-gray-300"
                                                            >
                                                                <div>

                                                                    <div onClick={() => {
                                                                        setSelected_cal(item);
                                                                        setOpenViewRencana(true);
                                                                    }}
                                                                        className={`mt-1 w-5 h-5 rounded-full ${statusStyles[item.type] || "bg-gray-500"}`}></div>
                                                                </div>

                                                                <div className="text-black text-xs m-1 text-center">
                                                                    {item.task}
                                                                </div>
                                                            </div>

                                                        ) : (

                                                            /* LONG TASK */
                                                            <div
                                                                key={idx}
                                                                className="relative flex flex-col m-0 z-1 justify-center"
                                                            >

                                                                {/* SHOW TASK ONLY ON FIRST tanggal */}
                                                                {item.tanggal[0] === day ? (
                                                                    <>
                                                                        <div className={`
                                                                            absolute top-0 right-0 z-10
                                                                            flex whitespace-nowrap overflow-auto items-center
                                                                            w-fit h-7 absolute top-0 left-0 rounded-lg text-white ${statusStyles[item.type] || "bg-gray-500"}`}>

                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected_cal(item);
                                                                                    setOpenViewRencana(true);
                                                                                }}
                                                                                className="text-[20px]! mx-2 material-symbols-rounded">
                                                                                visibility
                                                                            </button>
                                                                            {item.task}
                                                                        </div>

                                                                    </>

                                                                ) : (

                                                                    <div className={`w-full h-7 absolute z-2 top-0 left-0 rounded-lg text-white opacity-60 z-1 ${statusStyles[item.type] || "bg-gray-500"}`}>

                                                                    </div>

                                                                )}


                                                                {/* SHOW BANNER */}
                                                                {/* <div
                                                                    className={`w-full h-7 absolute top-0 left-0 rounded-lg text-white ${statusStyles[item.type] || "bg-gray-500"}`}
                                                                ></div> */}





                                                            </div>

                                                        )

                                                    ))}

                                                </div>

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
    };





































    return (
        <>


            <Navbar />

            <div className="m-0 p-0 flex flex-col bg-orange-100">
                <div className="mt-3 flex flex-col h-fit rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 overflow-hidden mx-5 bg-white">

                    <p className="text-xs p-2 m-2">

                        todo:<br />
                        1.  jam hari viewed bisa custom ubah2<br />
                        2.  copy jadwal: perday, perweek, pertask+tugas<br />
                        3.  gabung modal biar satu file, but interchangeable mau buka modal apa like return table<br />
                        4.  tabel jadwal bisa lebih dari satu task? (w fit/full)<br />
                        5.  tabel jadwal kategori like reguler ganti, lebih dari satu jadwal? kategorisasi untuk siapa<br />
                        6.  BUAT ORANG SET TO WHOM TASK<br />
                        7.  filter everything<br />
                        8.  fix css nama variabel everything -: sehingga butuh redesign firestore structure<br />
                        9.  ...<br />
                        10. ...<br />

                    </p>



                    <div>
                        <p className="font-bold text-lg uppercase">
                            Dashboard Jadwal Kuliah - TRPL REG 24 // jam-hari bisa custom nanti
                        </p>
                    </div>





                    {renderCalendar()}

                    {renderTable(`TRPL REG 24 - Semester ${semester} (${kategori}) / SKS ${sks_semesterini}`, schedule)}






                </div>
            </div>

            {/* MODALS (UNCHANGED) */}
            <AddScheduleModal open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={fetchSchedules} />
            <EditScheduleModal open={openEdit} onClose={() => setOpenEdit(false)} data={selected} onSuccess={fetchSchedules} />
            <DeleteScheduleModal open={openDelete} onClose={() => setOpenDelete(false)} data={selected} onSuccess={fetchSchedules} />

            <AddTugasModal open={openTugasAdd} data={selected} onClose={() => setOpenTugasAdd(false)} onSuccess={fetchSchedules} />
            <EditTugasModal open={openTugasEdit} data={selected} onClose={() => setOpenTugasEdit(false)} onSuccess={fetchSchedules} />
            <DeleteTugasModal open={openTugasDelete} data={selected} onClose={() => setOpenTugasDelete(false)} onSuccess={fetchSchedules} />

            <AddTugasModalAgain open={openTugasAddAgain} data={selected} onClose={() => setOpenTugasAddAgain(false)} onSuccess={fetchSchedules} />
            <EditTugasModalAgain open={openTugasEditAgain} data={selected} onClose={() => setOpenTugasEditAgain(false)} onSuccess={fetchSchedules} />
            <DeleteTugasModalAgain open={openTugasDeleteAgain} data={selected} onClose={() => setOpenTugasDeleteAgain(false)} onSuccess={fetchSchedules} />


            {/* MODAL UNTUK CALENDAR RENCANA */}
            <AddRencanaModal open={openAddRencana} onClose={() => setOpenAddRencana(false)} onSuccess={fetchCalendar} />
            <ViewRencanaModal open={openViewRencana} data={selected_cal} onClose={() => setOpenViewRencana(false)} onSuccess={fetchCalendar} />




        </>
    );
}