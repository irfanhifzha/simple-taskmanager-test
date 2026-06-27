import { useEffect, useState, useMemo } from "react";
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


export default function Home() {

    useEffect(() => {
        document.title = "asdfasdf";
    }, []);


    const [user, setUser] = useState(null);
    const [schedule, setSchedule] = useState([]);

    const [editMode, setEditMode] = useState(false);
    const [tugasVisibility, setTugasVisibility] = useState(true);
    const [weekendVisibility, setWeekendVisibility] = useState(false);

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

    const days = weekendVisibility
        ? [1, 2, 3, 4, 5, 6, 7]
        : [1, 2, 3, 4, 5];

    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];


    const statusStyles = {
        "blue": "bg-blue-600",
        "red": "bg-red-600",
        "green": "bg-green-600",
        "orange": "bg-orange-600",
        "purple": "bg-purple-500",
        "abu": "bg-gray-500",
    };

    const statusBorder = {
        "green": "bg-green-600 before:border-t-green-600 [&_div]:bg-green-800/50",
        "blue": "bg-blue-600 before:border-t-blue-600 [&_div]:bg-blue-800",
        "red": "bg-red-600 before:border-t-red-600 [&_div]:bg-red-800/50",
        "orange": "bg-orange-600 before:border-t-orange-600 [&_div]:bg-orange-800/50",
        "purple": "bg-purple-500 before:border-t-purple-500 [&_div]:bg-purple-700/60",
        "abu": "bg-gray-500 before:border-t-gray-500 [&_div]:bg-gray-700/50",
    };

    const colorClasses = {
        green: "border border-green-200 bg-green-100 text-green-700 active:bg-green-300/40 active:border-green-300",
        blue: "border border-blue-200 bg-blue-100 text-blue-800 active:bg-blue-300/50 active:border-blue-300",
        red: "border border-red-200 bg-red-100 text-red-700 active:bg-red-300/50 active:border-red-300",
        orange: "border border-orange-200 bg-orange-100 text-orange-700 active:bg-orange-200 active:border-orange-300",
        purple: "border border-purple-200 bg-purple-100 text-purple-700 active:bg-purple-200 active:border-purple-300",
        abu: "border border-gray-300 bg-gray-200 text-gray-700 active:bg-gray-300 active:border-gray-300",
    };

    const colorOutline = {
        green: "border border-green-200 bg-green-100 text-green-700 hover:border-green-600 active:border-green-600",
        blue: "border border-blue-200 bg-blue-100 text-blue-800 hover:border-blue-400 active:border-blue-400",
        red: "border border-red-200 bg-red-100 text-red-700 hover:border-red-400 active:border-red-400",
        orange: "border border-orange-200 bg-orange-100 text-orange-700 hover:border-orange-400 active:border-orange-400",
        purple: "border border-purple-200 bg-purple-100 text-purple-700 hover:border-purple-400 active:border-purple-400",
        abu: "border border-gray-300 bg-gray-100 text-gray-700 hover:border-gray-500 active:border-gray-400",
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
        const unsub = onAuthStateChanged(auth, (u) => { setUser(u); console.log(u); });
        return () => unsub();
    }, []);

    const isLoggedIn = !!user;







    // FETCH (FIXED FILTER ONLY)
    const fetchSchedules = async () => {
        const snap = await getDocs(collection(db, "schedules"));

        const data = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        setSchedule(data);
    };

    useEffect(() => {
        fetchSchedules();
    }, []);

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

                <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                    onClick={() => setTugasVisibility(prev => !prev)}>
                    {tugasVisibility ? "👀 Hide Tugas" : "🔍 Show Tugas"}
                </button>

                <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                    onClick={() => setWeekendVisibility(prev => !prev)}>
                    {weekendVisibility ? "💼 Hide Weekend" : "🗓️ Show Weekend"}
                </button>

                {user && (
                    <>
                        <button className="bg-blue-600 text-white px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold"
                            onClick={() => setOpenAdd(true)}>
                            + Tambah Jadwal
                        </button>

                        <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                            onClick={() => setEditMode(prev => !prev)}>
                            {editMode ? "🔒 Exit Edit Mode" : "✏️ Update Data"}
                        </button>
                    </>
                )}




            </div>




            <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                <table className={`relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200 
                [&_td]:h-[36px] [&_td]:p-2 ${weekendVisibility ? "max-2xl:w-[1700px]" : "max-xl:w-[1200px]"}`}>
                    <thead>
                        <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                            <th className="sticky z-5 top-0 left-0 bg-white shadow-lg w-[60px] text-gray-400 font-[IBM_Plex_Sans]">Jam</th>
                            <th>Senin</th>
                            <th>Selasa</th>
                            <th>Rabu</th>
                            <th>Kamis</th>
                            <th>Jumat</th>
                            {weekendVisibility && (<><th>Sabtu</th>
                                <th>Minggu</th></>)}
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
                                                <div className={`animate-[fadeUp_0.5s_ease-out_forwards] relative flex flex-col gap-2 rounded-lg overflow-hidden h-full justify-center m-0 p-2 hover:-translate-y-1 transition duration-200 ease active:-translate-y-1 wrap-break-word text-[10px] pb-4 ${!editMode ? "cursor-pointer" : ""} ${colorClasses[s.type] ?? "border border-black bg-white"}`}
                                                    onClick={!editMode ? () => { setSelected({ schedule: s, login: isLoggedIn }); setOpenEdit(true); } : undefined}>

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
                                                    <p className="font-semibold text-sm wrap-break-word mt-2 me-10 whitespace-pre-line">{s.course}</p>
                                                    {s.room && (<p>{s.room}</p>)}
                                                    {s.peoples.length > 0 && (
                                                        <div className="flex flex-wrap gap-1">
                                                            {s.peoples.map((person, idx) => (
                                                                <div key={idx} className="text-black px-2 py-1 rounded-lg bg-white w-fit">
                                                                    {person}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {s.desc && <p className="font-medium brightness-50 whitespace-pre-line">{s.desc}</p>}
                                                    {s.note && <p className="text-blue-500 whitespace-pre-line">{s.note}</p>}

                                                    {/* TUGAS */}
                                                    {s.tugasAgain?.length > 0 && (
                                                        <div className="space-y-2">
                                                            {s.tugasAgain.map((t, index) => (
                                                                <div
                                                                    key={t.id}
                                                                    className={`text-black! bg-white px-3 py-2 mt-2 rounded-lg text-black transition duration-200 eases ${!editMode ? "cursor-pointer active:scale-97 active:brightness-90 hover:-translate-y-0.5 bg-white!" : ""} ${colorOutline[s.type] ?? "border border-black bg-white"}`} onClick={!editMode ? (e) => { e.stopPropagation(); setSelected({ schedule: s, tugas: t, index, login: isLoggedIn }); setOpenTugasEditAgain(true); } : undefined}
                                                                >

                                                                    {/* edit/delete */}
                                                                    {user && editMode && (
                                                                        <div className="flex gap-2 mb-3">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected({
                                                                                        schedule: s,
                                                                                        tugas: t,
                                                                                    });
                                                                                    setOpenTugasEditAgain(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                                            >
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">
                                                                                    edit
                                                                                </span>
                                                                            </button>

                                                                            <button
                                                                                onClick={() => {
                                                                                    setSelected({
                                                                                        schedule: s,
                                                                                        tugas: t,
                                                                                    });
                                                                                    setOpenTugasDeleteAgain(true);
                                                                                }}
                                                                                className="bg-white p-0 shadow-md hover:shadow-lg cursor-pointer text-black rounded-md w-[25px] h-[25px] border border-gray-200 hover:-translate-y-0.5 hover:border-blue-600 transition duration-200 ease  active:scale-95 active:bg-gray-100 active:border-blue-600"
                                                                            >
                                                                                <span className="material-symbols-rounded text-[17px]/[1.5]!">
                                                                                    delete
                                                                                </span>
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    {/* title + status */}
                                                                    <div className="flex mb-2 font-bold text-xs items-center">
                                                                        <div
                                                                            className={`w-[10px] h-[10px] rounded-full inline-block me-1 ${statusStyles[t.statusTugasAgain] || "bg-gray-200"}`} />
                                                                        <div>{t.titleTugasAgain}</div>
                                                                    </div>

                                                                    {t.h1TugasAgain && (
                                                                        <p className="font-bold mb-2 whitespace-pre-line">
                                                                            {t.h1TugasAgain}
                                                                        </p>
                                                                    )}

                                                                    {t.note1TugasAgain && (
                                                                        <p className="mb-2 whitespace-pre-line">
                                                                            {t.note1TugasAgain}
                                                                        </p>
                                                                    )}

                                                                    {t.note2TugasAgain && (
                                                                        <p className="text-blue-500! mb-2 whitespace-pre-line">
                                                                            {t.note2TugasAgain}
                                                                        </p>
                                                                    )}

                                                                </div>
                                                            ))}
                                                        </div>
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
                    d.tahun === currentDate.getFullYear()
            )
        );
    };

    useEffect(() => {
        fetchCalendar();
    }, [currentDate.getFullYear()]);

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
        "Minggu",
        "Senin",
        "Selasa",
        "Rabu",
        "Kamis",
        "Jumat",
        "Sabtu",
    ];

    const calendarDays = weeks.flat();


    const longEvents = [];
    const rowOffsets = {};

    const GAP_STACK_NORMAL = 32;
    const GAP_STACK_PIC = 70;
    const DATE_AREA_HEIGHT = 44;

    calendar
        .filter(
            item =>
                item.tahun === year &&
                item.bulan === month + 1 &&
                item.tanggal.length > 1
        )
        .forEach(item => {

            const sortedDates = [...item.tanggal].sort((a, b) => a - b);
            const startDay = sortedDates[0];
            const endDay = sortedDates[sortedDates.length - 1];

            const startIndex = calendarDays.findIndex(d => d === startDay);
            const endIndex = calendarDays.findIndex(d => d === endDay);

            if (startIndex === -1 || endIndex === -1) return;

            const startRow = Math.floor(startIndex / 7);
            const endRow = Math.floor(endIndex / 7);

            const eventHeight =
                item.peoples?.length > 0
                    ? GAP_STACK_PIC
                    : GAP_STACK_NORMAL;

            // Find the largest occupied offset among every week this event spans
            let topOffset = 0;

            for (let r = startRow; r <= endRow; r++) {
                topOffset = Math.max(topOffset, rowOffsets[r] || 0);
            }

            // Reserve space in every affected week
            for (let r = startRow; r <= endRow; r++) {
                rowOffsets[r] = topOffset + eventHeight + 5;
            }

            // create one bar SEGMENT per week row it passes through
            for (let row = startRow; row <= endRow; row++) {

                const rowStartIndex = row * 7;
                const rowEndIndex = rowStartIndex + 6;

                const segStartIndex = Math.max(startIndex, rowStartIndex);
                const segEndIndex = Math.min(endIndex, rowEndIndex);

                longEvents.push({
                    ...item,
                    row,
                    col: segStartIndex - rowStartIndex,
                    span: segEndIndex - segStartIndex + 1,
                    topOffset,
                    isStart: row === startRow,
                    isEnd: row === endRow,
                });
            }
        });



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
                    {
                        currentDate.toLocaleString(
                            "id-ID",
                            { month: "long" }
                        )
                    } {year}
                </p>

                {/* BUTTONS */}
                <div className="flex gap-3 mb-[10px] flex-wrap">

                    <button className="px-3 py-2 border border-gray-200 outline-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
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

                    <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
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

                    <button className="px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
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
                            <button className="bg-blue-600 text-white px-3 py-2 border border-gray-200 outline-none  rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold"
                                onClick={() => setOpenAddRencana(true)}>
                                + Tambah Rencana
                            </button>
                        </>
                    )}

                </div>

                {/* CALENDAR */}
                <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">

                    <div className="relative min-w-[960px]">

                        {/* HEADER */}
                        <div className="grid grid-cols-7">

                            {daysHeader.map(day => (

                                <div
                                    key={day}
                                    className="h-10 border-r border-b border-gray-200 flex items-center justify-center font-semibold bg-white text-xs">
                                    {day}
                                </div>

                            ))}

                        </div>

                        {/* BODY — rendered per-week so each row auto-fits its own content */}
                        <div className="relative flex flex-col">

                            {weeks.map((week, weekIdx) => {

                                const weekLongEvents = longEvents.filter(
                                    (e) => e.row === weekIdx
                                );

                                const longEventsAreaHeight =
                                    weekLongEvents.length > 0
                                        ? Math.max(
                                            ...weekLongEvents.map(
                                                e =>
                                                    15 + e.topOffset +
                                                    (e.peoples?.length > 0
                                                        ? GAP_STACK_PIC
                                                        : GAP_STACK_NORMAL)
                                            )
                                        )
                                        : 0;

                                const cellWidth = 100 / 7;

                                return (
                                    <div
                                        key={weekIdx}
                                        className="relative grid grid-cols-7 border-b border-gray-200"
                                    >
                                        {/* DAY CELLS */}
                                        {week.map((day, dayIdx) => {

                                            const shortEvents =
                                                day !== null
                                                    ? getCalendar(
                                                        calendar,
                                                        month + 1,
                                                        day
                                                    ).filter(
                                                        (e) => e.tanggal.length === 1
                                                    )
                                                    : [];

                                            const isToday =
                                                day === new Date().getDate() &&
                                                month === new Date().getMonth() &&
                                                year === new Date().getFullYear();

                                            return (
                                                <div
                                                    key={dayIdx}
                                                    className={`relative border-r border-gray-200 px-2 pb-2 min-h-[110px] ${day === null ? "bg-gray-100" : "bg-white"
                                                        }`}
                                                >
                                                    {day && (
                                                        <>
                                                            {/* DATE — fixed at the very top, always */}
                                                            <div className="flex justify-center pt-2 mb-2 text-xs">
                                                                <div
                                                                    className={
                                                                        isToday
                                                                            ? "w-7 h-7 rounded-full bg-blue-100 border border-blue-300 text-blue-700 flex items-center justify-center font-semibold"
                                                                            : "w-7 h-7 flex items-center justify-center font-semibold"
                                                                    }
                                                                >
                                                                    {day}
                                                                </div>
                                                            </div>

                                                            {/* SPACER — only this gets pushed down to clear the banners */}
                                                            {longEventsAreaHeight > 0 && (
                                                                <div style={{ height: longEventsAreaHeight }} />
                                                            )}

                                                            {/* SHORT EVENTS — free to grow, no clipping */}
                                                            <div className="space-y-2">
                                                                {shortEvents.map((item) => (
                                                                    <div
                                                                        key={item.id}
                                                                        className="flex justify-center p-2 max-h-30"
                                                                    >
                                                                        <div
                                                                            onClick={() => {
                                                                                setSelected_cal(item);
                                                                                setOpenViewRencana(true);
                                                                            }}
                                                                            className="w-fit cursor-pointer transition ease hover:-translate-y-0.5 hover:brightness-105 active:-translate-y-0.5 active:brightness-80 active:scale-95"
                                                                        >
                                                                            <div
                                                                                className={`w-5 h-5 rounded-full mx-auto mb-1 ${statusStyles[item.type] || "bg-gray-400"}`}
                                                                            />
                                                                            <div className="text-xs text-center line-clamp-3">
                                                                                {item.task}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {/* LONG EVENT LAYER — scoped to THIS week, sits below the date row */}
                                        <div className="absolute inset-0 pointer-events-none">
                                            {weekLongEvents.map((item, i) => {
                                                return (
                                                    <div
                                                        key={`${item.id}-${item.row}-${i}`}
                                                        onClick={() => {
                                                            setSelected_cal(item);
                                                            setOpenViewRencana(true);
                                                        }}
                                                        style={{
                                                            top: `${DATE_AREA_HEIGHT + item.topOffset}px`,
                                                            left: `${item.col * cellWidth}%`,
                                                            width: `${item.span * cellWidth}%`
                                                        }}
                                                        className={`absolute ${item.isStart ? "ps-1.5" : ""} ${item.isEnd ? "pe-1.5" : ""}`}
                                                    >
                                                        <div className={`h-7 px-2 ps-3 pointer-events-auto flex items-center justify-start text-white shadow cursor-pointer transition ease hover:-translate-y-0.5 hover:brightness-105 active:-translate-y-0.5 active:brightness-80 active:scale-99 ${statusStyles[item.type] || "bg-gray-400"} ${item.isStart ? "rounded-l-lg" : ""} ${item.isEnd ? "rounded-r-lg" : ""}`}>
                                                            {item.isStart && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelected_cal(item);
                                                                        setOpenViewRencana(true);
                                                                    }}
                                                                    className="text-sm cursor-pointer overflow-hidden"
                                                                >
                                                                    <span className="block truncate text-xs select-text">
                                                                        {item.task}
                                                                    </span>
                                                                </button>
                                                            )}


                                                        </div>


                                                        {item.peoples.length > 0 && item.isStart && (
                                                            <div className="h-8 w-full flex gap-4 text-[10px] mt-1 ps-6 pe-2 overflow-hidden pointer-events-auto">

                                                                <div className={`select-text relative flex gap-1 items-center px-2.5 w-fit min-w-0 cursor-pointer hover:translate-x-0.5 rounded-lg text-white transition ease before:content-[''] before:absolute before:top-0 before:left-0 before:-translate-x-1/2 before:w-0 before:h-0 before:border-t-[15px] before:border-r-[15px] before:border-r-transparent before:rotate-90 ${statusBorder[item.type] || "bg-gray-400"} hover:brightness-105 active:brightness-80 active:scale-99`}>
                                                                    {item.peoples.map((person, idx) => (
                                                                    <div key={idx} className="text-black! bg-white! truncate min-w-0 px-2 py-0.5 rounded-md">
                                                                        {person}
                                                                    </div>

                                                                ))}
                                                                </div>

                                                            </div>
                                                        )}


                                                        {/* {item.peoples.map((person, idx) => (
                                                                    <div key={idx} className="truncate min-w-0 w-full px-2 py-0.5 rounded-md">
                                                                        {person}
                                                                    </div>

                                                                ))}</div> */}

                                                        {/* <div className="truncate min-w-0 w-full px-2 py-0.5 rounded-md">
                                                                        {(item.peoples || []).join(", ")}
                                                                    </div> */}



                                                    </div>


                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}

                        </div>

                    </div>

                </div>

            </div>
        );
    };





































    return (
        <>


            <Navbar />

            <div className="m-0 p-0 flex flex-col bg-orange-100">
                <div className="mt-3 flex flex-col h-fit rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 overflow-hidden mx-5 bg-white">





                    <div>
                        <p className="font-bold text-lg uppercase">
                            Simple task manager thingy
                        </p>
                    </div>





                    {renderCalendar()}

                    {renderTable(`Jadwal Harian`, schedule)}






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