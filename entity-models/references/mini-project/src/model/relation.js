import { Mysql } from '../helpers/mysql.js';

class Relation {
    constructor(table, nativeFilter, relatedField, driver = Mysql) {
        this.table = table;
        this.nativeFilter = nativeFilter;
        this.relatedField = relatedField;
        this.driver = driver;
    }

    async getAll() {
        return this.driver.find(this.table, { filter: this.nativeFilter });
    }

    async insert(value) {
        return this.driver.insert(this.table, {
            ...this.nativeFilter,
            [this.relatedField]: value,
        });
    }

    async replace(values = []) {
        await this.driver.delete(this.table, this.nativeFilter);

        for (const value of values) {
            await this.insert(value);
        }
    }

    async delete(value) {
        return this.driver.delete(this.table, {
            ...this.nativeFilter,
            [this.relatedField]: value,
        });
    }
}

export { Relation };