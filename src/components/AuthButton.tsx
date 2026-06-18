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
            <div className="flex w-full justify-end gap-3 mx-5">
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
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <h2>Login</h2>

                            <label>Email</label>
                            <div style={{ display:"flex", position: "relative", width:"100%" }}>
                                <input
                                    type="email"
                                    placeholder="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width:"100%"}}
                                />
                            </div>

                            <label>Password</label>
                            <div style={{ display:"flex", position: "relative", width:"100%" }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ paddingRight: "2.5rem", width:"100%"}}
                                />

                                <span
                                    className="material-symbols-rounded"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    style={{
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontSize: "20px",
                                        position: "absolute",
                                        right: "8px",
                                        top: "50%",
                                        transform: "translateY(-50%)"
                                    }}
                                >
                                    {showPassword ? "visibility_off" : "visibility"}
                                </span>
                            </div>

                            <button
                                onClick={handleLogin}
                                disabled={loading}
                                style={{
                                marginTop: 12,
                                opacity: loading ? 0.5 : 1,
                                cursor: loading ? "not-allowed" : "pointer"
                                }}
                            >
                                {loading ? ("Loading...") : ("Login")}
                            </button>
            
                        </div>
                    </Modal>
                </>
            )}
            </div>
    );
}