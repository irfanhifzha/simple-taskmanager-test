import type { ReactNode } from "react";

type Props = {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export default function Modal({ open, onClose, children }: Props) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-10 backdrop-blur-xs bg-black/10" 
        onClick={onClose}>
            <div
                className="w-full max-w-[770px] max-h-[500px] overflow-y-auto flex flex-col px-8 py-7 rounded-3xl relative shadow-lg bg-white animate-[fadeUp_0.3s_ease-out_forwards]
                [&_h2]:font-bold [&_h2]:text-xl [&_h2]:mb-3 [&_p]:text-gray-400 [&_p]:mb-3
                [&_button]:rounded-lg [&_button]:border [&_button]:border-gray-200 [&_button]:py-3 [&_button]:px-5 [&_button]:hover:-translate-y-1 [&_button]:hover:shadow-md [&_button]:active:-translate-y-1 [&_button]:active:shadow-md [&_button]:active:scale-95 [&_button]:active:bg-gray-100 [&_button]:transition [&_button]:duration-200 [&_button]:ease [&_button]:cursor-pointer [&_button]:shadow-sm [&_button]:font-medium"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="w-8 h-8 absolute top-0 right-0 mx-4 my-5 p-0! text-xs hover:border-gray-300 active:border-gray-400" 
                onClick={onClose}>
                    X
                </button>
                {children}
            </div>
        </div>
    );
}


