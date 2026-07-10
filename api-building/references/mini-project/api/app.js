import express from 'express';
import { router as usersRouter } from './routes/users.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/users', usersRouter);

app.use((req, res) => {
    res.status(404).json({ error: 'Not found.' });
});

app.use((error, req, res, next) => {
    console.error(error);
    res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, host, () => {
    console.log(`API listening at http://${host}:${port}`);
});

export { app };