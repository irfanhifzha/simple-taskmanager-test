import AuthButton from "./AuthButton";

import { useEffect, useState } from "react";




export default function Navbar() {

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex items-center justify-between mt-7 gap-4 mx-5 px-4">

        <div className="flex gap-3 items-center">

          <div className="text-2xl font-light">
            {time.toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>

          <div className="text-2xl font-bold">
            {time.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })}
          </div>



        </div>



        <AuthButton />

      </div>
    </>
  );
}