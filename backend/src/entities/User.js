class User extends BaseEntity {
    constructor(data = {}) {
        super();
        this.id = data.is || BaseEntity.generateUUID();
        this.username = data.username || '';
        this.email = data.email || '';
        this.passwordHash = data.passwordHash || '';
        this.fullName = data.fullName || '';
        this.avatarUrl = data.avatarUrl || '';
        this.subcriptionType = data.subscription || null;
        this.lastLogin = data.lastLogin || null;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    static create(userData){
        return new User(userData);
    }

    updateProfile(profileData){
        const allowFields = ['fullName', 'avatarUrl'];
        allowFields.forEach(field => {
            if(profileData[field] !== undefined){
                this[field] = profileData[field];
            }           
        });
        this.updatedAt = new Date().toISOString();
        return this;
    }

    updateSubscription(subscriptionType){
        if(['free','premium','enterprise'].includes(subscriptionType)){
            this.subscriptionType = subscriptionType;
            this.updatedAt = new Date().toISOString();
            return this;
        }
    }

    setLastLogin(){
        this.lastLogin = new Date().toISOString();
        return this;
    }

    deactivate(){
        this.isActive = false;
        this.updateAt = new Date().toISOString();
        return this;
    }

    toJSON(){
        const json = super.toJSON();
        delete json.passwordHash;
        return json;
    }
}