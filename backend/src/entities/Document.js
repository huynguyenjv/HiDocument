const BaseEntity = require("./BaseEntity");
class Document extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.userId = data.userId || "";
        this.title = data.title || "";
        this.orginalFileName = data.orginalFileName || "";
        this.filePath = data.filePath || "";
        this.fileSize = data.fileSize || 0;
        this.mimeType = data.mimeType || "";
        this.pageCount = data.pageCount || 0;
        this.thumbnailPath = data.thumbnailPath || "";
        this.isPublic = data.isPublic !== undefined ? data.isPublic : true;
        this.isTemplate = data.isTemplate !== undefined ? data.isTemplate : false;
        this.lastAccessed = data.lastAccessed || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();

        // Related entities
        this.pages = [];
        this.annotations = [];
        this.versions = [];
        this.folders = [];
    }

    static create(documentData) {
        return new Document(documentData);
    }

    updateTitle(newTitle) {
        this.title = newTitle;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateAccess() {
        this.lastAccessed = new Date().toISOString();
        return this;
    }

    makePublic() {
        this.isPublic = true;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    makePrivate() {
        this.isPublic = false;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    setAsTemplate() {
        this.isTemplate = true;
        this.updatedAt = new Date().toISOString();
        return this;
    }

    addPage(page) {
        this.pages.push(page);
        this.pageCount = this.pages.length;
        return this;
    }

    addAnnotation(annotation) {
        this.annotations.push(annotation);
        return this;
    }
}
module.exports = Document;
