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



  const [printTarget, setPrintTarget] = useState<string | null>(null);

  useEffect(() => {
    const handleAfterPrint = () => {
      setPrintTarget(null);
    };

    window.addEventListener("afterprint", handleAfterPrint);

    return () => {
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);

  const handlePrint = (target: string) => {
    setPrintTarget(target);

    setTimeout(() => {
      window.print();
    }, 100);
  };



    return (
        <>

            <Navbar />

            <div className="m-0 p-0 flex flex-col">
                <div className="flex flex-col h-fit rounded-2xl gap-2 px-4 pb-5 overflow-hidden mx-5 bg-white print:p-0 print:m-0">
                    <div>
                        <p className="font-bold text-lg"></p>
                    </div>

                    <div className="m-0 p-0 flex flex-col">

                      <div className={printTarget && printTarget !== "todo" ? "print:hidden" : ""}>
                        <TodoView
                          kategori="ClassA"
                          user={user}
                          onPrint={() => handlePrint("todo")}
                        />
                      </div>

                      <div className={printTarget && printTarget !== "calendar" ? "print:hidden" : ""}>
                        <CalendarView
                          kategori="ClassA"
                          user={user}
                          onPrint={() => handlePrint("calendar")}
                        />
                      </div>

                      <div className={printTarget && printTarget !== "schedule" ? "print:hidden" : ""}>
                        <ScheduleView
                          kategori="ClassA"
                          user={user}
                          onPrint={() => handlePrint("schedule")}
                        />
                      </div>

                    </div>



                </div>
            </div>
        </>
    );
}