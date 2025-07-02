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
