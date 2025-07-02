const BaseEntity = require("./BaseEntity");
class SignatureRequest extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.documentId = data.documentId || "";
        this.createdBy = data.createdBy || "";
        this.title = data.title || "";
        this.message = data.message || "";
        this.requestType = data.requestType || "signature"; // signature, form_fill, both
        this.status = data.status || "draft"; // draft, sent, in_progress, completed, cancelled, expired
        this.dueDate = data.dueDate || null;
        this.reminderFrequency = data.reminderFrequency || 3;
        this.lastReminderSent = data.lastReminderSent || null;
        this.completionOrder = data.completionOrder || "any"; // any, sequential
        this.requireAllRecipients = data.requireAllRecipients !== undefined ? data.requireAllRecipients : true;
        this.allowDecline = data.allowDecline !== undefined ? data.allowDecline : true;
        this.sentAt = data.sentAt || null;
        this.completedAt = data.completedAt || null;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();

        // Related entities
        this.recipients = [];
        this.assignedFields = [];
        this.signatures = [];
        this.auditTrail = [];
        this.notifications = [];
    }

    static create(requestData) {
        return new SignatureRequest(requestData);
    }

    updateTitle(newTitle) {
        this.title = newTitle;
        this.updatedAt = new Date();
        return this;
    }

    updateMessage(newMessage) {
        this.message = newMessage;
        this.updatedAt = new Date();
        return this;
    }

    setDueDate(dueDate) {
        this.dueDate = dueDate;
        this.updatedAt = new Date();
        return this;
    }

    addRecipient(recipient) {
        this.recipients.push(recipient);
        return this;
    }

    removeRecipient(recipientId) {
        this.recipients = this.recipients.filter((r) => r.id !== recipientId);
        return this;
    }

    send() {
        this.status = "sent";
        this.sentAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    complete() {
        this.status = "completed";
        this.completedAt = new Date();
        this.updatedAt = new Date();
        return this;
    }

    cancel() {
        this.status = "cancelled";
        this.updatedAt = new Date();
        return this;
    }

    expire() {
        this.status = "expired";
        this.updatedAt = new Date();
        return this;
    }

    updateStatus(newStatus) {
        const validStatuses = ["draft", "sent", "in_progress", "completed", "cancelled", "expired"];
        if (validStatuses.includes(newStatus)) {
            this.status = newStatus;
            this.updatedAt = new Date();
        }
        return this;
    }

    isExpired() {
        return this.dueDate && new Date() > new Date(this.dueDate);
    }

    needsReminder() {
        if (!this.lastReminderSent) return true;
        const daysSinceReminder = (new Date() - new Date(this.lastReminderSent)) / (1000 * 60 * 60 * 24);
        return daysSinceReminder >= this.reminderFrequency;
    }

    getProgress() {
        const totalRecipients = this.recipients.length;
        const completedRecipients = this.recipients.filter((r) => r.status === "completed").length;
        return {
            total: totalRecipients,
            completed: completedRecipients,
            percentage: totalRecipients > 0 ? (completedRecipients / totalRecipients) * 100 : 0,
        };
    }
}

module.exports = SignatureRequest;
