import { useEffect, useState } from "react";
import DraggableField from "./DraggableField";
import * as pdfjsLib from "pdfjs-dist";

const PDFViewer = ({
    pdfFile,
    fields,
    onFieldMove,
    onFieldResize,
    onFieldClick,
    onFieldDoubleClick,
    onFieldDelete,
    onFieldUpdate,
    selectedFieldId,
    onAddField,
    scale,
}) => {
    const [pdfDoc, setPdfDoc] = useState(null);
    const [numPages, setNumPages] = useState(0);
    const [pageImages, setPageImages] = useState({});
    const [pdfjsInitialized, setPdfjsInitialized] = useState(false);

    useEffect(() => {
        const initializePdfJs = async () => {
            try {
                // Import module worker
                const workerModule = await import("pdfjs-dist/build/pdf.worker.mjs");
                // Kiểm tra export của module và gán URL
                if (workerModule.default) {
                    // Nếu module export default (thường là hàm worker)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
                } else {
                    // Nếu không có default, sử dụng URL tuyệt đối
                    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                        "pdfjs-dist/build/pdf.worker.mjs",
                        import.meta.url,
                    ).href;
                }
                setPdfjsInitialized(true);
            } catch (error) {
                console.error("Lỗi khởi tạo PDF.js:", error);
                // Fallback sang CDN cho pdfjs-dist@5.3.31
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js";
                setPdfjsInitialized(true);
            }
        };

        initializePdfJs();
    }, []);

    useEffect(() => {
        if (pdfFile && pdfjsInitialized) {
            const loadPDF = async () => {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setPdfDoc(pdf);
                setNumPages(pdf.numPages);
                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;
                    await page.render({ canvasContext: ctx, viewport }).promise;
                    setPageImages((prev) => ({
                        ...prev,
                        [pageNum]: {
                            dataUrl: canvas.toDataURL(),
                            width: viewport.width,
                            height: viewport.height,
                        },
                    }));
                }
            };
            loadPDF();
        }
    }, [pdfFile, pdfjsInitialized]);

    const renderPage = (pageNumber) => {
        const page = pageImages[pageNumber];
        if (!page) return <div key={pageNumber}>Loading...</div>;
        const width = page.width * scale * 0.6;
        const height = page.height * scale * 0.6;

        return (
            <div key={pageNumber} className="relative mb-6 ml-6">
                <img src={page.dataUrl} alt={`Page ${pageNumber}`} width={width} height={height} className="block" />
                <div
                    className="absolute inset-0 "
                    style={{ width, height }}
                    onClick={(e) => {
                        if (!onAddField) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / scale;
                        const y = (e.clientY - rect.top) / scale;
                        onAddField(x, y, pageNumber);
                    }}
                >
                    {fields
                        .filter((f) => f.pageNumber === pageNumber)
                        .map((field) => (
                            <DraggableField
                                key={field.id}
                                type={field.type}
                                id={field.id}
                                left={field.left}
                                top={field.top}
                                width={field.width}
                                height={field.height}
                                value={field.value}
                                placeholder={field.placeholder}
                                onMove={onFieldMove}
                                onResize={onFieldResize}
                                onClick={onFieldClick}
                                onDoubleClick={onFieldDoubleClick}
                                onDelete={onFieldDelete}
                                onUpdate={onFieldUpdate}
                                isSelected={selectedFieldId === field.id} // So sánh selectedFieldId
                                scale={scale}
                                maxWidth={width / scale}
                                maxHeight={height / scale}
                            />
                        ))}
                </div>
            </div>
        );
    };

    return <div>{Array.from({ length: numPages }, (_, i) => renderPage(i + 1))}</div>;
};

export default PDFViewer;
