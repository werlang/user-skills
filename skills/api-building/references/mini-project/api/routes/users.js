import express from 'express';
import { sendCreated, sendNoContent, sendSuccess } from '../helpers/response.js';
import { issueToken, requireAuth } from '../middlewares/auth.js';
import { UserModel } from '../model/user.js';

const router = express.Router();

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const existingUser = await new UserModel({ email }).loadByEmail();
    if (existingUser) {
        return res.status(409).json({ error: 'Email already registered.' });
    }

    const user = await new UserModel({ name, email }).create(password);
    return sendCreated(res, { user: user.toPublicJSON() });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await new UserModel({ email }).loadByEmail();
    if (!user || !await user.verifyPassword(password)) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    return sendSuccess(res, {
        token: issueToken(user),
        user: user.toPublicJSON(),
    });
});

router.get('/me', requireAuth, async (req, res) => {
    return sendSuccess(res, { user: req.user.toPublicJSON() });
});

router.put('/me', requireAuth, async (req, res) => {
    const user = await req.user.updateProfile({
        name: req.body.name,
        email: req.body.email,
    });

    return sendSuccess(res, { user: user.toPublicJSON() });
});

router.delete('/me', requireAuth, async (req, res) => {
    await req.user.deleteById();
    return sendNoContent(res);
});

export { router };