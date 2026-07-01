import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import type { TodoEvent } from "./Todo";

const DAY_WIDTH = 36; // px per day column

function startOfDay(d: Date) {
    const nd = new Date(d);
    nd.setHours(0, 0, 0, 0);
    return nd;
}

function diffDays(from: Date, to: Date) {
    return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86400000);
}

function fmtDay(d: Date) {
    return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

export default function TodoGantt() {
    const [tasks, setTasks] = useState<TodoEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "todos"), orderBy("createdAt", "asc"));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as TodoEvent[];
            setTasks(data);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    // MVP scope: archived tasks are excluded from the timeline for now
    const visibleTasks = useMemo(() => tasks.filter((t) => t.status !== "archived"), [tasks]);

    const { rangeStart, days } = useMemo(() => {
        const today = new Date();
        let min = today;
        let max = today;

        visibleTasks.forEach((t) => {
            if (t.createdAt && t.createdAt.toDate() < min) min = t.createdAt.toDate();
            if (t.doneAt && t.doneAt.toDate() > max) max = t.doneAt.toDate();
            if (t.doneTarget && t.doneTarget.toDate() > max) max = t.doneTarget.toDate();
        });

        const start = startOfDay(min);
        start.setDate(start.getDate() - 1);
        const end = startOfDay(max);
        end.setDate(end.getDate() + 2);

        const totalDays = diffDays(start, end) + 1;
        const dayList = Array.from({ length: totalDays }, (_, i) => {
            const d = new Date(start);
            d.setDate(d.getDate() + i);
            return d;
        });

        return { rangeStart: start, days: dayList };
    }, [visibleTasks]);

    const today = new Date();
    const xFor = (date: Date) => diffDays(rangeStart, date) * DAY_WIDTH;

    return (
        <div className="mt-3 flex flex-col h-fit w-full rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 bg-white overflow-hidden">
            <p className="text-black text-md font-bold">Gantt Timeline</p>

            {loading ? (
                <p className="text-gray-400 text-xs py-6 text-center">Memuat timeline...</p>
            ) : visibleTasks.length === 0 ? (
                <p className="text-gray-400 text-xs py-6 text-center">Belum ada task.</p>
            ) : (
                <div className="w-full overflow-auto rounded-2xl border border-gray-200">
                    <div style={{ width: days.length * DAY_WIDTH + 180 }}>
                        {/* header */}
                        <div className="flex sticky top-0 bg-white z-10 border-b border-gray-200">
                            <div className="w-[180px] shrink-0 px-2 py-1 text-xs font-semibold border-r border-gray-200">
                                Task
                            </div>
                            <div className="flex">
                                {days.map((d, i) => (
                                    <div
                                        key={i}
                                        style={{ width: DAY_WIDTH }}
                                        className="shrink-0 text-center text-[10px] text-gray-500 py-1 border-r border-gray-100"
                                    >
                                        {fmtDay(d)}
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
                                <div className="relative h-full" style={{ width: days.length * DAY_WIDTH }}>
                                    <div
                                        className="absolute top-0 bottom-0 w-px bg-red-300"
                                        style={{ left: xFor(today) + DAY_WIDTH / 2 }}
                                    />
                                    <GanttRowBar task={task} xFor={xFor} today={today} />
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
}: {
    task: TodoEvent;
    xFor: (d: Date) => number;
    today: Date;
}) {
    if (task.status === "todo") {
        const created = task.createdAt?.toDate();
        return (
            <>
                {created && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-gray-400 bg-white"
                        style={{ left: xFor(created) + DAY_WIDTH / 2 - 6 }}
                        title="Dibuat"
                    />
                )}
                {task.progressTarget && task.doneTarget && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full border border-dashed border-gray-400"
                        style={{
                            left: xFor(task.progressTarget.toDate()) + DAY_WIDTH / 2,
                            width: Math.max(xFor(task.doneTarget.toDate()) - xFor(task.progressTarget.toDate()), 4),
                        }}
                        title="Rencana"
                    />
                )}
            </>
        );
    }

    if (task.status === "progress") {
        const start = (task.progressStartAt ?? task.createdAt)?.toDate();
        if (!start) return null;

        const plannedEnd = task.doneTarget?.toDate();
        const isOverdue = plannedEnd ? today > plannedEnd : false;
        const barEnd = plannedEnd && !isOverdue ? plannedEnd : today;

        return (
            <>
                <div
                    className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-blue-500"
                    style={{ left: xFor(start) + DAY_WIDTH / 2, width: Math.max(xFor(barEnd) - xFor(start), 4) }}
                    title="Progress"
                />
                {isOverdue && plannedEnd && (
                    <div
                        className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-red-400"
                        style={{ left: xFor(plannedEnd) + DAY_WIDTH / 2, width: Math.max(xFor(today) - xFor(plannedEnd), 4) }}
                        title="Terlambat"
                    />
                )}
            </>
        );
    }

    if (task.status === "done") {
        const start = (task.progressStartAt ?? task.createdAt)?.toDate();
        const end = task.doneAt?.toDate();
        if (!start || !end) return null;

        return (
            <div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 rounded-full bg-green-500"
                style={{ left: xFor(start) + DAY_WIDTH / 2, width: Math.max(xFor(end) - xFor(start), 4) }}
                title="Selesai"
            />
        );
    }

    return null;
}