const BaseEntity = require("./BaseEntity");
class Folder extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.userId = data.userId || "";
        this.name = data.name || "";
        this.parentFolderId = data.parentFolderId || null;
        this.color = data.color || "#3498db";
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();

        // Related entities
        this.documents = [];
        this.subfolders = [];
    }

    static create(folderData) {
        return new Folder(folderData);
    }

    updateName(newName) {
        this.name = newName;
        this.updatedAt = new Date();
        return this;
    }

    updateColor(newColor) {
        this.color = newColor;
        this.updatedAt = new Date();
        return this;
    }

    addDocument(document) {
        this.documents.push(document);
        return this;
    }

    removeDocument(documentId) {
        this.documents = this.documents.filter((d) => d.id !== documentId);
        return this;
    }

    addSubfolder(folder) {
        this.subfolders.push(folder);
        return this;
    }
}
module.exports = Folder;
