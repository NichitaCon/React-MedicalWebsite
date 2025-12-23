export default function Modal({ renderCondition, children, onClose }) {
    return (
        <>
        {/* if rendercondition is true it will render whatever components (children) that are passed in or "sandwiched" - (<Modal><ComponentBeingSandwiched></Modal>) */}
            {renderCondition && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onClose}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="animate-in zoom-in-95 duration-200"
                    >
                        {children}
                    </div>
                </div>
            )}
        </>
    );
}
