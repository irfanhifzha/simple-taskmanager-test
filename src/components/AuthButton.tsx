import { useEffect, useState } from "react";
import { auth } from "../firebase";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import type { User } from "firebase/auth";

import Modal from "./Modal";

export default function AuthButton() {
    const [user, setUser] = useState<User | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
        });

        return () => unsub();
    }, []);

    const handleLogin = async () => {

        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            setOpen(false); // close modal after login
        } catch (err) {
            console.error(err);
            alert("Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };


    const [loading, setLoading] = useState(false);



    return (
        <div className="flex flex-wrap gap-3">
            {user ? (
                <>
                    <span className="px-4 py-2 border border-gray-200 bg-white rounded-2xl text-sm">
                        {user.email} </span>
                    <button className="px-4 py-2 border border-gray-200 outline-none select-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer bg-white active:bg-gray-100 active:scale-95 text-sm font-semibold"
                        onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                    <button className="px-4 py-2 border border-gray-200 outline-none select-none rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer bg-white active:bg-gray-100 active:scale-95 text-sm font-semibold"
                        onClick={() => setOpen(true)}>Login</button>

                    <Modal open={open} onClose={() => setOpen(false)}>
                        <h2>Login</h2>

                        <form onSubmit={handleLogin}>
                            <label htmlFor="email">Email</label>
                            <input id="email"
                                type="email"
                                placeholder="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />

                            <label htmlFor="password">Password</label>
                            <div className="flex items-center relative">
                                <input id="password"
                                    className="flex w-full my-[3px] mb-[10px] px-3 py-2 text-[16px] font-inherit text-[#222] bg-[#f6f6f6] rounded-lg shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-all duration-200 outline-none pe-13!"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <button type="button"
                                    className="w-8 h-8 p-0! material-symbols-rounded cursor-pointer select-none text-[20px] absolute right-0 p-1 -translate-y-1 rounded-lg me-3 text-[20px]! text-blue-500 hover:-translate-y-1.5! active:scale-95 active:text-blue-300 transition duration-200 ease"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                >
                                    {!showPassword ? "visibility_off" : "visibility"}
                                </button>

                            </div>

                            <button type="button"
                                onClick={handleLogin}
                                disabled={loading}
                                className={`mt-2 bg-blue-600! text-white px-4 py-2 rounded-md transition ${loading ? "bg-blue-300! opacity-50 cursor-not-allowed!" : "hover:bg-blue-600! active:bg-blue-800! cursor-pointer"}`}>
                                {loading ? "⏳ Loading..." : "Login"}
                            </button>
                        </form>
                    </Modal>
                </>
            )}
        </div>
    );
}