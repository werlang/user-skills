class LocalData {
    constructor({ id, data = null, expires = false } = {}) {
        this.id = id;
        this.data = data;
        this.expires = expires;
    }

    get() {
        const value = localStorage.getItem(this.id);
        if (!value) {
            return null;
        }

        const parsed = JSON.parse(value);
        this.data = parsed.data;
        this.expires = parsed.expires;

        if (this.expires && this.expires <= Date.now()) {
            this.remove();
            return null;
        }

        return this.data;
    }

    set({ data = this.data, expires = this.expires } = {}) {
        const normalizedExpires = typeof expires === 'string'
            ? Date.now() + LocalData.#readDuration(expires)
            : expires;

        localStorage.setItem(this.id, JSON.stringify({
            data,
            expires: normalizedExpires,
        }));

        this.data = data;
        this.expires = normalizedExpires;
    }

    remove() {
        localStorage.removeItem(this.id);
        this.data = null;
        this.expires = false;
    }

    static #readDuration(value) {
        const amount = Number.parseInt(value.slice(0, -1), 10);
        const unit = value.slice(-1);
        const multipliers = {
            h: 60 * 60 * 1000,
            d: 24 * 60 * 60 * 1000,
            w: 7 * 24 * 60 * 60 * 1000,
        };

        return amount * (multipliers[unit] || 0);
    }
}

export { LocalData };