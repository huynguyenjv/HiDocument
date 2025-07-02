const BaseEntity = require("./BaseEntity");

class ActivityLog extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.userId = data.userId || null;
        this.documentId = data.documentId || null;
        this.action = data.action || "";
        this.details = data.details || {};
        this.ipAddress = data.ipAddress || "";
        this.userAgent = data.userAgent || "";
        this.createdAt = data.createdAt || new Date();
    }

    static create(logData) {
        return new ActivityLog(logData);
    }

    static createDocumentActivity(userId, documentId, action, details = {}) {
        return new ActivityLog({
            userId,
            documentId,
            action,
            details,
        });
    }

    static createUserActivity(userId, action, details = {}) {
        return new ActivityLog({
            userId,
            action,
            details,
        });
    }

    updateDetails(additionalDetails) {
        this.details = { ...this.details, ...additionalDetails };
        return this;
    }
}

module.exports = ActivityLog;
