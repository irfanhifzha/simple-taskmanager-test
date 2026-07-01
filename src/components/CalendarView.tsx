import { useEffect, useState, useCallback, useMemo } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "firebase/auth";

import AddRencanaModal from "./AddRencanaModal";
import ViewRencanaModal from "./ViewRencanaModal";

import { Category, CalendarEvent, statusStyles, statusBorder } from "../types/scheduleTypes";

type Props = {
    kategori: Category;
    user: User | null;
};

type Selected = {
    item: CalendarEvent;
    login?: boolean;
};

type LongEvent = CalendarEvent & {
    row: number;
    col: number;
    span: number;
    topOffset: number;
    isStart: boolean;
    isEnd: boolean;
};

const DAYS_HEADER = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const GAP_STACK_NORMAL = 32;
const GAP_STACK_PIC = 70;
const DATE_AREA_HEIGHT = 44;

function buildCalendar(year: number, month: number): (number | null)[][] {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const weeks: (number | null)[][] = [];
    let week: (number | null)[] = new Array(7).fill(null);
    let day = 1;

    for (let i = firstDay; i < 7; i++) {
        week[i] = day++;
    }
    weeks.push(week);

    while (day <= daysInMonth) {
        week = new Array(7).fill(null);
        for (let i = 0; i < 7 && day <= daysInMonth; i++) {
            week[i] = day++;
        }
        weeks.push(week);
    }

    return weeks;
}

export default function CalendarView({ kategori, user }: Props) {
    const isLoggedIn = !!user;

    const [calendar, setCalendar] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // EFFICIENT FETCH: query only this kategori + this year, instead of pulling
    // the whole "calendar" collection and filtering client-side. Refetches only
    // when the year or category actually changes.
    const fetchCalendar = useCallback(async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "calendars"),
                where("kategori", "==", kategori),
                where("tahun", "==", year)
            );
            const snap = await getDocs(q);
            const data = snap.docs.map((d) => ({
                id: d.id,
                ...d.data(),
            })) as CalendarEvent[];
            setCalendar(data);
        } finally {
            setLoading(false);
        }
    }, [kategori, year]);

    useEffect(() => {
        fetchCalendar();
    }, [fetchCalendar]);

    const weeks = useMemo(() => buildCalendar(year, month), [year, month]);
    const calendarDays = useMemo(() => weeks.flat(), [weeks]);

    const getCalendar = (data: CalendarEvent[], bulan: number, tgl: number): CalendarEvent[] => {
        return data.filter((s) => s.bulan === bulan && Array.isArray(s.tanggal) && s.tanggal.includes(tgl));
    };

    const longEvents: LongEvent[] = useMemo(() => {
        const result: LongEvent[] = [];
        const rowOffsets: Record<number, number> = {};

        calendar
            .filter((item) => item.tahun === year && item.bulan === month + 1 && item.tanggal.length > 1)
            .forEach((item) => {
                const sortedDates = [...item.tanggal].sort((a, b) => a - b);
                const startDay = sortedDates[0];
                const endDay = sortedDates[sortedDates.length - 1];

                const startIndex = calendarDays.findIndex((d) => d === startDay);
                const endIndex = calendarDays.findIndex((d) => d === endDay);

                if (startIndex === -1 || endIndex === -1) return;

                const startRow = Math.floor(startIndex / 7);
                const endRow = Math.floor(endIndex / 7);

                const eventHeight = item.peoples?.length > 0 ? GAP_STACK_PIC : GAP_STACK_NORMAL;

                let topOffset = 0;
                for (let r = startRow; r <= endRow; r++) {
                    topOffset = Math.max(topOffset, rowOffsets[r] || 0);
                }
                for (let r = startRow; r <= endRow; r++) {
                    rowOffsets[r] = topOffset + eventHeight + 5;
                }

                for (let row = startRow; row <= endRow; row++) {
                    const rowStartIndex = row * 7;
                    const rowEndIndex = rowStartIndex + 6;

                    const segStartIndex = Math.max(startIndex, rowStartIndex);
                    const segEndIndex = Math.min(endIndex, rowEndIndex);

                    result.push({
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

        return result;
    }, [calendar, year, month, calendarDays]);


    const [selectedCal, setSelectedCal] = useState<Selected | null>(null);
    const [openAddRencana, setOpenAddRencana] = useState(false);
    const [openViewRencana, setOpenViewRencana] = useState(false);

    return (
        <>
            <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
                <p className="text-black text-md font-bold">
                    {currentDate.toLocaleString("id-ID", { month: "long" })} {year}
                </p>

                <div className="flex gap-3 mb-[10px] flex-wrap">
                    <button
                        className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    >
                        {"<-"} Prev
                    </button>

                    <button
                        className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    >
                        Next {"->"}
                    </button>

                    <button
                        className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                        onClick={() => setCurrentDate(new Date())}
                    >
                        📅 Today
                    </button>

                    {user && (
                        <button
                            className="bg-blue-600 text-white px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-blue-500 active:scale-95 text-xs font-semibold"
                            onClick={() => setOpenAddRencana(true)}
                        >
                            + Tambah Rencana
                        </button>
                    )}
                </div>

                <div className="w-full overflow-auto rounded-2xl border border-gray-200 animate-[fadeUp_0.5s_ease-out_forwards]">
                    <div className="relative min-w-[960px]">
                        <div className="grid grid-cols-7">
                            {DAYS_HEADER.map((day) => (
                                <div
                                    key={day}
                                    className="h-10 border-r border-b border-gray-200 flex items-center justify-center font-semibold bg-white text-xs"
                                >
                                    {day}
                                </div>
                            ))}
                        </div>

                        {loading && <div className="p-6 text-center text-gray-400 text-xs">Memuat kalender...</div>}

                        {!loading && (
                            <div className="relative flex flex-col">
                                {weeks.map((week, weekIdx) => {
                                    const weekLongEvents = longEvents.filter((e) => e.row === weekIdx);

                                    const longEventsAreaHeight =
                                        weekLongEvents.length > 0
                                            ? Math.max(
                                                ...weekLongEvents.map(
                                                    (e) =>
                                                        15 +
                                                        e.topOffset +
                                                        (e.peoples?.length > 0 ? GAP_STACK_PIC : GAP_STACK_NORMAL)
                                                )
                                            )
                                            : 0;

                                    const cellWidth = 100 / 7;

                                    return (
                                        <div key={weekIdx} className="relative grid grid-cols-7 border-b border-gray-200">
                                            {week.map((day, dayIdx) => {
                                                const shortEvents =
                                                    day !== null
                                                        ? getCalendar(calendar, month + 1, day).filter((e) => e.tanggal.length === 1)
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

                                                                {longEventsAreaHeight > 0 && <div style={{ height: longEventsAreaHeight }} />}

                                                                <div className="space-y-2">
                                                                    {shortEvents.map((item) => (
                                                                        <div
                                                                            key={item.id}
                                                                            className="flex justify-center px-2 pb-2 max-h-40 flex-col items-center"
                                                                        >
                                                                            <div
                                                                                onClick={() => {
                                                                                    setSelectedCal({ item, login: isLoggedIn });
                                                                                    setOpenViewRencana(true);
                                                                                }}
                                                                                className="w-fit cursor-pointer transition ease hover:-translate-y-0.5 hover:brightness-105 active:-translate-y-0.5 active:brightness-80 active:scale-95"
                                                                            >
                                                                                <button
                                                                                    className={`cursor-pointer flex justify-center w-5 h-5 rounded-full mx-auto mb-1 ${statusStyles[item.type] || "bg-gray-400"}`}
                                                                                />
                                                                                <div className="text-xs text-center line-clamp-3 break-all">{item.task}</div>
                                                                            </div>

                                                                            {item.peoples.length > 0 && (
                                                                                <div
                                                                                    className="h-8 w-full flex justify-center gap-4 text-[10px] mt-3 px-1 pointer-events-auto"
                                                                                    onClick={() => {
                                                                                        setSelectedCal({ item, login: isLoggedIn });
                                                                                        setOpenViewRencana(true);
                                                                                    }}
                                                                                >
                                                                                    <div
                                                                                        className={`relative flex justify-center items-center select-text gap-1 px-2.5 w-fit min-w-0 cursor-pointer hover:-translate-y-0.5 rounded-lg text-white transition ease hover:brightness-105 active:brightness-80 active:scale-99 ${statusStyles[item.type] || "bg-gray-400"
                                                                                            }`}
                                                                                    >
                                                                                        <div
                                                                                            className={`z-2 absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 ${statusStyles[item.type] || "bg-gray-400"
                                                                                                }`}
                                                                                        />
                                                                                        {item.peoples.map((person, idx) => (
                                                                                            <div
                                                                                                key={idx}
                                                                                                className="z-4 text-black! bg-white! truncate min-w-0 px-2 py-0.5 rounded-md"
                                                                                            >
                                                                                                {person}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            <div className="absolute inset-0 pointer-events-none">
                                                {weekLongEvents.map((item, i) => (
                                                    <div
                                                        key={`${item.id}-${item.row}-${i}`}
                                                        onClick={() => {
                                                            setSelectedCal({ item, login: isLoggedIn });
                                                            setOpenViewRencana(true);
                                                        }}
                                                        style={{
                                                            top: `${DATE_AREA_HEIGHT + item.topOffset}px`,
                                                            left: `${item.col * cellWidth}%`,
                                                            width: `${item.span * cellWidth}%`,
                                                        }}
                                                        className={`absolute ${item.isStart ? "ps-1.5" : ""} ${item.isEnd ? "pe-1.5" : ""}`}
                                                    >
                                                        <div
                                                            className={`h-7 px-2 ps-3 pointer-events-auto flex items-center justify-start text-white shadow cursor-pointer transition ease hover:-translate-y-0.5 hover:brightness-105 active:-translate-y-0.5 active:brightness-80 active:scale-99 ${statusStyles[item.type] || "bg-gray-400"
                                                                } ${item.isStart ? "rounded-l-lg" : ""} ${item.isEnd ? "rounded-r-lg" : ""}`}
                                                        >
                                                            {item.isStart && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedCal({ item, login: isLoggedIn });
                                                                        setOpenViewRencana(true);
                                                                    }}
                                                                    className="text-sm cursor-pointer overflow-hidden"
                                                                >
                                                                    <span className="block truncate text-xs select-text">{item.task}</span>
                                                                </button>
                                                            )}
                                                        </div>

                                                        {item.peoples.length > 0 && item.isStart && (
                                                            <div className="h-8 w-full flex gap-4 text-[10px] mt-1 ps-6 pe-2 overflow-hidden pointer-events-auto">
                                                                <div
                                                                    className={`select-text relative flex gap-1 items-center px-2.5 w-fit min-w-0 cursor-pointer hover:translate-x-0.5 rounded-lg text-white transition ease before:content-[''] before:absolute before:top-0 before:left-0 before:-translate-x-1/2 before:w-0 before:h-0 before:border-t-[15px] before:border-r-[15px] before:border-r-transparent before:rotate-90 ${statusBorder[item.type] || "bg-gray-400"
                                                                        } hover:brightness-105 active:brightness-80 active:scale-99`}
                                                                >
                                                                    {item.peoples.map((person, idx) => (
                                                                        <div key={idx} className="text-black! bg-white! truncate min-w-0 px-2 py-0.5 rounded-md">
                                                                            {person}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <AddRencanaModal open={openAddRencana} category={kategori} onClose={() => setOpenAddRencana(false)} onSuccess={fetchCalendar} />
            <ViewRencanaModal open={openViewRencana} data={selectedCal} onClose={() => setOpenViewRencana(false)} onSuccess={fetchCalendar} />
        </>
    );
}