import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import ownerRouter from './routes/owner.js';
import customerRouter from './routes/customer.js';

dotenv.config();

const app = express();

// CORS configuration - handle all origins and preflight requests
app.use(cors({
	origin: function (origin, callback) {
		// Allow all origins (for development)
		// In production, you should whitelist specific origins
		callback(null, true);
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
	exposedHeaders: ['Content-Type', 'Authorization'],
	optionsSuccessStatus: 200,
	preflightContinue: false
}));

// Additional CORS headers for all responses
app.use((req, res, next) => {
	const origin = req.headers.origin;
	if (origin) {
		res.header('Access-Control-Allow-Origin', origin);
	} else {
		res.header('Access-Control-Allow-Origin', '*');
	}
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
	res.header('Access-Control-Allow-Credentials', 'true');
	
	// Handle preflight requests explicitly
	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}
	next();
});

app.use(morgan('dev'));
app.use(express.json());

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




