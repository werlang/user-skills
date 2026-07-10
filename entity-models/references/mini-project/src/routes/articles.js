import express from 'express';
import { ArticleModel } from '../model/article.js';

const router = express.Router();

router.get('/:id', async (req, res) => {
    const article = await new ArticleModel({ id: req.params.id }).loadById();
    if (!article) {
        return res.status(404).json({ error: 'Article not found.' });
    }

    const author = await article.loadAuthor();
    return res.status(200).json({
        article: article.toJSON(),
        author: author ? { id: author.id, name: author.name, email: author.email } : null,
    });
});

router.post('/', async (req, res) => {
    const { title, body, authorId, tagIds = [] } = req.body;
    if (!title || !authorId) {
        return res.status(400).json({ error: 'Title and authorId are required.' });
    }

    const article = await new ArticleModel({ title, body, authorId }).create();
    await article.replaceTags(tagIds);
    return res.status(201).json({ article: article.toJSON() });
});

router.put('/:id', async (req, res) => {
    const article = await new ArticleModel({ id: req.params.id }).loadById();
    if (!article) {
        return res.status(404).json({ error: 'Article not found.' });
    }

    await article.updateDetails({ title: req.body.title, body: req.body.body });

    if (Array.isArray(req.body.tagIds)) {
        await article.replaceTags(req.body.tagIds);
    }

    return res.status(200).json({ article: article.toJSON() });
});

router.delete('/:id', async (req, res) => {
    const article = await new ArticleModel({ id: req.params.id }).loadById();
    if (!article) {
        return res.status(404).json({ error: 'Article not found.' });
    }

    await article.deleteById();
    return res.status(204).send();
});

export { router };