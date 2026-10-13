
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import productsRouter from './routes/products';
import authRouter from './routes/auth';
import openApiSpec from './openapi';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api-docs', (req, res, next) => {
  if (req.path === '/api-docs') {
    res.redirect(301, '/api-docs/');
    return;
  }

  next();
});
app.use('/api-docs/', swaggerUi.serve, swaggerUi.setup(openApiSpec));

app.get(['/health', '/api/health'], (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);

const PORT = Number(process.env.PORT) || 5002;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
