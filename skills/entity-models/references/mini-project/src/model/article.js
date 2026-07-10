import { Model } from './model.js';
import { Relation } from './relation.js';
import { UserModel } from './user.js';

class ArticleModel extends Model {
    static table = 'articles';

    constructor({ id, title, body, authorId } = {}) {
        super();
        this.id = id;
        this.title = title || '';
        this.body = body || '';
        this.authorId = authorId || null;
    }

    async loadById() {
        const row = await this.get({ id: this.id });
        if (!row) {
            return null;
        }

        this.id = row.id;
        this.title = row.title;
        this.body = row.body;
        this.authorId = row.author_id;
        return this;
    }

    async create() {
        await this.insert({
            title: this.title,
            body: this.body,
            author_id: this.authorId,
        });
        return this;
    }

    async updateDetails({ title, body } = {}) {
        if (title !== undefined) {
            this.title = String(title).trim();
        }
        if (body !== undefined) {
            this.body = String(body).trim();
        }

        await this.update({
            title: this.title,
            body: this.body,
        }, { id: this.id });

        return this.loadById();
    }

    async deleteById() {
        await this.delete({ id: this.id });
    }

    async loadAuthor() {
        if (!this.authorId) {
            return null;
        }

        return new UserModel({ id: this.authorId }).loadById();
    }

    tagsRelation() {
        return new Relation('article_tags', { article_id: this.id }, 'tag_id');
    }

    async replaceTags(tagIds = []) {
        await this.tagsRelation().replace(tagIds);
        return this.tagsRelation().getAll();
    }

    toJSON() {
        return {
            id: this.id,
            title: this.title,
            body: this.body,
            authorId: this.authorId,
        };
    }
}

export { ArticleModel };