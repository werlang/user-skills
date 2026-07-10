import { Model } from './model.js';

class UserModel extends Model {
    static table = 'users';

    constructor({ id, name, email } = {}) {
        super();
        this.id = id;
        this.name = name || '';
        this.email = email ? String(email).trim().toLowerCase() : '';
    }

    async loadById() {
        return this.get({ id: this.id });
    }

    async loadByEmail() {
        return this.get({ email: this.email });
    }

    async create() {
        return this.insert({
            name: this.name,
            email: this.email,
        });
    }
}

export { UserModel };