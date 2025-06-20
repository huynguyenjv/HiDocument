import React, { useState, useCallback, useRef } from 'react';
import { FileText, Type, Edit3, Download, Send, Users, Eye, Settings, Plus, X, Check, Move, Trash2 } from 'lucide-react';

// Type definitions
interface Field {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox';
  left: number;
  top: number;
  value?: string;
  placeholder?: string;
  signatureData?: string;
}

interface DraggableFieldProps {
  id: string;
  type: 'text' | 'signature' | 'date' | 'checkbox';
  left: number;
  top: number;
  value?: string;
  placeholder?: string;
  signatureData?: string;
  onMove: (id: string, left: number, top: number) => void;
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  isSelected: boolean;
}

interface SignatureModalProps {
  isOpen: boolean;
  onSave: (signatureData: string) => void;
  onCancel: () => void;
}

interface FieldType {
  type: 'text' | 'signature' | 'date' | 'checkbox';
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  color: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

// Component Field có thể kéo thả
const DraggableField: React.FC<DraggableFieldProps> = ({ 
  id, 
  type, 
  left, 
  top, 
  value, 
  placeholder, 
  signatureData, 
  onMove, 
  onClick, 
  onDelete, 
  isSelected 
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - left,
      y: e.clientY - top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newLeft = e.clientX - dragStart.x;
      const newTop = e.clientY - dragStart.y;
      onMove(id, Math.max(0, newLeft), Math.max(0, newTop));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, onMove, id]);

  const getFieldStyles = (): string => {
    switch (type) {
      case 'text':
        return 'w-48 h-10 border-2 border-blue-400 bg-blue-50';
      case 'signature':
        return 'w-56 h-20 border-2 border-green-400 bg-green-50';
      case 'date':
        return 'w-40 h-10 border-2 border-purple-400 bg-purple-50';
      case 'checkbox':
        return 'w-6 h-6 border-2 border-orange-400 bg-orange-50';
      default:
        return 'w-48 h-10 border-2 border-gray-400 bg-gray-50';
    }
  };

  return (
    <div
      className={`absolute cursor-move rounded-md p-2 group transition-all duration-200 ${getFieldStyles()} 
        ${isDragging ? 'opacity-70 shadow-lg scale-105' : 'opacity-90 hover:opacity-100'} 
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
      style={{ left, top }}
      onMouseDown={handleMouseDown}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        onClick(id);
      }}
    >
      <div className="absolute flex space-x-1 transition-opacity opacity-0 -top-2 -right-2 group-hover:opacity-100">
        <button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            onDelete(id);
          }}
          className="flex items-center justify-center w-5 h-5 text-xs text-white bg-red-500 rounded-full hover:bg-red-600"
        >
          <X size={10} />
        </button>
        <div className="flex items-center justify-center w-5 h-5 text-xs text-white bg-gray-600 rounded-full">
          <Move size={10} />
        </div>
      </div>
      
      {type === 'text' && (
        <input
          type="text"
          placeholder={placeholder || "Text field"}
          value={value || ''}
          className="w-full h-full text-sm bg-transparent border-0 outline-none"
          readOnly
        />
      )}
      
      {type === 'signature' && (
        <div className="flex items-center justify-center w-full h-full">
          {signatureData ? (
            <img src={signatureData} alt="Signature" className="object-contain w-full h-full" />
          ) : (
            <span className="text-xs font-medium text-green-600">Click to sign</span>
          )}
        </div>
      )}
      
      {type === 'date' && (
        <input
          type="date"
          className="w-full h-full text-sm bg-transparent border-0 outline-none"
          readOnly
        />
      )}
      
      {type === 'checkbox' && (
        <div className="flex items-center justify-center w-full h-full">
          <div className="w-4 h-4 border border-gray-400 rounded"></div>
        </div>
      )}
    </div>
  );
};

// Component vẽ chữ ký
const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataURL = canvas.toDataURL('image/png');
    onSave(dataURL);
  };

  React.useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-[500px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Add Your Signature</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 mb-4 border-2 border-gray-300 border-dashed rounded-lg">
          <canvas
            ref={canvasRef}
            width={450}
            height={150}
            className="w-full h-32 bg-white border border-gray-200 rounded cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <p className="mt-2 text-sm text-center text-gray-500">Draw your signature above</p>
        </div>
        
        <div className="flex justify-between">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear
          </button>
          <div className="space-x-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveSignature}
              className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Save Signature
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Component chính
const Editor: React.FC = () => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('fields');
  const [documentName, setDocumentName] = useState<string>('Untitled Document');

  const fieldTypes: FieldType[] = [
    { type: 'text', icon: Type, label: 'Text Field', color: 'blue' },
    { type: 'signature', icon: Edit3, label: 'Signature', color: 'green' },
    { type: 'date', icon: FileText, label: 'Date', color: 'purple' },
    { type: 'checkbox', icon: Check, label: 'Checkbox', color: 'orange' },
  ];

  const tabs: TabItem[] = [
    { id: 'fields', label: 'Fields', icon: Plus },
    { id: 'recipients', label: 'Recipients', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      setDocumentName(file.name.replace('.pdf', ''));
    } else {
      alert('Vui lòng tải lên file PDF hợp lệ.');
    }
  };

  const addField = (type: Field['type']) => {
    const newField: Field = {
      id: `field-${Date.now()}`,
      type,
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      value: '',
      placeholder: `${type.charAt(0).toUpperCase() + type.slice(1)} field`
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const moveField = useCallback((id: string, left: number, top: number) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, left, top } : field
      )
    );
  }, []);

  const deleteField = useCallback((id: string) => {
    setFields((prevFields) => prevFields.filter((field) => field.id !== id));
    if (selectedFieldId === id) {
      setSelectedFieldId(null);
    }
  }, [selectedFieldId]);

  const handleFieldClick = (id: string) => {
    const field = fields.find((f) => f.id === id);
    setSelectedFieldId(id);
    if (field?.type === 'signature') {
      setIsSignatureModalOpen(true);
    }
  };

  const saveSignature = (signatureData: string) => {
    if (selectedFieldId) {
      setFields((prevFields) =>
        prevFields.map((field) =>
          field.id === selectedFieldId ? { ...field, signatureData } : field
        )
      );
    }
    setIsSignatureModalOpen(false);
  };

  const handleSendForSigning = () => {
    alert('Tính năng gửi ký sẽ được triển khai trong phiên bản tiếp theo!');
  };

  const handleDocumentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentName(e.target.value);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-40 px-6 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <FileText className="text-blue-600" size={24} />
              <span className="text-xl font-bold text-gray-800">PandaDoc Demo</span>
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <input
              type="text"
              value={documentName}
              onChange={handleDocumentNameChange}
              className="px-2 py-1 text-lg font-medium text-gray-800 bg-transparent border-0 rounded outline-none hover:bg-gray-50"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center px-3 py-2 space-x-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <Eye size={16} />
              <span>Preview</span>
            </button>
            <button className="flex items-center px-3 py-2 space-x-2 text-gray-600 transition-colors rounded-md hover:bg-gray-100">
              <Download size={16} />
              <span>Download</span>
            </button>
            <button 
              onClick={handleSendForSigning}
              className="flex items-center px-4 py-2 space-x-2 text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Send size={16} />
              <span>Send for Signing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col mt-16 bg-white border-r border-gray-200 w-80">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 text-sm font-medium transition-colors
                ${activeTab === tab.id 
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'}`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'fields' && (
            <div>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">Upload PDF Document</label>
                <div className="p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <FileText className="mx-auto mb-2 text-gray-400" size={32} />
                    <p className="text-sm text-gray-600">Click to upload PDF</p>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-medium text-gray-700">Add Form Fields</h3>
                <div className="space-y-2">
                  {fieldTypes.map((fieldType) => (
                    <button
                      key={fieldType.type}
                      onClick={() => addField(fieldType.type)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg border border-gray-200 
                        hover:border-${fieldType.color}-400 hover:bg-${fieldType.color}-50 transition-all group`}
                    >
                      <div className={`p-2 rounded-md bg-${fieldType.color}-100 text-${fieldType.color}-600 
                        group-hover:bg-${fieldType.color}-200`}>
                        <fieldType.icon size={16} />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{fieldType.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {fields.length > 0 && (
                <div className="mt-6">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">Fields Added ({fields.length})</h3>
                  <div className="space-y-2 overflow-y-auto max-h-40">
                    {fields.map((field) => (
                      <div key={field.id} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                        <span className="text-sm text-gray-600 capitalize">{field.type}</span>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="p-1 text-red-500 hover:text-red-700"
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

          {activeTab === 'recipients' && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">Document Recipients</h3>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-2 space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                      <span className="text-sm font-medium text-blue-600">1</span>
                    </div>
                    <span className="text-sm font-medium">Người ký</span>
                  </div>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="w-full p-2 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                <button className="w-full p-2 text-sm text-gray-600 transition-colors border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 hover:text-blue-600">
                  + Add Recipient
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h3 className="mb-3 text-sm font-medium text-gray-700">Document Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm text-gray-600">Signing Order</label>
                  <select className="w-full p-2 text-sm border border-gray-300 rounded-md">
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
      <div className="flex-1 p-6 mt-16 overflow-auto">
        {pdfUrl ? (
          <div className="overflow-hidden bg-white rounded-lg shadow-lg">
            <div className="relative">
              <iframe
                src={pdfUrl}
                className="w-full min-h-[800px] border-0"
                title="PDF Document"
              />
              {fields.map((field) => (
                <DraggableField
                  key={field.id}
                  id={field.id}
                  type={field.type}
                  left={field.left}
                  top={field.top}
                  value={field.value}
                  placeholder={field.placeholder}
                  signatureData={field.signatureData}
                  onMove={moveField}
                  onClick={handleFieldClick}
                  onDelete={deleteField}
                  isSelected={selectedFieldId === field.id}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex items-center justify-center w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full">
                <FileText className="text-gray-400" size={48} />
              </div>
              <h3 className="mb-2 text-xl font-medium text-gray-800">Upload a document to get started</h3>
              <p className="mb-4 text-gray-600">Drag and drop your PDF file or click to browse</p>
              <label className="inline-flex items-center px-4 py-2 text-white transition-colors bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700">
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

      {/* Signature Modal */}
      <SignatureModal
        isOpen={isSignatureModalOpen}
        onSave={saveSignature}
        onCancel={() => setIsSignatureModalOpen(false)}
      />
    </div>
  );
};

export default Editor;