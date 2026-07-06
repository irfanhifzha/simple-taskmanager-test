import {Timestamp} from "firebase/firestore";
import type { User } from "firebase/auth";

export type StatusColor = "green" | "blue" | "red" | "orange" | "purple" | "abu";

export type TugasAgain = {
    id: number;
    titleTugasAgain: string;
    note1TugasAgain: string;
    note2TugasAgain: string;
    statusTugasAgain: StatusColor;
    h1TugasAgain: string;
};

export type Schedule = {
    id: string;

    dayIndex: number;
    slots: number[];

    course: string;
    room: string;
    peoples: string[];

    type: StatusColor;

    note: string;
    desc: string;

    tugasAgain: TugasAgain[];

    kategori: string;
};

export type CalendarEvent = {
    id: string;

    bulan: number;
    tahun: number;
    tanggal: number[];

    task: string;
    content: string;
    peoples: string[];

    type: StatusColor;

    notes: string;
    kategori: string;
};

export type TodoEvent = {
    id: string;
    kategori: string;

    order: number;
    status: TodoStatus;

    title: string;
    subtitle: string;
    desc: string;

    tipe: StatusColor;
    note: string;
    peoples: string[];

    createdAt: Timestamp;

    startAt?: Timestamp;
    doneAt?: Timestamp;
    progressTarget?: Timestamp;
    doneTarget?: Timestamp;
};

export type TodoStatus = "todo" | "progress" | "done" | "archived";

export const statusStyles: Record<string, string> = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-green-600",
    orange: "bg-orange-600",
    purple: "bg-purple-500",
    abu: "bg-gray-500",
};

export const statusBorder: Record<string, string> = {
    green: "bg-green-600 before:border-t-green-600 [&_div]:bg-green-800/50",
    blue: "bg-blue-600 before:border-t-blue-600 [&_div]:bg-blue-800",
    red: "bg-red-600 before:border-t-red-600 [&_div]:bg-red-800/50",
    orange: "bg-orange-600 before:border-t-orange-600 [&_div]:bg-orange-800/50",
    purple: "bg-purple-500 before:border-t-purple-500 [&_div]:bg-purple-700/60",
    abu: "bg-gray-500 before:border-t-gray-500 [&_div]:bg-gray-700/50",
};

export const colorClasses: Record<string, string> = {
    green: "border border-green-200 bg-green-100 text-green-700 active:bg-green-300/40 active:border-green-300",
    blue: "border border-blue-200 bg-blue-100 text-blue-800 active:bg-blue-300/50 active:border-blue-300",
    red: "border border-red-200 bg-red-100 text-red-700 active:bg-red-300/50 active:border-red-300",
    orange: "border border-orange-200 bg-orange-100 text-orange-700 active:bg-orange-200 active:border-orange-300",
    purple: "border border-purple-200 bg-purple-100 text-purple-700 active:bg-purple-200 active:border-purple-300",
    abu: "border border-gray-300 bg-gray-200 text-gray-700 active:bg-gray-300 active:border-gray-300",
};

export const colorOutline: Record<string, string> = {
    green: "border border-green-300 bg-green-100 text-green-700 hover:border-green-600 active:border-green-600",
    blue: "border border-blue-300 bg-blue-100 text-blue-800 hover:border-blue-400 active:border-blue-400",
    red: "border border-red-300 bg-red-100 text-red-700 hover:border-red-400 active:border-red-400",
    orange: "border border-orange-300 bg-orange-100 text-orange-700 hover:border-orange-400 active:border-orange-400",
    purple: "border border-purple-300 bg-purple-100 text-purple-700 hover:border-purple-400 active:border-purple-400",
    abu: "border border-gray-400 bg-gray-100 text-gray-700 hover:border-gray-500 active:border-gray-400",
};


export const statusStylesStatus: Record<string, string> = {
    "todo": "bg-orange-600",
    "progress": "bg-blue-600",
    "done": "bg-green-600",
};



export type Props = {
    kategori?: string;
    user: User | null;
};