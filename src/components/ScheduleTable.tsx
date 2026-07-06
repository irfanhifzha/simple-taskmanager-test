import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";

import AddScheduleModal from "./AddScheduleModal";
import EditScheduleModal from "./EditScheduleModal";
import AddTugasModalAgain from "./AddTugasModalAgain";
import EditTugasModalAgain from "./EditTugasModalAgain";

import {
    Props,
    Schedule,
    TugasAgain,
    statusStyles,
    colorClasses,
    colorOutline,
} from "../types/scheduleTypes";

type Selected = {
    schedule: Schedule;
    tugas?: TugasAgain;
    index?: number;
    login?: boolean;
};

const HOURS = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

export default function ScheduleTable({ kategori, user }: Props) {

    const isValidKategori = !!kategori;

    const isLoggedIn = !!user;

    const [schedule, setSchedule] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);

    const [editMode] = useState(false);
    const [tugasVisibility, setTugasVisibility] = useState(true);
    const [weekendVisibility, setWeekendVisibility] = useState(false);

    const [openAdd, setOpenAdd] = useState(false);
    const [openEdit, setOpenEdit] = useState(false);

    const [openTugasAddAgain, setOpenTugasAddAgain] = useState(false);
    const [openTugasEditAgain, setOpenTugasEditAgain] = useState(false);

    const [selected, setSelected] = useState<Selected | null>(null);

    const [filterKelas, setFilterKelas] = useState<"ALL" | "TRPL" | "BISDIG" | "BISDIGeks">("ALL");

    const [filterTahun, setFilterTahun] = useState<"ALL" | "24" | "25">("ALL");

    const filteredSchedule = useMemo(() => {
        return schedule.filter(s => {
            const kelas = s.kategori.slice(0, -2);
            const tahun = s.kategori.slice(-2);

            return (
                (filterKelas === "ALL" || kelas === filterKelas) &&
                (filterTahun === "ALL" || tahun === filterTahun)
            );
        });
    }, [schedule, filterKelas, filterTahun]);

    const days = weekendVisibility ? [1, 2, 3, 4, 5, 6, 7] : [1, 2, 3, 4, 5];

    // EFFICIENT FETCH: only pull docs belonging to this kategori, instead of the
    // whole "schedules" collection + client-side filtering.
    const fetchSchedules = useCallback(async () => {
        setLoading(true);

        try {
            const schedulesRef = collection(db, "schedules");

            const q = kategori
                ? query(schedulesRef, where("kategori", "==", kategori))
                : schedulesRef;

            const snap = await getDocs(q);

            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as Schedule[];

            setSchedule(data);
        } finally {
            setLoading(false);
        }
    }, [kategori]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);

    // LIVE INDICATOR — ticks once a minute instead of every render
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const currentDayIndex = () => {
        const day = now.getDay();
        if (day === 0 || day === 6) return -1;
        return day;
    };

    const currentHour = now.getHours();

    const liveMatkul = schedule.find(
        (s) =>
            s.dayIndex === currentDayIndex() &&
            Array.isArray(s.slots) &&
            s.slots.includes(currentHour)
    );

    const getSession = (data: Schedule[], dayIndex: number, hour: number): Schedule[] => {
        return data.filter(
            (s) =>
                s.dayIndex === dayIndex &&
                Array.isArray(s.slots) &&
                s.slots.includes(hour)
        );
    };



    return (
        <>
            <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
                <p className="text-black text-md font-bold">Jadwal Harian</p>

                <div className="flex gap-3 mb-[10px] flex-wrap">
                    <button
                        className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setTugasVisibility((prev) => !prev)}
                    >
                        {tugasVisibility ? "👀 Hide Task" : "🔍 Show Task"}
                    </button>

                    <button
                        className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setWeekendVisibility((prev) => !prev)}
                    >
                        {weekendVisibility ? "💼 Hide Weekend" : "🗓️ Show Weekend"}
                    </button>

                    {user && (
                        <button
                            className="bg-blue-600 text-white px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold"
                            onClick={() => setOpenAdd(true)}
                        >
                            + Tambah Jadwal
                        </button>
                    )}

                    {/* PROGRAM FILTER */}
                    {!isValidKategori && (
                        <div className="flex gap-3 h-14">
                            <select
                                value={filterKelas}
                                onChange={(e) => setFilterKelas(e.target.value as any)}
                                className="px-3 pe-8! border rounded-md bg-white shadow-sm py-0!"
                            >
                                <option value="ALL">All Kelas</option>
                                <option value="TRPL">TRPL</option>
                                <option value="BISDIG">BISDIG</option>
                                <option value="BISDIGeks">BISDIG EKSEKUTIF</option>
                            </select>

                            <select
                                value={filterTahun}
                                onChange={(e) => setFilterTahun(e.target.value as any)}
                                className="px-3 pe-8! border rounded-md bg-white shadow-sm py-0!"
                            >
                                <option value="ALL">All Tahun</option>
                                <option value="24">24</option>
                                <option value="25">25</option>
                            </select>
                        </div>
                    )}
                </div>

                <div className="w-full overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                    <table
                        className={`relative w-full table-fixed border-separate border-spacing-0 text-xs [&_th]:border [&_td]:border [&_th]:border-gray-200 [&_td]:border-gray-200
                        [&_td]:h-[36px] [&_td]:p-2 ${weekendVisibility ? "max-2xl:w-[1700px]" : "max-xl:w-[1200px]"}`}
                    >
                        <thead>
                            <tr className="h-[36px] px-2 items-center text-center [&_th]:font-semibold">
                                <th className="sticky z-5 top-0 left-0 bg-white shadow-lg w-[60px] text-gray-400 font-[IBM_Plex_Sans]">
                                    Jam
                                </th>
                                <th>Senin</th>
                                <th>Selasa</th>
                                <th>Rabu</th>
                                <th>Kamis</th>
                                <th>Jumat</th>
                                {weekendVisibility && (
                                    <>
                                        <th>Sabtu</th>
                                        <th>Minggu</th>
                                    </>
                                )}
                            </tr>
                        </thead>

                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={days.length + 1} className="text-center text-gray-400 py-4">
                                        Memuat jadwal...
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                HOURS.map((hour) => (
                                    <tr key={hour}>
                                        <td className="sticky z-5 top-0 left-0 bg-white shadow-lg text-center text-gray-400 font-[IBM_Plex_Sans] font-semibold">
                                            {hour}:00
                                        </td>

                                        {days.map((day) => {
                                            const sessions = getSession(
                                                isValidKategori ? schedule : filteredSchedule,
                                                day,
                                                hour
                                            );

                                            const visibleSessions =
                                                isValidKategori ? sessions.slice(0, 1) : sessions;

                                            const truncate = (text: string, max = 900) =>
                                                text.length > max ? text.slice(0, max).trimEnd() + "..." : text;

                                            return (
                                                <td key={day}>
                                                    {visibleSessions.map((s, idx) => (
                                                        // SINGLE ITEM VIEW
                                                        <div key={idx}
                                                            className={`animate-[fadeUp_0.5s_ease-out_forwards] relative flex flex-col gap-2 rounded-lg overflow-hidden h-full justify-center m-0 p-2 hover:-translate-y-1 transition duration-200 ease wrap-break-word text-[10px] pb-4 ${!editMode ? "cursor-pointer" : ""} ${colorClasses[s.type] ?? "border border-black bg-white"} ${!isValidKategori ? "h-fit! mb-3" : ""}`}
                                                            onClick={
                                                                !editMode
                                                                    ? () => {
                                                                        setSelected({ schedule: s, login: isLoggedIn });
                                                                        setOpenEdit(true);
                                                                    }
                                                                    : undefined
                                                            }
                                                        >
                                                            {liveMatkul && liveMatkul.id === s.id && (
                                                                <div className="flex justify-center items-center gap-1 mt-2 rounded-lg border border-green-300 bg-white p-2 text-green-700 text-[8px] w-fit select-none transition ease">
                                                                    <div className="inline-block w-2 h-2 me-[1px] align-middle rounded-full bg-current transition-all duration-200 animate-[pulse_0.75s_infinite]"></div>
                                                                    <span>
                                                                        {" "}
                                                                        Live {currentHour}.00 | Jam {Math.min(...s.slots)}.00 - {Math.max(...s.slots)}.00
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {!isValidKategori && (
                                                                <div className="flex justify-center items-center gap-1 mt-2 rounded-lg border border-green-300 bg-white p-2 text-red-700 text-[8px] w-fit select-none">
                                                                    <span>
                                                                        {s.kategori}
                                                                    </span>
                                                                </div>
                                                            )}



                                                            <button className={`flex justify-start text-start select-text! ${!editMode ? "cursor-pointer" : ""} font-semibold text-sm wrap-break-word mt-2 me-10 whitespace-pre-line`}>
                                                                {truncate(s.course)}
                                                            </button>
                                                            {s.room && <p>{truncate(s.room)}</p>}
                                                            {s.peoples.length > 0 && (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {s.peoples.map((person, idx) => (
                                                                        <div key={idx} className="text-black px-2 py-1 rounded-lg bg-white w-fit">
                                                                            {truncate(person)}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            {s.desc && <p className="font-medium brightness-50 whitespace-pre-line">{truncate(s.desc)}</p>}
                                                            {s.note && <p className="text-blue-500 whitespace-pre-line">{truncate(s.note)}</p>}

                                                            {tugasVisibility && s.tugasAgain?.length > 0 && (
                                                                <div className="space-y-2">
                                                                    {s.tugasAgain.map((t, index) => (
                                                                        <div
                                                                            key={t.id}
                                                                            className={`text-black! bg-white px-3 py-2 mt-2 rounded-lg text-black transition duration-200 eases ${!editMode ? "cursor-pointer active:scale-97 active:brightness-90 hover:-translate-y-0.5 bg-white!" : ""} ${colorOutline[s.type] ?? "border border-black bg-white"}`}
                                                                            onClick={
                                                                                !editMode
                                                                                    ? (e) => {
                                                                                        e.stopPropagation();
                                                                                        setSelected({ schedule: s, tugas: t, index, login: isLoggedIn });
                                                                                        setOpenTugasEditAgain(true);
                                                                                    }
                                                                                    : undefined
                                                                            }
                                                                        >
                                                                            <div className="flex mb-2 font-bold text-xs items-center">
                                                                                <div
                                                                                    className={`w-[10px] h-[10px] rounded-full inline-block me-1 ${statusStyles[t.statusTugasAgain] || "bg-gray-200"}`}
                                                                                />
                                                                                <button className={`flex justify-start ${!editMode ? "cursor-pointer" : ""}`}>{truncate(t.titleTugasAgain)}</button>
                                                                            </div>

                                                                            {t.h1TugasAgain && (
                                                                                <p className="font-bold mb-2 whitespace-pre-line">{truncate(t.h1TugasAgain)}</p>
                                                                            )}

                                                                            {t.note1TugasAgain && (
                                                                                <p className="mb-2 whitespace-pre-line">{truncate(t.note1TugasAgain)}</p>
                                                                            )}

                                                                            {t.note2TugasAgain && (
                                                                                <p className="text-blue-500! mb-2 whitespace-pre-line">{truncate(t.note2TugasAgain)}</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddScheduleModal open={openAdd} category={kategori} onClose={() => setOpenAdd(false)} onSuccess={fetchSchedules} />
            <EditScheduleModal open={openEdit} category={kategori} data={selected} onClose={() => setOpenEdit(false)} onSuccess={fetchSchedules} />

            <AddTugasModalAgain open={openTugasAddAgain} data={selected} onClose={() => setOpenTugasAddAgain(false)} onSuccess={fetchSchedules} />
            <EditTugasModalAgain open={openTugasEditAgain} data={selected} onClose={() => setOpenTugasEditAgain(false)} onSuccess={fetchSchedules} />
        </>
    );
}