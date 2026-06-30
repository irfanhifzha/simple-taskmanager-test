import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

import Navbar from "../components/Navbar";

import CalendarView from "../components/CalendarView";
import ScheduleTable from "../components/ScheduleTable";
import Todo from "../components/Todo";

export default function Home() {
    useEffect(() => {
        document.title = "Task Manager Kelas A";
    }, []);

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    return (
        <>

            <Navbar />

            <div className="m-0 p-0 flex flex-col bg-orange-100">
                <div className="mt-3 flex flex-col h-fit rounded-2xl gap-[10px] px-[26px] py-[14px] border border-gray-200 overflow-hidden mx-5 bg-white">
                    <div>
                        <p className="font-bold text-lg uppercase">Simple task manager thingy</p>
                    </div>

                    <Todo/>

                    <CalendarView kategori="ClassA" user={user} />
                    <ScheduleTable kategori="ClassA" user={user} />
                </div>
            </div>
        </>
    );
}