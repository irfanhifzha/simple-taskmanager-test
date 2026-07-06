import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { TodoEvent } from "../types/scheduleTypes";


type SortKey = "status" | "createdAt" | "startAt";

const STATUS_ORDER: Record<string, number> = {
    todo: 0,
    progress: 1,
    done: 2,
};


type Granularity = "day" | "hour";

const UNIT_WIDTH: Record<Granularity, number> = {
    day: 60,
    hour: 50,
};

function startOfDay(d: Date) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

function diffDays(from: Date, to: Date) {
    return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000);
}

function diffHours(from: Date, to: Date) {
    return Math.round((to.getTime() - from.getTime()) / 3600000);
}

function isSameDay(a: Date, b: Date) {
    return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function fmtDay(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function fmtDayFull(d: Date) {
    return d.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

function fmtHour(d: Date) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const DOT = 12;

/**
 * align="center" — dot centers on the anchor (default, for standalone points)
 * align="start"  — dot sits fully BEFORE the anchor, flush with a bar that
 *                   starts at that same anchor (no overlap, no gap)
 */
function TimeBar({
    start,
    end,
    xFor,
    unitWidth,
    className,
    title,
    align = "center",
}: {
    start: Date;
    end: Date;
    xFor: (d: Date) => number;
    unitWidth: number;
    className: string;
    title?: string;
    align?: "center" | "start";
}) {
    const startX = xFor(start) + unitWidth / 2;
    const endX = xFor(end) + unitWidth / 2;
    const rawWidth = endX - startX;

    let left: number;
    let width: number;

    if (rawWidth < DOT) {
        width = DOT;
        left = align === "start" ? startX - DOT : startX - DOT / 2 + 5;
    } else {
        width = rawWidth;
        left = startX;
    }

    return (
        <div
            className={`absolute top-1/2 -translate-y-1/2 h-3 rounded-full ${className}`}
            style={{ left, width }}
            title={title}
        />
    );
}

function TimeMarker({
    date,
    xFor,
    unitWidth,
    className,
    title,
    align = "center",
}: {
    date: Date;
    xFor: (d: Date) => number;
    unitWidth: number;
    className: string;
    title?: string;
    align?: "center" | "start";
}) {
    return (
        <TimeBar
            start={date}
            end={date}
            xFor={xFor}
            unitWidth={unitWidth}
            className={className}
            title={title}
            align={align}
        />
    );
}



function TargetOverlay({
    task,
    xFor,
    unitWidth,
    tint,
}: {
    task: TodoEvent;
    xFor: (d: Date) => number;
    unitWidth: number;
    tint: "gray" | "blue" | "green";
}) {
    const pStart = task.progressTarget?.toDate();
    const pEnd = task.doneTarget?.toDate();
    const start = task.startAt?.toDate() ?? task.createdAt?.toDate();

    const className = {
        gray: "border border-dashed border-gray-400",
        blue: "border border-dashed border-blue-400",
        green: "border border-dashed border-green-500",
    }[tint];

    if (pStart && pEnd) {
        return <TimeBar start={pStart} end={pEnd} xFor={xFor} unitWidth={unitWidth} className={className} title="Rencana" />;
    }
    if (pStart) {
        return <TimeMarker date={pStart} xFor={xFor} unitWidth={unitWidth} className={className} title="Target mulai" />;
    }
    if (pEnd) {
        return <TimeBar start={start} end={pEnd} xFor={xFor} unitWidth={unitWidth} className={className} title="Target selesai" />;
    }
    return null;
}

export default function TodoGantt({ category }: any) {
    const isValidKategori = !!category;

    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [granularity, setGranularity] = useState<Granularity>("day");
    const [focusDate, setFocusDate] = useState<Date>(() => startOfDay(new Date()));

    const [sortBy, setSortBy] = useState<SortKey>("createdAt");

    useEffect(() => {
        setLoading(true);

        const todosRef = collection(db, "todos");

        const q = category
            ? query(todosRef, where("kategori", "==", category))
            : query(todosRef);

        const unsub = onSnapshot(
            q,
            (snap) => {
                const data = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data(),
                })) as TodoEvent[];

                setTasks(data);
                setLoading(false);
            },
            (err) => {
                console.error(err);
                setLoading(false);
            }
        );

        return () => unsub();
    }, [category]);

    const visibleTasks = useMemo(() => {
        const filtered = tasks.filter((t) => t.status !== "archived");

        const sorted = [...filtered].sort((a, b) => {
            if (sortBy === "status") {
                const diff = (STATUS_ORDER[a.status] ?? 99) - (STATUS_ORDER[b.status] ?? 99);
                if (diff !== 0) return diff;
                // tie-break within same status by createdAt so it's stable
                return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
            }

            if (sortBy === "startAt") {
                // tasks without startAt (e.g. still "todo") sort to the end
                const aTime = a.startAt?.toMillis() ?? Infinity;
                const bTime = b.startAt?.toMillis() ?? Infinity;
                return aTime - bTime;
            }

            // default: createdAt
            return (a.createdAt?.toMillis() ?? 0) - (b.createdAt?.toMillis() ?? 0);
        });

        return sorted;
    }, [tasks, sortBy]);

    const unitWidth = UNIT_WIDTH[granularity];
    const today = new Date();

    const { rangeStart, units } = useMemo(() => {
        if (granularity === "hour") {
            const dayStart = startOfDay(focusDate);
            const list = Array.from({ length: 24 }, (_, i) => {
                const d = new Date(dayStart);
                d.setHours(i);
                return d;
            });
            return { rangeStart: dayStart, units: list };
        }

        let min = today;
        let max = today;

        visibleTasks.forEach((t) => {
            if (t.createdAt && t.createdAt.toDate() < min) min = t.createdAt.toDate();
            if (t.doneAt && t.doneAt.toDate() > max) max = t.doneAt.toDate();
            if (t.doneTarget && t.doneTarget.toDate() > max) max = t.doneTarget.toDate();
            if (t.progressTarget && t.progressTarget.toDate() > max) max = t.progressTarget.toDate();
        });

        const start = startOfDay(min);
        start.setDate(start.getDate() - 1);
        const end = startOfDay(max);
        end.setDate(end.getDate() + 3);

        const totalDays = diffDays(start, end) + 1;
        const list = Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });
        return { rangeStart: start, units: list };
    }, [visibleTasks, granularity, focusDate]);

    const xFor = (date: Date) =>
        (granularity === "day" ? diffDays(rangeStart, date) : diffHours(rangeStart, date)) * unitWidth;

    const showTodayMarker = granularity === "day" || isSameDay(focusDate, today);

    return (
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
            <div className="flex flex-col gap-4">
                <p className="text-black text-md font-bold">Gantt Chart / Timeline Overview</p>

                <div className="flex items-center gap-3 flex-wrap mb-[10px]">


                    <div className="flex items-center gap-2 text-xs border border-gray-200 rounded-lg py-2 px-4">
                        <span className="text-gray-400">Urutkan:</span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSortBy("createdAt")}
                                className={`px-3 py-2 rounded-full font-semibold border transition duration-200 ease cursor-pointer
                ${sortBy === "createdAt" ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 hover:shadow-md"}`}
                            >
                                Dibuat
                            </button>
                            <button
                                onClick={() => setSortBy("startAt")}
                                className={`px-3 py-2 rounded-full font-semibold border transition duration-200 ease cursor-pointer
                ${sortBy === "startAt" ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 hover:shadow-md"}`}
                            >
                                Mulai
                            </button>
                            <button
                                onClick={() => setSortBy("status")}
                                className={`px-3 py-2 rounded-full font-semibold border transition duration-200 ease cursor-pointer
                ${sortBy === "status" ? "bg-gray-800 text-white border-gray-800" : "border-gray-200 hover:shadow-md"}`}
                            >
                                Status
                            </button>
                        </div>
                    </div>


                    <div className="flex gap-2">

                        <button
                            onClick={() => setGranularity("day")}
                            className={`px-3 py-2 rounded-full text-xs font-semibold border transition duration-200 ease cursor-pointer
                                ${granularity === "day" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:shadow-md"}`}
                        >
                            📅 Hari
                        </button>

                        <button
                            onClick={() => setGranularity("hour")}
                            className={`px-3 py-2 rounded-full text-xs font-semibold border transition duration-200 ease cursor-pointer
                                ${granularity === "hour" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:shadow-md"}`}
                        >
                            🕐 Jam
                        </button>

                    </div>

                    {granularity === "hour" && (
                        <div className="flex items-center gap-3 text-xs flex-wrap">

                            <div>
                                <button
                                    onClick={() => setFocusDate((d) => {
                                        const nd = new Date(d);
                                        nd.setDate(nd.getDate() - 1);
                                        return nd;
                                    })}
                                    className="px-2 py-2 rounded-full border border-gray-200 hover:shadow-md transition duration-200 ease cursor-pointer"
                                >
                                    {"<-"}
                                </button>
                                <span className="inline-block w-[165px] flex-shrink-0 px-2 text-center font-medium text-gray-600">
                                    {fmtDayFull(focusDate)}
                                </span>
                                <button
                                    onClick={() => setFocusDate((d) => {
                                        const nd = new Date(d);
                                        nd.setDate(nd.getDate() + 1);
                                        return nd;
                                    })}
                                    className="px-2 py-2 rounded-full border border-gray-200 hover:shadow-md transition duration-200 ease cursor-pointer"
                                >
                                    {"->"}
                                </button>
                            </div>

                            {!isSameDay(focusDate, today) && (
                                <button
                                    onClick={() => setFocusDate(startOfDay(today))}
                                    className="px-3 py-2 border border-gray-200 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-xs font-semibold"
                                >
                                    Today 📅
                                </button>
                            )}

                        </div>
                    )}

                </div>
            </div>

            {loading ? (
                <p className="text-gray-400 text-xs py-6 text-center">Memuat timeline...</p>
            ) : visibleTasks.length === 0 ? (
                <p className="text-gray-400 text-xs py-6 text-center">Belum ada task.</p>
            ) : (
                <div className="w-full overflow-auto rounded-2xl border border-gray-200">
                    <div style={{ width: units.length * unitWidth + 180 }}>
                        <div className="flex sticky items-center top-0 bg-white z-10 border-b border-gray-200">
                            <div className="w-[180px] flex items-center h-8 shrink-0 px-2 py-1 text-xs font-semibold border-r border-gray-200">
                                <div>Task</div>
                            </div>
                            <div className="flex">
                                {units.map((d, i) => (
                                    <div
                                        key={i}
                                        style={{ width: unitWidth }}
                                        className="shrink-0 text-center text-[10px] text-gray-500 py-1 border-r border-gray-100"
                                    >
                                        {granularity === "day" ? fmtDay(d) : fmtHour(d)}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {visibleTasks.map((task) => (
                            <div key={task.id} className="flex border-b border-gray-100 h-[40px] items-center">
                                <div className="w-[180px] shrink-0 px-2 text-xs truncate" title={task.title}>
                                    {task.title} {!isValidKategori && (<span className="text-red-700 px-1 bg-white">[{task.kategori}]</span>)}
                                </div>
                                <div
                                    className="relative h-full overflow-hidden"
                                    style={{ width: units.length * unitWidth }}
                                >
                                    {showTodayMarker && (
                                        <div
                                            className="absolute top-0 bottom-0 w-px bg-red-300"
                                            style={{ left: xFor(today) + unitWidth / 2 }}
                                        />
                                    )}
                                    <GanttRowBar task={task} xFor={xFor} today={today} unitWidth={unitWidth} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}


function GanttRowBar({
    task,
    xFor,
    today,
    unitWidth,
}: {
    task: TodoEvent;
    xFor: (d: Date) => number;
    today: Date;
    unitWidth: number;
}) {
    if (task.status === "todo") {
        const created = task.createdAt?.toDate();
        if (!created) return null;

        return (
            <>
                <TimeMarker
                    date={created}
                    xFor={xFor}
                    unitWidth={unitWidth}
                    className="border border-dashed border-red-600 bg-red-200"
                    title="Dibuat"
                    align="center"
                />
                <TargetOverlay task={task} xFor={xFor} unitWidth={unitWidth} tint="gray" />
            </>
        );
    }

    if (task.status === "progress") {
        const created = task.createdAt?.toDate();
        if (!created) return null;

        const start = task.startAt?.toDate() ?? created;
        const plannedEnd = task.doneTarget?.toDate();
        const isOverdue = plannedEnd ? today > plannedEnd : false;

        return (
            <>
                <TimeMarker
                    date={created}
                    xFor={xFor}
                    unitWidth={unitWidth}
                    className="border border-dashed border-blue-600 bg-blue-100"
                    title="Dibuat"
                    align="center"
                />

                <TimeBar
                    start={start}
                    end={today}
                    xFor={xFor}
                    unitWidth={unitWidth}
                    className="bg-blue-600 border border-blue-700"
                    title="Progress"
                />

                <TargetOverlay task={task} xFor={xFor} unitWidth={unitWidth} tint="blue" />

                {isOverdue && plannedEnd && (
                    <TimeBar
                        start={plannedEnd}
                        end={today}
                        xFor={xFor}
                        unitWidth={unitWidth}
                        className="border border-dashed bg-red-400/20 border-red-600"
                        title="Terlambat"
                    />
                )}
            </>
        );
    }

    if (task.status === "done") {
        const created = task.createdAt?.toDate();
        const start = task.startAt?.toDate() ?? created;
        const end = task.doneAt?.toDate();
        if (!created || !start || !end) return null;

        return (
            <>
                <TimeMarker
                    date={created}
                    xFor={xFor}
                    unitWidth={unitWidth}
                    className="border border-dashed border-green-600 bg-green-100"
                    title="Dibuat"
                    align="center"
                />

                <TimeBar
                    start={start}
                    end={end}
                    xFor={xFor}
                    unitWidth={unitWidth}
                    className="bg-green-600 border border-green-700"
                    title="Selesai"
                />

                <TargetOverlay task={task} xFor={xFor} unitWidth={unitWidth} tint="green" />
            </>
        );
    }

    return null;
}