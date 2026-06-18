import type { ReactNode } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-10 backdrop-blur-xs" 
        onClick={onClose}>
            <div
                className="w-full max-w-[700px] max-h-[500px] overflow-y-auto flex flex-col p-4 rounded-2xl relative shadow-lg bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="w-8 h-8 absolute top-0 right-0 mx-4 my-3 justify-center items-center
                border border-gray-200 outline-none rounded-lg shadow-md hover:shadow-xl hover:-translate-y-0.5 transition duration-200 ease cursor-pointer active:bg-gray-100 active:scale-95 text-sm font-semibold" 
                onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        </div>
    );
}


