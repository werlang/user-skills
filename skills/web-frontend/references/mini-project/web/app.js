import express from 'express';
import mustacheExpress from 'mustache-express';
import { renderMiddleware } from './middleware/render.js';

const app = express();
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.engine('html', mustacheExpress());
app.set('view engine', 'html');
app.set('views', new URL('./src/html/', import.meta.url).pathname);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(new URL('./public/', import.meta.url).pathname));

app.use(renderMiddleware({
    apiUrl: process.env.API_URL || 'http://localhost:3001',
    siteName: 'Reference Web App',
}));

app.get('/', (req, res) => {
    res.templateRender('index', {
        pageName: 'home',
        headline: 'Starter frontend reference',
    });
});

app.listen(port, host, () => {
    console.log(`Web listening at http://${host}:${port}`);
});

export { app };