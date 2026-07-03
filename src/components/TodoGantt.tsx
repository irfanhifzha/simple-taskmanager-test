import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { TodoEvent } from "./Todo";

type Granularity = "day" | "hour";

const UNIT_WIDTH: Record<Granularity, number> = {
    day: 50,
    hour: 40,
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

/* ---------- Shared bar/marker primitives ---------- */

const DOT = 12; // px — shared diameter for markers AND minimum bar width

/**
 * Unified time-range renderer. If start/end collapse to (near) the same
 * point, it centers a circle on that point — exactly matching how a
 * standalone marker looks, so there's no visual seam between "a moment"
 * and "a very short range."
 */
function TimeBar({
    start,
    end,
    xFor,
    unitWidth,
    className,
    title,
}: {
    start: Date;
    end: Date;
    xFor: (d: Date) => number;
    unitWidth: number;
    className: string;
    title?: string;
}) {
    const startX = xFor(start) + unitWidth / 2;
    const endX = xFor(end) + unitWidth / 2;
    const rawWidth = endX - startX;

    let left: number;
    let width: number;

    if (rawWidth < DOT) {
        // point-like: center a DOT-sized circle on the start position,
        // same anchor math a standalone marker would use
        width = DOT;
        left = startX - DOT / 2;
    } else {
        // real range: left-aligned start, actual width
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

// Thin wrapper for a single point in time — just a zero-length TimeBar
function TimeMarker({
    date,
    xFor,
    unitWidth,
    className,
    title,
}: {
    date: Date;
    xFor: (d: Date) => number;
    unitWidth: number;
    className: string;
    title?: string;
}) {
    return <TimeBar start={date} end={date} xFor={xFor} unitWidth={unitWidth} className={className} title={title} />;
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

    const className = {
        gray: "border border-dashed border-gray-400 bg-white",
        blue: "border border-dashed border-blue-400 bg-white",
        green: "border border-dashed border-green-500 bg-white",
    }[tint];

    if (pStart && pEnd) {
        return <TimeBar start={pStart} end={pEnd} xFor={xFor} unitWidth={unitWidth} className={className} title="Rencana" />;
    }
    if (pStart) {
        return <TimeMarker date={pStart} xFor={xFor} unitWidth={unitWidth} className={className} title="Target mulai" />;
    }
    if (pEnd) {
        return <TimeMarker date={pEnd} xFor={xFor} unitWidth={unitWidth} className={className} title="Target selesai" />;
    }
    return null;
}

export default function TodoGantt({ category }: any) {
    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [granularity, setGranularity] = useState<Granularity>("day");
    const [focusDate, setFocusDate] = useState<Date>(() => startOfDay(new Date()));

    useEffect(() => {
        const q = query(collection(db, "todos"), where("kategori", "==", category));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TodoEvent[];
            setTasks(data);
            setLoading(false);
        });
        return () => unsub();
    }, [category]);

    const visibleTasks = useMemo(() => tasks.filter((t) => t.status !== "archived"), [tasks]);

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
            <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-black text-md font-bold">Gantt Chart / Timeline Overview</p>

                <div className="flex items-center gap-3 flex-wrap">
                    {granularity === "hour" && (
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                            {!isSameDay(focusDate, today) && (
                                <button
                                    onClick={() => setFocusDate(startOfDay(today))}
                                    className="px-3 py-2 rounded-full bg-blue-600 text-white hover:shadow-md transition duration-200 ease cursor-pointer"
                                >
                                    Hari ini
                                </button>
                            )}
                            <div>
                                <button
                                    onClick={() => setFocusDate((d) => {
                                        const nd = new Date(d);
                                        nd.setDate(nd.getDate() - 1);
                                        return nd;
                                    })}
                                    className="px-2 py-1 rounded-full border border-gray-200 hover:shadow-md transition duration-200 ease cursor-pointer"
                                >
                                    {"<-"}
                                </button>
                                <span className="px-2 font-medium text-gray-600 min-w-[160px] text-center">
                                    {fmtDayFull(focusDate)}
                                </span>
                                <button
                                    onClick={() => setFocusDate((d) => {
                                        const nd = new Date(d);
                                        nd.setDate(nd.getDate() + 1);
                                        return nd;
                                    })}
                                    className="px-2 py-1 rounded-full border border-gray-200 hover:shadow-md transition duration-200 ease cursor-pointer"
                                >
                                    {"->"}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => setGranularity("hour")}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-200 ease cursor-pointer
                                ${granularity === "hour" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:shadow-md"}`}
                        >
                            🕐 Jam
                        </button>
                        <button
                            onClick={() => setGranularity("day")}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition duration-200 ease cursor-pointer
                                ${granularity === "day" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 hover:shadow-md"}`}
                        >
                            📅 Hari
                        </button>
                    </div>
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
                                    {task.title}
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