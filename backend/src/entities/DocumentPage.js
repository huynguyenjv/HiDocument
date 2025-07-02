const BaseEntity = require("./BaseEntity");
class DocumentPage extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.documentId = data.documentId || "";
        this.pageNumber = data.pageNumber || 1;
        this.thumbnailPath = data.thumbnailPath || null;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.contentHash = data.contentHash || "";
        this.annotationsCount = data.annotationsCount || 0;
        this.createdAt = data.createdAt || new Date().toISOString();

        // Related entities
        this.annotations = [];
        this.formFields = [];
    }

    static create(pageData) {
        return new DocumentPage(pageData);
    }

    updateDimensions(width, height) {
        this.width = width;
        this.height = height;
        return this;
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation);
        this.annotationsCount = this.annotations.length;
        return this;
    }

    removeAnnotation(annotationId) {
        this.annotations = this.annotations.filter((a) => a.id !== annotationId);
        this.annotationsCount = this.annotations.length;
        return this;
    }
}
module.exports = DocumentPage;
