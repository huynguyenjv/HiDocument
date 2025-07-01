import { X, Maximize2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const DraggableField = ({
    id,
    type,
    left,
    top,
    width = 120,
    height = 32,
    value,
    placeholder,
    onMove,
    onClick,
    onDoubleClick,
    onDelete,
    onUpdate,
    onResize,
    isSelected,
    scale = 1,
    maxWidth,
    maxHeight,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const fieldRef = useRef(null);

    const handleMouseDown = (e) => {
        if (e.target.classList.contains("delete-btn") || e.target.classList.contains("resize-handle")) return;
        setIsDragging(true);
        setDragStart({
            x: e.clientX - left * scale,
            y: e.clientY - top * scale,
        });
        onClick(id);
        e.preventDefault();
        e.stopPropagation();
    };

    const handleResizeStart = (e) => {
        setIsResizing(true);
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width,
            height,
        });
        e.preventDefault();
        e.stopPropagation();
    };

    const handleMouseMove = useCallback(
        (e) => {
            if (isDragging && !isResizing) {
                const newLeft = (e.clientX - dragStart.x) / scale;
                const newTop = (e.clientY - dragStart.y) / scale;

                // Apply boundary constraints
                const constrainedLeft = Math.max(0, Math.min(newLeft, (maxWidth || Infinity) - width));
                const constrainedTop = Math.max(0, Math.min(newTop, (maxHeight || Infinity) - height));

                onMove(id, constrainedLeft, constrainedTop);
            } else if (isResizing) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;
                const newWidth = Math.max(50, resizeStart.width + deltaX / scale);
                const newHeight = Math.max(20, resizeStart.height + deltaY / scale);

                // Apply boundary constraints for resizing
                const constrainedWidth = Math.min(newWidth, (maxWidth || Infinity) - left);
                const constrainedHeight = Math.min(newHeight, (maxHeight || Infinity) - top);

                onResize?.(id, constrainedWidth, constrainedHeight);
            }
        },
        [
            isDragging,
            isResizing,
            dragStart,
            resizeStart,
            id,
            onMove,
            onResize,
            scale,
            maxWidth,
            maxHeight,
            width,
            height,
            left,
            top,
        ],
    );

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);

    useEffect(() => {
        if (isDragging || isResizing) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
            return () => {
                document.removeEventListener("mousemove", handleMouseMove);
                document.removeEventListener("mouseup", handleMouseUp);
            };
        }
    }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

    const handleValueChange = (e) => {
        onUpdate(id, { value: e.target.value });
    };

    const renderField = () => {
        const commonProps = {
            className: `w-full h-full border-2 px-2 py-1 text-sm rounded ${
                isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
            } ${isDragging ? "cursor-grabbing" : "cursor-grab"}`,
            value: value || "",
            onChange: handleValueChange,
            placeholder: placeholder,
            onFocus: () => onClick(id),
        };

        switch (type) {
            case "text":
                return <input type="text" {...commonProps} />;
            case "date":
                return <input type="date" {...commonProps} />;
            case "signature":
                return (
                    <div
                        className={`w-full h-full border-2 rounded flex items-center justify-center text-xs cursor-pointer ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
                        }`}
                        onDoubleClick={() => onDoubleClick?.(id)}
                    >
                        {value && value !== "signed" ? (
                            <img src={value} alt="Signature" className="max-w-full max-h-full object-contain" />
                        ) : value === "signed" ? (
                            <span className="text-blue-600 font-medium">✓ Signed</span>
                        ) : (
                            <span className="text-gray-400">Double click to sign</span>
                        )}
                    </div>
                );
            case "checkbox":
                return (
                    <div
                        className={`w-full h-full border-2 rounded flex items-center justify-center ${
                            isSelected ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
                        }`}
                    >
                        <input
                            type="checkbox"
                            className="w-4 h-4"
                            checked={value === "true"}
                            onChange={(e) => onUpdate(id, { value: e.target.checked.toString() })}
                        />
                    </div>
                );
            default:
                return <input type="text" {...commonProps} />;
        }
    };

    return (
        <div
            ref={fieldRef}
            className={`absolute select-none ${isDragging || isResizing ? "z-50" : "z-10"}`}
            style={{
                left: left * scale,
                top: top * scale,
                width: width * scale,
                height: height * scale,
            }}
            onMouseDown={handleMouseDown}
        >
            {renderField()}
            {isSelected && (
                <>
                    <button
                        className="delete-btn absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 z-20"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(id);
                        }}
                    >
                        <X size={12} />
                    </button>
                    <div
                        className="resize-handle absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize z-20"
                        onMouseDown={handleResizeStart}
                        title="Drag to resize"
                    >
                        <Maximize2 size={8} className="text-white m-0.5" />
                    </div>
                </>
            )}
        </div>
    );
};

export default DraggableField;
