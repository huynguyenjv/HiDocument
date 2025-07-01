class Annotation extends BaseEntity{
    constructor(data = {}){
        super();
        this.id = data.id || BaseEntity.generateUUID();
        this.documentId = data.documentId || '';
        this.pageId = data.pageId || '';
        this.userId = data.userId || '';
        this.annotationType = data.annotationType || 'text'; // text, highlight, drawing, stamp, signature
        this.content = data.content || '';
        this.positionX = data.positionX || 0;
        this.positionY = data.positionY || 0;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.color = data.color || '#000000';
        this.fontSize = data.fontSize || 12;
        this.fontFamily = data.fontFamily || 'Arial';
        this.opacity = data.opacity !== undefined ? data.opacity : 1.0;
        this.rotation = data.rotation || 0;
        this.isLocked = data.isLocked !== undefined ? data.isLocked : false;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

     static create(annotationData) {
        return new Annotation(annotationData);
    }

    static createHighlight(pageId, selection) {
        return new Annotation({
            pageId,
            annotationType: 'highlight',
            positionX: selection.x,
            positionY: selection.y,
            width: selection.width,
            height: selection.height,
            color: '#FFFF00'
        });
    }

    static createTextNote(pageId, position, text) {
        return new Annotation({
            pageId,
            annotationType: 'text',
            content: text,
            positionX: position.x,
            positionY: position.y
        });
    }

    updateContent(newContent) {
        this.content = newContent;
        this.updatedAt = new Date();
        return this;
    }

    updatePosition(x, y) {
        this.positionX = x;
        this.positionY = y;
        this.updatedAt = new Date();
        return this;
    }

    updateStyle(styleData) {
        const allowedStyles = ['color', 'fontSize', 'fontFamily', 'opacity'];
        allowedStyles.forEach(style => {
            if (styleData[style] !== undefined) {
                this[style] = styleData[style];
            }
        });
        this.updatedAt = new Date();
        return this;
    }

    lock() {
        this.isLocked = true;
        this.updatedAt = new Date();
        return this;
    }

    unlock() {
        this.isLocked = false;
        this.updatedAt = new Date();
        return this;
    }
}