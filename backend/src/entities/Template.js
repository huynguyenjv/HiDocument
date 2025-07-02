const BaseEntity = require("./BaseEntity");

class Templates extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.name = data.name || "";
        this.description = data.description || "";
        this.category = data.category || "";
        this.filePath = data.filePath || "";
        this.thumbnailUrl = data.thumbnailUrl || "";
        this.isPublic = data.isPublic !== undefined ? data.isPublic : true;
        this.createdBy = data.createdBy || "";
        this.usageCount = data.usageCount || 0;
        this.createdAt = data.createdAt || new Date();

        // Related entities
        this.createdUser = data.createdUser || null; // User entity
    }

    static create(templateData) {
        return new Templates(templateData);
    }

    updateUsageCount() {
        this.usageCount += 1;
        return this;
    }

    isPublicTemplate() {
        return this.isPublic;
    }
}
