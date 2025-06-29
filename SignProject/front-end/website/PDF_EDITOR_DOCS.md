# PDF Editor - Tài liệu Hệ thống

## Tổng quan

PDF Editor là một ứng dụng web cho phép người dùng chỉnh sửa tài liệu PDF bằng cách thêm các trường form (text, signature, date, checkbox), sau đó xem trước và gửi để ký số.

## Cấu trúc Project

```
src/
├── features/
│   └── pdfEditor.jsx          # Component chính
├── component/ui/
│   ├── PDFViewer.jsx          # Hiển thị PDF ở chế độ chỉnh sửa
│   ├── PDFPreview.jsx         # Hiển thị PDF ở chế độ xem trước
│   ├── DraggableField.jsx     # Component field có thể kéo thả
│   └── SignatureModal.jsx     # Modal để tạo chữ ký
└── ...
```

## Các Component Chính

### 1. PDFEditor (features/pdfEditor.jsx)

**Mục đích**: Component chính quản lý toàn bộ ứng dụng

**State chính**:

-   `pdfFile`: File PDF được upload
-   `fields`: Array chứa tất cả các field đã thêm
-   `selectedFieldId`: ID của field đang được chọn
-   `scale`: Tỷ lệ zoom của PDF
-   `isPreviewOpen`: Trạng thái mở popup preview

**Chức năng chính**:

-   Upload PDF file
-   Quản lý các field (thêm, xóa, di chuyển, resize)
-   Zoom in/out PDF
-   Preview document
-   Gửi để ký số

### 2. PDFViewer (component/ui/PDFViewer.jsx)

**Mục đích**: Hiển thị PDF ở chế độ chỉnh sửa với các field overlay

**Props**:

-   `pdfFile`: File PDF
-   `fields`: Array các field
-   `onFieldMove`: Callback khi di chuyển field
-   `onFieldResize`: Callback khi resize field
-   `onFieldClick`: Callback khi click field
-   `onFieldDoubleClick`: Callback khi double click field
-   `onFieldDelete`: Callback khi xóa field
-   `onFieldUpdate`: Callback khi cập nhật field
-   `selectedFieldId`: ID field đang chọn
-   `scale`: Tỷ lệ zoom
-   `onAddField`: Callback khi click trên PDF để thêm field

**Chức năng**:

-   Render PDF với PDF.js
-   Hiển thị các field như overlay trên PDF
-   Xử lý click trên PDF để thêm field mới
-   Truyền events từ DraggableField lên parent

### 3. DraggableField (component/ui/DraggableField.jsx)

**Mục đích**: Component field có thể kéo thả, resize và chỉnh sửa

**Props**:

-   `id`, `type`, `left`, `top`, `width`, `height`: Thuộc tính field
-   `value`, `placeholder`: Nội dung field
-   `onMove`: Callback khi di chuyển
-   `onResize`: Callback khi resize
-   `onClick`, `onDoubleClick`: Callbacks click
-   `onDelete`, `onUpdate`: Callbacks thao tác
-   `isSelected`: Trạng thái được chọn
-   `scale`: Tỷ lệ zoom
-   `maxWidth`, `maxHeight`: Giới hạn boundary

**Chức năng**:

-   Kéo thả field (drag & drop)
-   Resize field bằng handle ở góc dưới phải
-   Chỉnh sửa nội dung field
-   Hiển thị nút xóa khi được chọn
-   Hỗ trợ nhiều loại field: text, date, signature, checkbox

### 4. PDFPreview (component/ui/PDFPreview.jsx)

**Mục đích**: Hiển thị PDF với field values được render trực tiếp lên canvas

**Props**:

-   `pdfFile`: File PDF
-   `fields`: Array các field
-   `scale`: Tỷ lệ zoom

**Chức năng**:

-   Render PDF lên canvas
-   Vẽ field values trực tiếp lên canvas (không phải overlay)
-   Hiển thị kết quả cuối cùng như khi in ra

### 5. SignatureModal (component/ui/SignatureModal.jsx)

**Mục đích**: Modal để tạo chữ ký điện tử

**Chức năng**:

-   Vẽ chữ ký bằng canvas
-   Lưu chữ ký dưới dạng base64 image
-   Clear và redo chữ ký

## Luồng hoạt động

### 1. Upload PDF

```
User chọn file PDF → handleFileUpload() → setPdfFile() → PDFViewer render PDF
```

### 2. Thêm Field

```
User click loại field → selectFieldType() → setPendingField()
User click trên PDF → handlePDFClick() → tạo field mới → setFields()
```

### 3. Chỉnh sửa Field

```
User click field → handleFieldClick() → setSelectedFieldId()
User kéo field → DraggableField.onMove → moveField() → cập nhật position
User resize field → DraggableField.onResize → resizeField() → cập nhật size
User nhập text → DraggableField.onChange → updateField() → cập nhật value
```

### 4. Signature

```
User double-click signature field → handleFieldDoubleClick() → mở SignatureModal
User vẽ chữ ký → saveSignature() → cập nhật field với signatureData
```

### 5. Preview

```
User click Preview → handlePreview() → setIsPreviewOpen(true)
PDFPreview render PDF + fields lên canvas → hiển thị kết quả cuối cùng
```

## Hệ thống Coordinate

### Edit Mode (PDFViewer) - Overlay Technique

-   PDF được render với viewport scale = 1.5
-   Image hiển thị với kích thước: `viewport.width * scale * 0.6`
-   Field coordinates lưu theo tỷ lệ gốc, hiển thị với `position * scale`
-   Boundary constraints: `maxWidth/maxHeight = imageWidth/imageHeight / scale`

**Kỹ thuật Overlay**:

```javascript
// 1. PDF render lên canvas
const viewport = page.getViewport({ scale: 1.5 });
const canvas = document.createElement("canvas");
canvas.width = viewport.width;
canvas.height = viewport.height;
await page.render({ canvasContext: ctx, viewport }).promise;

// 2. Image hiển thị với scale
const displayWidth = viewport.width * scale * 0.6;
const displayHeight = viewport.height * scale * 0.6;

// 3. Fields như overlay HTML elements
<div
    style={{
        left: field.left * scale,
        top: field.top * scale,
        width: field.width * scale,
        height: field.height * scale,
    }}
/>;
```

### Preview Mode (PDFPreview) - Canvas Rendering Technique

-   PDF render lên canvas với kích thước: `viewport.width * scale * 0.6`
-   Field coordinates được scale: `field.position * scale`
-   Fields được vẽ trực tiếp lên canvas, không phải overlay

**Kỹ thuật Canvas Rendering**:

```javascript
// 1. Canvas size khớp với display size
const finalWidth = viewport.width * scale * 0.6;
const finalHeight = viewport.height * scale * 0.6;
canvas.width = finalWidth;
canvas.height = finalHeight;

// 2. PDF render với scale phù hợp
const renderViewport = page.getViewport({ scale: 1.5 * scale * 0.6 });
await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

// 3. Fields vẽ trực tiếp lên canvas
const x = field.left * scale;
const y = field.top * scale;
ctx.fillText(field.value, x, y);
```

## Công thức Tính toán Chi tiết

### 1. Scale Calculations

#### Edit Mode Scale Flow:

```javascript
// Base viewport scale
const BASE_VIEWPORT_SCALE = 1.5;

// User zoom scale (0.5 - 2.0)
const userScale = scale; // từ state

// Display scale factor
const DISPLAY_FACTOR = 0.6;

// Final image dimensions
const imageWidth = viewport.width * userScale * DISPLAY_FACTOR;
const imageHeight = viewport.height * userScale * DISPLAY_FACTOR;

// Field position on screen
const fieldScreenX = field.left * userScale;
const fieldScreenY = field.top * userScale;
```

#### Preview Mode Scale Flow:

```javascript
// Canvas dimensions match display
const canvasWidth = viewport.width * userScale * DISPLAY_FACTOR;
const canvasHeight = viewport.height * userScale * DISPLAY_FACTOR;

// PDF render scale
const renderScale = BASE_VIEWPORT_SCALE * userScale * DISPLAY_FACTOR;

// Field coordinates on canvas
const fieldCanvasX = field.left * userScale;
const fieldCanvasY = field.top * userScale;
```

### 2. Coordinate Transformations

#### Screen to PDF Coordinates:

```javascript
// Khi user click trên PDF để thêm field
const handlePDFClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();

    // Screen coordinates
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    // Convert to PDF coordinates
    const pdfX = screenX / scale;
    const pdfY = screenY / scale;

    // Store in field (normalized coordinates)
    const newField = {
        left: pdfX,
        top: pdfY,
        // ...
    };
};
```

#### PDF to Screen Coordinates:

```javascript
// Khi hiển thị field trên screen
const fieldStyle = {
    left: field.left * scale,
    top: field.top * scale,
    width: field.width * scale,
    height: field.height * scale,
};
```

### 3. Boundary Calculations

#### Edit Mode Boundaries:

```javascript
// Available space for field movement
const maxWidth = imageWidth / scale - field.width;
const maxHeight = imageHeight / scale - field.height;

// Constrain field position
const constrainedLeft = Math.max(0, Math.min(newLeft, maxWidth));
const constrainedTop = Math.max(0, Math.min(newTop, maxHeight));
```

#### Resize Boundaries:

```javascript
// Maximum field size
const maxFieldWidth = imageWidth / scale - field.left;
const maxFieldHeight = imageHeight / scale - field.top;

// Minimum field size
const MIN_WIDTH = 50;
const MIN_HEIGHT = 20;

// Constrain resize
const constrainedWidth = Math.max(MIN_WIDTH, Math.min(newWidth, maxFieldWidth));
const constrainedHeight = Math.max(MIN_HEIGHT, Math.min(newHeight, maxFieldHeight));
```

### 4. Canvas Rendering Calculations

#### Text Rendering:

```javascript
const renderTextOnCanvas = (ctx, field) => {
    // Position calculation
    const x = field.left * scale;
    const y = field.top * scale;
    const width = field.width * scale;
    const height = field.height * scale;

    // Font scaling
    const fontSize = Math.max(10, 12 * scale);
    ctx.font = `${fontSize}px Arial`;

    // Text position (centered vertically)
    const textY = y + height / 2;
    ctx.fillText(field.value, x + 4, textY);
};
```

#### Signature Rendering:

```javascript
const renderSignatureOnCanvas = (ctx, field) => {
    const x = field.left * scale;
    const y = field.top * scale;
    const width = field.width * scale;
    const height = field.height * scale;

    if (field.signatureData) {
        // Image scaling
        const img = new Image();
        img.onload = () => {
            // Maintain aspect ratio
            const aspectRatio = img.width / img.height;
            const scaledHeight = width / aspectRatio;

            if (scaledHeight <= height) {
                ctx.drawImage(img, x, y + (height - scaledHeight) / 2, width, scaledHeight);
            } else {
                const scaledWidth = height * aspectRatio;
                ctx.drawImage(img, x + (width - scaledWidth) / 2, y, scaledWidth, height);
            }
        };
    }
};
```

### 5. Drag & Drop Calculations

#### Mouse Delta Conversion:

```javascript
const handleMouseMove = (e) => {
    if (isDragging) {
        // Raw mouse movement
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;

        // Convert to PDF coordinate space
        const pdfDeltaX = deltaX / scale;
        const pdfDeltaY = deltaY / scale;

        // New position
        const newLeft = startPosition.left + pdfDeltaX;
        const newTop = startPosition.top + pdfDeltaY;
    }
};
```

#### Resize Delta Conversion:

```javascript
const handleResize = (e) => {
    if (isResizing) {
        // Mouse movement since resize start
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        // Convert to size change
        const newWidth = resizeStart.width + deltaX / scale;
        const newHeight = resizeStart.height + deltaY / scale;

        // Apply constraints
        const constrainedWidth = Math.max(MIN_WIDTH, newWidth);
        const constrainedHeight = Math.max(MIN_HEIGHT, newHeight);
    }
};
```

## Kỹ thuật Implementation

### 1. Edit Mode - Overlay Technique

**Ưu điểm**:

-   Performance tốt (PDF render 1 lần)
-   Interactive dễ dàng (HTML elements)
-   CSS styling linh hoạt
-   Event handling đơn giản

**Nhược điểm**:

-   Không phải WYSIWYG hoàn toàn
-   Có thể có offset nhỏ
-   Phụ thuộc vào CSS positioning

**Implementation**:

```javascript
// PDF container
<div className="relative">
    <img src={pdfDataUrl} width={displayWidth} height={displayHeight} />

    {/* Field overlays */}
    <div className="absolute inset-0">
        {fields.map((field) => (
            <DraggableField
                key={field.id}
                style={{
                    position: "absolute",
                    left: field.left * scale,
                    top: field.top * scale,
                    width: field.width * scale,
                    height: field.height * scale,
                }}
            />
        ))}
    </div>
</div>
```

### 2. Preview Mode - Canvas Rendering Technique

**Ưu điểm**:

-   WYSIWYG chính xác 100%
-   Kết quả giống in ấn thực tế
-   Có thể export exact image

**Nhược điểm**:

-   Performance thấp hơn (re-render khi thay đổi)
-   Không interactive
-   Phức tạp hơn cho text rendering

**Implementation**:

```javascript
const renderPreview = async () => {
    // 1. Create canvas với kích thước chính xác
    const canvas = document.createElement("canvas");
    const finalScale = 1.5 * scale * 0.6;
    canvas.width = viewport.width * scale * 0.6;
    canvas.height = viewport.height * scale * 0.6;

    // 2. Render PDF với scale phù hợp
    const renderViewport = page.getViewport({ scale: finalScale });
    await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

    // 3. Render từng field lên canvas
    for (const field of fields) {
        await renderFieldOnCanvas(ctx, field);
    }

    // 4. Convert canvas to image
    const dataUrl = canvas.toDataURL();
    setPageImage(dataUrl);
};
```

### 3. Synchronization Techniques

#### State Consistency:

```javascript
// Đảm bảo cả 2 mode sử dụng cùng field data
const [fields, setFields] = useState([]);

// Update field trigger re-render cho cả 2 mode
const updateField = (id, updates) => {
    setFields((prev) => prev.map((field) => (field.id === id ? { ...field, ...updates } : field)));

    // Trigger preview re-render
    previewTrigger.current += 1;
};
```

#### Scale Synchronization:

```javascript
// Cùng scale value cho cả 2 mode
const [scale, setScale] = useState(1);

// Edit mode sử dụng scale cho positioning
<DraggableField scale={scale} />

// Preview mode sử dụng scale cho canvas
<PDFPreview scale={scale} />
```

## Các loại Field

### 1. Text Field

-   Input text thông thường
-   Có placeholder và value
-   Có thể chỉnh sửa trực tiếp

### 2. Date Field

-   Input type="date"
-   Hiển thị date picker
-   Format: YYYY-MM-DD

### 3. Signature Field

-   Click đơn: chọn field
-   Double-click: mở SignatureModal
-   Hiển thị ảnh chữ ký hoặc text "✓ Signed"
-   Lưu signatureData dưới dạng base64

### 4. Checkbox Field

-   Input type="checkbox"
-   Value: "true"/"false"
-   Preview: hiển thị dấu tick khi checked

## Events và Callbacks

### Field Events

-   `onMove(id, left, top)`: Di chuyển field
-   `onResize(id, width, height)`: Thay đổi kích thước field
-   `onClick(id)`: Click chọn field
-   `onDoubleClick(id)`: Double-click field (dành cho signature)
-   `onDelete(id)`: Xóa field
-   `onUpdate(id, updates)`: Cập nhật thuộc tính field

### PDF Events

-   `onAddField(x, y, pageNumber)`: Click trên PDF để thêm field

## State Management

### Field State Structure

```javascript
{
  id: "field-1234567890",           // Unique ID
  type: "text|signature|date|checkbox", // Loại field
  left: 100,                        // Vị trí X
  top: 200,                         // Vị trí Y
  width: 120,                       // Chiều rộng
  height: 32,                       // Chiều cao
  value: "text content",            // Giá trị field
  placeholder: "Enter text",        // Placeholder
  pageNumber: 1,                    // Trang PDF
  signatureData: "data:image/png..." // Base64 của chữ ký (chỉ signature field)
}
```

### Main State

```javascript
const [pdfFile, setPdfFile] = useState(null); // File PDF
const [fields, setFields] = useState([]); // Array fields
const [selectedFieldId, setSelectedFieldId] = useState(null); // Field đang chọn
const [pendingField, setPendingField] = useState(null); // Field type đang chờ thêm
const [scale, setScale] = useState(1); // Zoom level
const [isPreviewOpen, setIsPreviewOpen] = useState(false); // Trạng thái preview
```

## Styling và UI

### Tailwind Classes chính

-   Layout: `flex`, `grid`, `absolute`, `relative`
-   Spacing: `p-4`, `m-2`, `space-x-2`
-   Colors: `bg-blue-600`, `text-white`, `border-gray-300`
-   Interactive: `hover:bg-blue-700`, `focus:ring-2`

### Component Styling

-   **Selected Field**: `border-blue-500 bg-blue-50`
-   **Hover States**: `hover:bg-gray-100`
-   **Buttons**: `px-4 py-2 rounded-md transition-colors`
-   **Modal**: `fixed inset-0 bg-black bg-opacity-50`

## Performance & Optimization

### PDF Rendering

-   Sử dụng PDF.js với worker để tránh block UI
-   Cache page images trong state
-   Re-render khi cần thiết với key trigger

### Field Rendering

-   useCallback cho event handlers
-   Chỉ re-render field bị thay đổi
-   Boundary checking để tránh vượt khỏi PDF

### Memory Management

-   Cleanup event listeners khi unmount
-   Clear canvas context khi không dùng
-   Optimize image base64 size

## API và Integration

### File Handling

```javascript
// Upload PDF
const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (file && file.type === "application/pdf") {
        setPdfFile(file);
    }
};

// Download PDF (demo)
const handleDownload = () => {
    // Integration with PDF generation library
    alert("PDF downloaded! (This is a demo)");
};
```

### Send for Signing

```javascript
const handleSendForSigning = () => {
    // Validation
    if (!pdfFile || fields.length === 0) return;

    // Integration with signing service
    // POST /api/documents/send-for-signing
    // Body: { pdfFile, fields, recipients }
};
```

## Troubleshooting

### Vấn đề thường gặp

1. **Field không hiển thị đúng vị trí**

    - Kiểm tra scale calculation
    - Verify coordinate system
    - Check boundary constraints

2. **Resize không hoạt động**

    - Đảm bảo onResize prop được truyền
    - Check event handler binding
    - Verify state update

3. **PDF không load**

    - Check PDF.js worker setup
    - Verify file type validation
    - Check console errors

4. **Preview không match Edit mode**
    - So sánh scale calculations
    - Check coordinate mapping
    - Verify canvas rendering

### Debug Tips

-   Sử dụng console.log để track field coordinates
-   Check React DevTools cho state changes
-   Verify event propagation với stopPropagation()
-   Test với different PDF files và zoom levels

## Tương lai và Mở rộng

### Tính năng có thể thêm

-   **Multi-page support**: Cải thiện hỗ trợ PDF nhiều trang
-   **Undo/Redo**: Lịch sử thao tác
-   **Field validation**: Validate required fields
-   **Templates**: Lưu và tái sử dụng field layouts
-   **Collaboration**: Real-time editing nhiều người
-   **Advanced signatures**: Handwritten, typed, uploaded
-   **Export formats**: Export to different formats
-   **Cloud storage**: Lưu documents trên cloud

### Technical Improvements

-   **Performance**: Virtual scrolling cho large PDFs
-   **Accessibility**: ARIA labels, keyboard navigation
-   **Mobile**: Touch-friendly interface
-   **Testing**: Unit tests và E2E tests
-   **TypeScript**: Type safety
-   **Internationalization**: Multi-language support

---

## Kết luận

PDF Editor là một hệ thống phức tạp với nhiều component tương tác. Key points:

1. **Separation of Concerns**: Edit mode vs Preview mode riêng biệt
2. **Coordinate Systems**: Cần consistent mapping giữa các modes
3. **Event Handling**: Proper propagation và state management
4. **Performance**: Optimize rendering và memory usage
5. **User Experience**: Intuitive drag & drop, clear visual feedback

Hệ thống này có thể mở rộng và customize dễ dàng cho các use cases khác nhau.
