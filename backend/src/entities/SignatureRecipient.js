const BaseEntity = require("./BaseEntity");
class SignatureRecipient extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.requestId = data.requestId || "";
        this.recipientEmail = data.recipientEmail || "";
        this.recipientName = data.recipientName || "";
        this.recipientUserId = data.recipientUserId || null;
        this.role = data.role || "signer"; // signer, approver, cc, viewer
        this.signingOrder = data.signingOrder || 1;
        this.status = data.status || "pending"; // pending, viewed, in_progress, completed, declined
        this.accessToken = data.accessToken || this.generateAccessToken();
        this.phoneNumber = data.phoneNumber || null;
        this.verificationMethod = data.verificationMethod || "email"; // email, sms, both
        this.verificationCode = data.verificationCode || null;
        this.verificationExpiresAt = data.verificationExpiresAt || null;
        this.isVerified = data.isVerified !== undefined ? data.isVerified : false;
        this.personalMessage = data.personalMessage || "";
        this.viewedAt = data.viewedAt || null;
        this.completedAt = data.completedAt || null;
        this.declinedAt = data.declinedAt || null;
        this.declineReason = data.declineReason || "";
        this.ipAddress = data.ipAddress || null;
        this.userAgent = data.userAgent || null;
        this.createdAt = data.createdAt || new Date();

        // Related entities
        this.assignedFields = [];
        this.signatures = [];
    }

    static create(recipientData) {
        return new SignatureRecipient(recipientData);
    }

    generateAccessToken() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    generateVerificationCode() {
        this.verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        return this.verificationCode;
    }

    updateStatus(newStatus) {
        this.status = newStatus;
        const now = new Date();

        switch (newStatus) {
            case "viewed":
                this.viewedAt = now;
                break;
            case "completed":
                this.completedAt = now;
                break;
            case "declined":
                this.declinedAt = now;
                break;
        }
        return this;
    }

    verify(code) {
        if (this.verificationCode === code && new Date() < new Date(this.verificationExpiresAt)) {
            this.isVerified = true;
            this.verificationCode = null;
            this.verificationExpiresAt = null;
            return true;
        }
        return false;
    }

    markAsViewed(ipAddress, userAgent) {
        this.status = "viewed";
        this.viewedAt = new Date();
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        return this;
    }

    startSigning() {
        this.status = "in_progress";
        return this;
    }

    complete() {
        this.status = "completed";
        this.completedAt = new Date();
        return this;
    }

    decline(reason) {
        this.status = "declined";
        this.declinedAt = new Date();
        this.declineReason = reason;
        return this;
    }

    isExpiredVerification() {
        return this.verificationExpiresAt && new Date() > new Date(this.verificationExpiresAt);
    }
}
module.exports = SignatureRecipient;
