import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal({ open, onClose, children}: Props) {
    if (!open) return null;
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            onClose();
        }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
        document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onClose]);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-10 bg-black/30 animate-[fadeOverlay_100ms_ease-out_forwards]`}
        onClick={onClose}>
            <div
                className="w-full max-w-[670px] max-h-[500px] overflow-y-auto flex flex-col px-8 py-7 rounded-3xl relative shadow-lg bg-white animate-[zoomIn_0.2s_ease-out_forwards] [&_h2]:font-semibold [&_h2]:text-xl [&_h2]:mb-3 [&_p]:mb-3 [&_button]:bg-white [&_button]:rounded-lg [&_button]:border [&_button]:border-gray-200 [&_button]:py-3 [&_button]:px-5 [&_button]:hover:shadow-md [&_button]:active:-translate-y-1 [&_button]:active:shadow-xl [&_button]:active:scale-95 [&_button]:active:bg-gray-100 [&_button]:transition [&_button]:duration-200 [&_button]:ease [&_button]:text-xs [&_button]:cursor-pointer [&_button]:shadow-lg [&_button]:font-medium [&_button]:hover:-translate-y-1 [&_button]:overflow-hidden wrap-break-word"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center items-center w-8 h-8 absolute top-0 right-0 mx-4 my-5 p-1 text-2xl select-none border border-white text-gray-500 hover:text-gray-900 active:text-gray-900 hover:border-gray-200 active:border-red-300 active:bg-red-100 active:scale-95 rounded-lg transition duration-200 ease" 
                onClick={onClose}>
                    ×
                </div>
                {children}
            </div>
        </div>
    );
}


