import jwt from 'jsonwebtoken';
import { UserModel } from '../model/user.js';

function issueToken(user) {
    return jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'change-me',
        { expiresIn: '6h' },
    );
}

function readBearerToken(req) {
    const authorization = req.headers.authorization || '';
    if (!authorization.startsWith('Bearer ')) {
        return null;
    }

    return authorization.slice(7).trim();
}

async function requireAuth(req, res, next) {
    try {
        const token = readBearerToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Missing bearer token.' });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET || 'change-me');
        const user = await new UserModel({ id: payload.userId }).loadById();
        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }

        req.user = user;
        return next();
    }
    catch {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}

export { issueToken, readBearerToken, requireAuth };