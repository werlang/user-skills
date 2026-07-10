import bcrypt from 'bcrypt';
import { Model } from './model.js';

class UserModel extends Model {
    static table = 'users';
    static rounds = 12;

    constructor({ id, name, email, passwordHash, role = 'user' } = {}) {
        super();
        this.id = id;
        this.name = typeof name === 'string' ? name.trim() : '';
        this.email = typeof email === 'string' ? email.trim().toLowerCase() : '';
        this.passwordHash = passwordHash || null;
        this.role = role;
    }

    async loadById() {
        const row = await this.get({ id: this.id });
        if (!row) {
            return null;
        }

        this.#hydrate(row);
        return this;
    }

    async loadByEmail() {
        const row = await this.get({ email: this.email });
        if (!row) {
            return null;
        }

        this.#hydrate(row);
        return this;
    }

    async create(password) {
        this.passwordHash = await bcrypt.hash(password, UserModel.rounds);
        await this.insert({
            name: this.name,
            email: this.email,
            password_hash: this.passwordHash,
            role: this.role,
        });

        return this.loadByEmail();
    }

    async updateProfile({ name, email } = {}) {
        if (name !== undefined) {
            this.name = String(name).trim();
        }
        if (email !== undefined) {
            this.email = String(email).trim().toLowerCase();
        }

        await this.update({
            name: this.name,
            email: this.email,
        }, { id: this.id });

        return this.loadById();
    }

    async deleteById() {
        await this.delete({ id: this.id });
    }

    async verifyPassword(password) {
        return bcrypt.compare(password, this.passwordHash || '');
    }

    toPublicJSON() {
        return {
            id: this.id,
            name: this.name,
            email: this.email,
            role: this.role,
        };
    }

    #hydrate(row) {
        this.id = row.id;
        this.name = row.name;
        this.email = row.email;
        this.passwordHash = row.password_hash;
        this.role = row.role;
    }
}

export { UserModel };