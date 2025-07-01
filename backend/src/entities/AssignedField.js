class AssignedField extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.requestId = data.requestId || '';
        this.recipientId = data.recipientId || '';
        this.formFieldId = data.formFieldId || null;
        this.fieldType = data.fieldType || 'signature'; // signature, initial, text, date, checkbox, etc.
        this.fieldLabel = data.fieldLabel || '';
        this.positionX = data.positionX || 0;
        this.positionY = data.positionY || 0;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.pageNumber = data.pageNumber || 1;
        this.isRequired = data.isRequired !== undefined ? data.isRequired : true;
        this.placeholderText = data.placeholderText || '';
        this.validationRules = data.validationRules || {};
        this.completedAt = data.completedAt || null;
        this.fieldValue = data.fieldValue || '';
        this.signatureImageUrl = data.signatureImageUrl || null;
        this.createdAt = data.createdAt || new Date();
    }

    static create(fieldData) {
        return new AssignedField(fieldData);
    }

    static createSignatureField(recipientId, position, pageNumber) {
        return new AssignedField({
            recipientId,
            fieldType: 'signature',
            positionX: position.x,
            positionY: position.y,
            width: position.width || 200,
            height: position.height || 60,
            pageNumber,
            fieldLabel: 'Signature'
        });
    }

    setValue(value) {
        this.fieldValue = value;
        this.completedAt = new Date();
        return this;
    }

    setSignatureImage(imageUrl) {
        this.signatureImageUrl = imageUrl;
        this.completedAt = new Date();
        return this;
    }

    validate() {
        if (this.isRequired && !this.fieldValue && !this.signatureImageUrl) {
            return { valid: false, message: 'This field is required' };
        }

        // Apply validation rules
        if (this.validationRules.minLength && this.fieldValue.length < this.validationRules.minLength) {
            return { valid: false, message: `Minimum length is ${this.validationRules.minLength}` };
        }

        if (this.validationRules.maxLength && this.fieldValue.length > this.validationRules.maxLength) {
            return { valid: false, message: `Maximum length is ${this.validationRules.maxLength}` };
        }

        if (this.validationRules.pattern && !new RegExp(this.validationRules.pattern).test(this.fieldValue)) {
            return { valid: false, message: 'Invalid format' };
        }

        return { valid: true };
    }

    isCompleted() {
        return this.completedAt !== null;
    }
}