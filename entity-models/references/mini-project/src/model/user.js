import { Model } from './model.js';

class UserModel extends Model {
    static table = 'users';

    constructor({ id, name, email } = {}) {
        super();
        this.id = id;
        this.name = name || '';
        this.email = email || '';
    }

    async loadById() {
        const row = await this.get({ id: this.id });
        if (!row) {
            return null;
        }

        Object.assign(this, row);
        return this;
    }
}

export { UserModel };