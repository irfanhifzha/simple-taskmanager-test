import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../firebase";

import Navbar from "../components/Navbar";

import CalendarView from "../components/CalendarView";
import ScheduleView from "../components/ScheduleView";
import TodoView from "../components/TodoView";

export default function Home() {

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    return (
        <>

            {/* <Navbar /> */}

            <div className="m-0 p-0 flex flex-col">
                <div className="flex flex-col h-fit rounded-2xl gap-2 px-4 pb-5 overflow-hidden mx-5 bg-white">
                    <div>
                        <p className="font-bold text-lg"></p>
                    </div>

                    <TodoView kategori="ClassA" user={user}/>
                    <CalendarView kategori="ClassA" user={user} />
                    <ScheduleView kategori="ClassA" user={user} />
                </div>
            </div>
        </>
    );
}