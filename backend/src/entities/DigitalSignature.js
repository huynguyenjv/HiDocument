class DigitalSignature extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.requestId = data.requestId || '';
        this.recipientId = data.recipientId || '';
        this.assignedFieldId = data.assignedFieldId || null;
        this.signatureType = data.signatureType || 'drawn'; // drawn, typed, uploaded, certificate
        this.signatureData = data.signatureData || '';
        this.signatureImageUrl = data.signatureImageUrl || null;
        this.certificateInfo = data.certificateInfo || {};
        this.ipAddress = data.ipAddress || '';
        this.userAgent = data.userAgent || '';
        this.geolocation = data.geolocation || {};
        this.timestampServer = data.timestampServer || null;
        this.hashAlgorithm = data.hashAlgorithm || 'SHA-256';
        this.signatureHash = data.signatureHash || '';
        this.isValid = data.isValid !== undefined ? data.isValid : true;
        this.createdAt = data.createdAt || new Date();
    }

    static create(signatureData) {
        return new DigitalSignature(signatureData);
    }

    static createDrawnSignature(recipientId, signatureData, metadata) {
        return new DigitalSignature({
            recipientId,
            signatureType: 'drawn',
            signatureData,
            ipAddress: metadata.ipAddress,
            userAgent: metadata.userAgent,
            geolocation: metadata.geolocation
        });
    }

    generateHash() {
        const crypto = require('crypto');
        const dataToHash = `${this.recipientId}-${this.signatureData}-${this.createdAt.toISOString()}`;
        this.signatureHash = crypto.createHash('sha256').update(dataToHash).digest('hex');
        return this.signatureHash;
    }

    invalidate() {
        this.isValid = false;
        return this;
    }

    addTimestamp(timestampServer) {
        this.timestampServer = timestampServer;
        return this;
    }
}