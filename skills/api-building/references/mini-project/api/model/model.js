import { Mysql } from '../helpers/mysql.js';

class Model {
    static table = '';
    static driver = Mysql;

    async find(filter = {}, options = {}) {
        return this.constructor.driver.find(this.constructor.table, { filter, ...options });
    }

    async get(filter = {}, options = {}) {
        return this.constructor.driver.get(this.constructor.table, filter, options);
    }

    async insert(payload) {
        return this.constructor.driver.insert(this.constructor.table, payload);
    }

    async update(payload, filter) {
        return this.constructor.driver.update(this.constructor.table, payload, filter);
    }

    async delete(filter) {
        return this.constructor.driver.delete(this.constructor.table, filter);
    }
}

export { Model };