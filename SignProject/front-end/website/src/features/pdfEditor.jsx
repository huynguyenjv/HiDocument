import React, { useState, useCallback, useRef } from "react";
import {
    FileText,
    Type,
    Edit3,
    Download,
    Send,
    Users,
    Eye,
    Settings,
    Plus,
    Trash2,
    ZoomIn,
    ZoomOut,
    RotateCcw,
    Square,
    X, // Thêm icon để đóng popup
} from "lucide-react";
import PDFViewer from "../component/ui/PDFViewer";
import PDFPreview from "../component/ui/PDFPreview";
import SignatureModal from "../component/ui/SignatureModal";

// Main PDF Editor Component
const PDFEditor = () => {
    const [pdfFile, setPdfFile] = useState(null);
    const [fields, setFields] = useState([]);
    const [selectedFieldId, setSelectedFieldId] = useState(null);
    const [pendingField, setPendingField] = useState(null);
    const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("fields");
    const [documentName, setDocumentName] = useState("Untitled Document");
    const [scale, setScale] = useState(1);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false); // State cho popup preview
    const previewTrigger = useRef(0); // Ref để kích hoạt làm mới preview
    const [recipients, setRecipients] = useState([{ id: 1, email: "", name: "Signer 1" }]);
    const [signingOrder, setSigningOrder] = useState("any");
    const [requireAuth, setRequireAuth] = useState(false);
    const [allowDecline, setAllowDecline] = useState(true);

    const fieldTypes = [
        { type: "text", icon: Type, label: "Text Field", color: "blue" },
        { type: "signature", icon: Edit3, label: "Signature", color: "green" },
        { type: "date", icon: FileText, label: "Date", color: "purple" },
        { type: "checkbox", icon: Square, label: "Checkbox", color: "orange" },
    ];

    const tabs = [
        { id: "fields", label: "Fields", icon: Plus },
        { id: "recipients", label: "Recipients", icon: Users },
        { id: "settings", label: "Settings", icon: Settings },
    ];

    const handleFileUpload = (event) => {
        const file = event.target.files?.[0];
        if (file && file.type === "application/pdf") {
            setPdfFile(file);
            setDocumentName(file.name.replace(".pdf", ""));
            setFields([]); // Reset fields when new file is uploaded
            previewTrigger.current += 1; // Trigger preview refresh
        } else {
            alert("Please upload a valid PDF file.");
        }
    };

    const selectFieldType = (type) => {
        setPendingField(type);
        setSelectedFieldId(null);
    };

    const handlePDFClick = (x, y, pageNumber) => {
        if (pendingField) {
            const newField = {
                id: `field-${Date.now()}`,
                type: pendingField,
                left: x - 60,
                top: y - 16,
                width: 120,
                height: 32,
                value: "",
                placeholder: `${pendingField.charAt(0).toUpperCase() + pendingField.slice(1)} field`,
                pageNumber: pageNumber,
            };
            setFields([...fields, newField]);
            setSelectedFieldId(newField.id);
            setPendingField(null);
        }
    };

    const addField = (type) => {
        const newField = {
            id: `field-${Date.now()}`,
            type,
            left: 50 + Math.random() * 200,
            top: 50 + Math.random() * 200,
            width: 120,
            height: 32,
            value: "",
            placeholder: `${type.charAt(0).toUpperCase() + type.slice(1)} field`,
            pageNumber: 1, // Default to first page
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const moveField = useCallback((id, left, top) => {
        setFields((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, left, top } : field)));
    }, []);

    const resizeField = useCallback((id, width, height) => {
        setFields((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, width, height } : field)));
    }, []);

    const updateField = useCallback((id, updates) => {
        setFields((prevFields) => prevFields.map((field) => (field.id === id ? { ...field, ...updates } : field)));
    }, []);

    const deleteField = useCallback(
        (id) => {
            setFields((prevFields) => prevFields.filter((field) => field.id !== id));
            if (selectedFieldId === id) {
                setSelectedFieldId(null);
            }
            previewTrigger.current += 1; // Trigger preview refresh
        },
        [selectedFieldId],
    );

    const handleFieldClick = (id) => {
        setSelectedFieldId(id);
        setPendingField(null);
    };

    const handleFieldDoubleClick = (id) => {
        const field = fields.find((f) => f.id === id);
        if (field?.type === "signature" && (!field.value || field.value === "signed")) {
            setIsSignatureModalOpen(true);
        }
    };

    const saveSignature = (signatureData) => {
        if (selectedFieldId) {
            updateField(selectedFieldId, {
                value: "signed",
                signatureData,
            });
        }
        setIsSignatureModalOpen(false);
    };

    const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.1, 2));
    const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
    const handleResetZoom = () => setScale(1);

    const addRecipient = () => {
        const newRecipient = {
            id: Date.now(),
            email: "",
            name: `Signer ${recipients.length + 1}`,
        };
        setRecipients([...recipients, newRecipient]);
    };

    const updateRecipient = (id, field, value) => {
        setRecipients(
            recipients.map((recipient) => (recipient.id === id ? { ...recipient, [field]: value } : recipient)),
        );
    };

    const removeRecipient = (id) => {
        if (recipients.length > 1) {
            setRecipients(recipients.filter((recipient) => recipient.id !== id));
        }
    };

    const handleSendForSigning = () => {
        if (!pdfFile) {
            alert("Please upload a PDF file first.");
            return;
        }
        if (fields.length === 0) {
            alert("Please add at least one form field.");
            return;
        }
        if (recipients.some((r) => !r.email)) {
            alert("Please fill in all recipient email addresses.");
            return;
        }
        alert("Document sent for signing! (This is a demo)");
    };

    const handleDownload = () => {
        if (!pdfFile) {
            alert("Please upload a PDF file first.");
            return;
        }
        alert("PDF downloaded! (This is a demo)");
    };
    // Hàm xử lý xem trước (Preview) với popup
    const handlePreview = () => {
        if (!pdfFile) {
            alert("Please upload a PDF file first.");
            return;
        }
        setIsPreviewOpen(true); // Mở popup preview
    };

    // Hàm đóng popup preview
    const closePreview = () => {
        setIsPreviewOpen(false);
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <FileText className="text-blue-600" size={24} />
                            <span className="font-bold text-xl text-gray-800">PDF Editor</span>
                        </div>
                        <div className="h-6 w-px bg-gray-300"></div>
                        <input
                            type="text"
                            value={documentName}
                            onChange={(e) => setDocumentName(e.target.value)}
                            className="text-lg font-medium bg-transparent border-0 outline-none text-gray-800 hover:bg-gray-50 px-2 py-1 rounded"
                        />
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 bg-gray-100 rounded-md p-1">
                            <button onClick={handleZoomOut} className="p-1 hover:bg-gray-200 rounded" title="Zoom Out">
                                <ZoomOut size={16} />
                            </button>
                            <span className="px-2 text-sm font-medium">{Math.round(scale * 100)}%</span>
                            <button onClick={handleZoomIn} className="p-1 hover:bg-gray-200 rounded" title="Zoom In">
                                <ZoomIn size={16} />
                            </button>
                            <button
                                onClick={handleResetZoom}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Reset Zoom"
                            >
                                <RotateCcw size={16} />
                            </button>
                        </div>
                        <button
                            onClick={handlePreview}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <Eye size={16} />
                            <span>Preview</span>
                        </button>
                        <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                            <Download size={16} />
                            <span>Download</span>
                        </button>
                        <button
                            onClick={handleSendForSigning}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Send size={16} />
                            <span>Send for Signing</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 mt-20 flex flex-col">
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors ${
                                activeTab === tab.id
                                    ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                            }`}
                        >
                            <tab.icon size={16} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 p-4 overflow-y-auto">
                    {activeTab === "fields" && (
                        <div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload PDF Document
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        id="file-upload"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                                        <p className="text-sm text-gray-600">Click to upload PDF</p>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-700 mb-3">Add Form Fields</h3>
                                <div className="space-y-2">
                                    {fieldTypes.map((fieldType) => (
                                        <button
                                            key={fieldType.type}
                                            onClick={() => selectFieldType(fieldType.type)}
                                            className="w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group focus:bg-blue-100"
                                        >
                                            <div className="p-2 rounded-md bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                                                <fieldType.icon size={16} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {fields.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                                        Fields Added ({fields.length})
                                    </h3>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {fields.map((field) => (
                                            <div
                                                key={field.id}
                                                className={`flex items-center justify-between p-2 rounded-md ${
                                                    selectedFieldId === field.id
                                                        ? "bg-blue-50 border border-blue-200"
                                                        : "bg-gray-50"
                                                }`}
                                            >
                                                <span className="text-sm text-gray-600 capitalize">{field.type}</span>
                                                <button
                                                    onClick={() => deleteField(field.id)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "recipients" && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Document Recipients</h3>
                            <div className="space-y-3">
                                <div className="p-3 border border-gray-200 rounded-lg">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-medium text-blue-600">1</span>
                                        </div>
                                        <span className="text-sm font-medium">Signer</span>
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="Enter email address"
                                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                                    />
                                </div>
                                <button className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                                    + Add Recipient
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "settings" && (
                        <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-3">Document Settings</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Signing Order</label>
                                    <select className="w-full p-2 border border-gray-300 rounded-md text-sm">
                                        <option>Any order</option>
                                        <option>Sequential</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm text-gray-600">Require authentication</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input type="checkbox" className="rounded" />
                                        <span className="text-sm text-gray-600">Send completion notification</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 mt-20 p-6 overflow-auto bg-slate-300 relative">
                <div className="relative">
                    {pdfFile ? (
                        <PDFViewer
                            key={previewTrigger.current} // Sử dụng key để buộc re-render khi preview
                            pdfFile={pdfFile}
                            fields={fields}
                            onFieldMove={moveField}
                            onFieldResize={resizeField}
                            onFieldClick={handleFieldClick}
                            onFieldDoubleClick={handleFieldDoubleClick}
                            onFieldDelete={deleteField}
                            onFieldUpdate={updateField}
                            selectedFieldId={selectedFieldId}
                            scale={scale}
                            onAddField={handlePDFClick}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <FileText className="text-gray-400" size={48} />
                                </div>
                                <h3 className="text-xl font-medium text-gray-800 mb-2">
                                    Upload a document to get started
                                </h3>
                                <p className="text-gray-600 mb-4">Drag and drop your PDF file or click to browse</p>
                                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer transition-colors">
                                    <Plus size={16} className="mr-2" />
                                    Choose File
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Popup Preview */}
            {isPreviewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl h-5/6 flex flex-col">
                        <div className="flex justify-between items-center border-b pb-2 mb-4">
                            <h3 className="text-lg font-semibold">Final Preview: {documentName}</h3>
                            <button onClick={closePreview} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-gray-100 p-4 rounded-lg">
                            <PDFPreview pdfFile={pdfFile} fields={fields} scale={scale} />
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {fields.length > 0 ? (
                                    <span>
                                        Showing filled form with {fields.length} field{fields.length !== 1 ? "s" : ""}
                                    </span>
                                ) : (
                                    <span>No form fields added yet</span>
                                )}
                            </div>
                            <button
                                onClick={closePreview}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Signature Modal */}
            <SignatureModal
                isOpen={isSignatureModalOpen}
                onSave={saveSignature}
                onCancel={() => setIsSignatureModalOpen(false)}
            />
        </div>
    );
};

export default PDFEditor;
