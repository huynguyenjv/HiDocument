import { useEffect, useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";

const PDFPreview = ({ pdfFile, fields, scale = 1 }) => {
    const [pageImages, setPageImages] = useState({});
    const [numPages, setNumPages] = useState(0);
    const [pdfjsInitialized, setPdfjsInitialized] = useState(false);

    useEffect(() => {
        const initializePdfJs = async () => {
            try {
                const workerModule = await import("pdfjs-dist/build/pdf.worker.mjs");
                if (workerModule.default) {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;
                } else {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
                        "pdfjs-dist/build/pdf.worker.mjs",
                        import.meta.url,
                    ).href;
                }
                setPdfjsInitialized(true);
            } catch (error) {
                console.error("Lỗi khởi tạo PDF.js:", error);
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.3.31/pdf.worker.min.js";
                setPdfjsInitialized(true);
            }
        };

        initializePdfJs();
    }, []);

    const renderFieldOnCanvas = useCallback(
        async (ctx, field) => {
            // Debug: Log field information
            console.log(
                "Rendering field:",
                field.type,
                "Left:",
                field.left,
                "Top:",
                field.top,
                "Width:",
                field.width,
                "Height:",
                field.height,
            );
            console.log("Field value:", field.value, "SignatureData:", field.signatureData ? "exists" : "none");
            console.log("User scale:", scale);

            // Apply the same scaling logic as in Edit mode
            // Field coordinates are stored for scale=1, so we need to scale them with user's scale
            const x = field.left * scale;
            const y = field.top * scale;
            const width = field.width * scale;
            const height = field.height * scale;

            console.log("Rendered at - X:", x, "Y:", y, "W:", width, "H:", height);

            // Debug: Draw a red border to see where we're trying to render
            ctx.strokeStyle = "red";
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, height);

            // Set font and text properties
            const fontSize = 12;
            ctx.font = `${fontSize}px Arial, sans-serif`;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";

            switch (field.type) {
                case "text":
                case "date":
                    if (field.value) {
                        // Render text directly on PDF
                        ctx.fillStyle = "#000000";
                        ctx.fillText(field.value, x + 4, y + height / 2);
                    }
                    break;

                case "checkbox":
                    if (field.value === "true") {
                        // Draw checkmark
                        ctx.strokeStyle = "#2563eb";
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(x + width * 0.2, y + height * 0.5);
                        ctx.lineTo(x + width * 0.45, y + height * 0.7);
                        ctx.lineTo(x + width * 0.8, y + height * 0.3);
                        ctx.stroke();
                    }
                    break;

                case "signature":
                    if (field.signatureData) {
                        // Draw signature image
                        return new Promise((resolve) => {
                            const img = new Image();
                            img.onload = function () {
                                ctx.drawImage(img, x, y, width, height);
                                resolve();
                            };
                            img.onerror = function () {
                                resolve(); // Continue even if image fails to load
                            };
                            img.src = field.signatureData;
                        });
                    } else if (field.value === "signed") {
                        // Draw "Signed" text
                        ctx.fillStyle = "#2563eb";
                        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                        ctx.textAlign = "center";
                        ctx.fillText("✓ Signed", x + width / 2, y + height / 2);
                    }
                    break;
            }
            return Promise.resolve();
        },
        [scale],
    );

    useEffect(() => {
        if (pdfFile && pdfjsInitialized) {
            const loadPDF = async () => {
                const arrayBuffer = await pdfFile.arrayBuffer();
                const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
                setNumPages(pdf.numPages);

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale: 1.5 });
                    const canvas = document.createElement("canvas");
                    const ctx = canvas.getContext("2d");

                    // Canvas size should match the final display size, not the full viewport size
                    const finalWidth = viewport.width * scale * 0.6;
                    const finalHeight = viewport.height * scale * 0.6;
                    canvas.width = finalWidth;
                    canvas.height = finalHeight;

                    // Create a scaled viewport for rendering
                    const renderViewport = page.getViewport({ scale: 1.5 * scale * 0.6 });

                    // Render PDF page
                    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

                    // Render fields directly on canvas
                    const pageFields = fields.filter((f) => f.pageNumber === pageNum);
                    console.log(`Page ${pageNum}: Found ${pageFields.length} fields:`, pageFields);
                    for (const field of pageFields) {
                        await renderFieldOnCanvas(ctx, field);
                    }

                    setPageImages((prev) => ({
                        ...prev,
                        [pageNum]: {
                            dataUrl: canvas.toDataURL(),
                            width: finalWidth,
                            height: finalHeight,
                        },
                    }));
                }
            };
            loadPDF();
        }
    }, [pdfFile, pdfjsInitialized, fields, renderFieldOnCanvas, scale]);

    const renderPage = (pageNumber) => {
        const page = pageImages[pageNumber];
        if (!page) return <div key={pageNumber}>Loading...</div>;

        // Use the image's actual dimensions since they're already scaled correctly
        const width = page.width;
        const height = page.height;

        return (
            <div key={pageNumber} className="relative mb-6 ml-6">
                <img
                    src={page.dataUrl}
                    alt={`Page ${pageNumber}`}
                    width={width}
                    height={height}
                    className="block shadow-lg"
                />
            </div>
        );
    };

    return <div className="pdf-preview">{Array.from({ length: numPages }, (_, i) => renderPage(i + 1))}</div>;
};

export default PDFPreview;
