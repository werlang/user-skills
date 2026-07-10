import { Api } from '../helpers/api.js';
import { LocalData } from '../helpers/local-data.js';

class UserModel {
    constructor({ id, name, email, token } = {}) {
        this.id = id;
        this.name = name || '';
        this.email = email || '';
        this.token = token || null;
        this.api = new Api({ token: this.token });
    }

    async getCurrent() {
        const response = await this.api.get('/users/me');
        this.id = response.user.id;
        this.name = response.user.name;
        this.email = response.user.email;
        return this;
    }

    saveToken(token) {
        this.token = token;
        new LocalData({ id: 'auth-token' }).set({ data: token, expires: '12h' });
        this.api = new Api({ token: this.token });
    }

    static fromStorage() {
        return new UserModel({ token: new LocalData({ id: 'auth-token' }).get() });
    }
}

export { UserModel };