import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
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

export default function TodoGantt() {
    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [granularity, setGranularity] = useState<Granularity>("day");
    const [focusDate, setFocusDate] = useState<Date>(() => startOfDay(new Date()));

    useEffect(() => {
        const q = query(collection(db, "todos"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TodoEvent[];
            setTasks(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const visibleTasks = useMemo(() => tasks.filter((t) => t.status !== "archived"), [tasks]);

    const unitWidth = UNIT_WIDTH[granularity];
    const today = new Date();

    const { rangeStart, units } = useMemo(() => {
        if (granularity === "hour") {
            // hour mode is always exactly 24 columns for the focused day —
            // keeps it fast/readable no matter how much task history exists
            const dayStart = startOfDay(focusDate);
            const list = Array.from({ length: 24 }, (_, i) => {
                const d = new Date(dayStart);
                d.setHours(i);
                return d;
            });
            return { rangeStart: dayStart, units: list };
        }

        // day mode: span from earliest relevant timestamp to latest, small padding only
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
        end.setDate(end.getDate() + 3); // small forward padding, not +20

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
                        {/* header */}
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

                        {/* rows */}
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
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-1 border-dashed border-red-600 bg-red-200"
                    style={{ left: xFor(created) + unitWidth / 2 - 6 }}
                    title="Dibuat"
                />
                {task.progressTarget && task.doneTarget && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full border border-dashed border-gray-400"
                        style={{
                            left: xFor(task.progressTarget.toDate()) + unitWidth / 2,
                            width: Math.max(xFor(task.doneTarget.toDate()) - xFor(task.progressTarget.toDate()), 4),
                        }}
                        title="Rencana"
                    />
                )}
                {!task.progressTarget && task.doneTarget && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full border border-dashed border-gray-400"
                        style={{
                            left: (xFor(created) + unitWidth / 2) - 5,
                            width: Math.max(xFor(task.doneTarget.toDate()) - xFor(created), 4) + 5,
                        }}
                        title="Rencana"
                    />
                )}
            </>
        );
    }

    if (task.status === "progress") {
        const created = task.createdAt?.toDate();
        if (!created) return null;

        const start = task.startAt?.toDate();
        const plannedEnd = task.doneTarget?.toDate();

        const hasPlanned = !!plannedEnd;
        const isOverdue = hasPlanned ? today > plannedEnd : false;
        const hasFuturePlan = hasPlanned && plannedEnd > today;

        return (
            <>
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-1 border-dashed border-blue-600 bg-blue-100"
                    style={{ left: xFor(created) + unitWidth / 2 - 6 }}
                    title="Dibuat"
                />

                {start ? (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-blue-600"
                        style={{
                            left: xFor(start) + unitWidth / 2,
                            width: Math.max(xFor(today) - xFor(start), 4),
                        }}
                        title="Progress"
                    />
                ) : (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-blue-600"
                        style={{
                            left: (xFor(created) + unitWidth / 2) - 5,
                            width: Math.max(xFor(today) - xFor(created), 4) + 5,
                        }}
                        title="Progress"
                    />
                )}

                {hasFuturePlan && (
                    start ? (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-3 border border-dashed border-blue-400 rounded-full"
                            style={{
                                left: xFor(start) + unitWidth / 2,
                                width: Math.max(xFor(plannedEnd) - xFor(start), 4),
                            }}
                            title="Planned window"
                        />
                    ) : (
                        <div
                            className="absolute top-1/2 -translate-y-1/2 h-3 border border-dashed border-blue-400 rounded-full"
                            style={{
                                left: (xFor(created) + unitWidth / 2) - 5,
                                width: Math.max(xFor(plannedEnd) - xFor(created), 4) + 5,
                            }}
                            title="Planned window"
                        />
                    )
                )}

                {isOverdue && plannedEnd && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full border border-dashed bg-red-400/50 border-red-600"
                        style={{
                            left: xFor(plannedEnd) + unitWidth / 2,
                            width: Math.max(xFor(today) - xFor(plannedEnd), 4),
                        }}
                        title="Terlambat"
                    />
                )}
            </>
        );
    }

    if (task.status === "done") {
        const created = task.createdAt?.toDate();
        const start = task.startAt?.toDate();
        const end = task.doneAt?.toDate();
        if (!end) return null;

        return (
            <>
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-1 border-dashed border-green-600 bg-green-100"
                    style={{ left: xFor(created) + unitWidth / 2 - 6 }}
                    title="Dibuat"
                />

                {start ? (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-green-600"
                        style={{ left: xFor(start) + unitWidth / 2, width: Math.max(xFor(end) - xFor(start), 4) }}
                        title="Selesai"
                    />
                ) : (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-3 rounded-full bg-green-600"
                        style={{ left: (xFor(created) + unitWidth / 2)-5, width: Math.max(xFor(end) - xFor(created), 4)+5 }}
                        title="Selesai"
                    />
                )}
            </>
        );
    }

    return null;
}