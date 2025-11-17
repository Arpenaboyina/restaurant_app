import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import ownerRouter from './routes/owner.js';
import customerRouter from './routes/customer.js';

dotenv.config();

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(
	cors({
		origin: process.env.CLIENT_ORIGIN?.split(',') ?? '*',
		credentials: true,
	})
);

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/api/owner', ownerRouter);
app.use('/api/customer', customerRouter);

const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant';

async function start() {
	try {
		await mongoose.connect(mongoUri, { autoIndex: true });
		console.log('Connected to MongoDB');
		app.listen(port, () => {
			console.log(`Backend listening on http://0.0.0.0:${port}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();




