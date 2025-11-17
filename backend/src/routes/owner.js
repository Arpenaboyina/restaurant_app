import express from 'express';
import jwt from 'jsonwebtoken';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

function ownerAuth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.OWNER_JWT_SECRET || 'owner_secret');
		if (payload.role !== 'owner') throw new Error('Invalid role');
		req.owner = { id: payload.sub };
		next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

router.post('/login', (req, res) => {
	const { password } = req.body || {};
	if (!password) return res.status(400).json({ error: 'password required' });
	const expected = process.env.OWNER_PASSWORD || 'change_me_owner_password';
	if (password !== expected) {
		return res.status(401).json({ error: 'Invalid owner password' });
	}
	const token = jwt.sign({ role: 'owner', sub: 'owner' }, process.env.OWNER_JWT_SECRET || 'owner_secret', {
		expiresIn: '12h',
	});
	res.json({ token });
});

// Menu CRUD
router.get('/menu', ownerAuth, async (_req, res) => {
	const items = await MenuItem.find().sort({ createdAt: -1 });
	res.json(items);
});

router.post('/menu', ownerAuth, async (req, res) => {
	const {
		name, price, category, available = true, imageUrl = '', isVeg = true, stock = 0,
		popularity = 0, tags = [], discountLabel = '', customizationOptions = [],
	} = req.body || {};
	if (!name || price == null || !category) return res.status(400).json({ error: 'Missing fields' });
	const created = await MenuItem.create({
		name, price, category, available, imageUrl, isVeg, stock,
		popularity,
		tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map(s => s.trim()).filter(Boolean),
		discountLabel,
		customizationOptions: Array.isArray(customizationOptions) ? customizationOptions : String(customizationOptions || '').split(',').map(s => s.trim()).filter(Boolean),
	});
	res.status(201).json(created);
});

router.put('/menu/:id', ownerAuth, async (req, res) => {
	const { id } = req.params;
	const update = req.body || {};
	if (update.tags && !Array.isArray(update.tags)) {
		update.tags = String(update.tags).split(',').map(s => s.trim()).filter(Boolean);
	}
	if (update.customizationOptions && !Array.isArray(update.customizationOptions)) {
		update.customizationOptions = String(update.customizationOptions).split(',').map(s => s.trim()).filter(Boolean);
	}
	const updated = await MenuItem.findByIdAndUpdate(id, update, { new: true });
	if (!updated) return res.status(404).json({ error: 'Not found' });
	res.json(updated);
});

router.delete('/menu/:id', ownerAuth, async (req, res) => {
	const { id } = req.params;
	const deleted = await MenuItem.findByIdAndDelete(id);
	if (!deleted) return res.status(404).json({ error: 'Not found' });
	res.json({ ok: true });
});

// Tables
router.get('/tables', ownerAuth, async (_req, res) => {
	const tables = await Table.find().sort({ createdAt: -1 });
	res.json(tables);
});

router.post('/tables', ownerAuth, async (req, res) => {
	const { tableId, tablePassword, name = '', active = true } = req.body || {};
	if (!tableId || !tablePassword) return res.status(400).json({ error: 'Missing fields' });
	const exists = await Table.findOne({ tableId });
	if (exists) return res.status(409).json({ error: 'tableId already exists' });
	const created = await Table.create({ tableId, tablePassword, name, active });
	res.status(201).json(created);
});

router.put('/tables/:tableId', ownerAuth, async (req, res) => {
	const { tableId } = req.params;
	const update = req.body || {};
	const updated = await Table.findOneAndUpdate({ tableId }, update, { new: true });
	if (!updated) return res.status(404).json({ error: 'Not found' });
	res.json(updated);
});

router.delete('/tables/:tableId', ownerAuth, async (req, res) => {
	const { tableId } = req.params;
	const deleted = await Table.findOneAndDelete({ tableId });
	if (!deleted) return res.status(404).json({ error: 'Not found' });
	res.json({ ok: true });
});

// Generate QR for table
router.get('/tables/:tableId/qr', ownerAuth, async (req, res) => {
	const { tableId } = req.params;
	const table = await Table.findOne({ tableId });
	if (!table) return res.status(404).json({ error: 'Not found' });
	const base = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
	const url = `${base}/?table=${encodeURIComponent(tableId)}`;
	// Return URL; client can generate QR with any library
	res.json({ tableId, url });
});

// Orders (view and mark fulfilled)
router.get('/orders', ownerAuth, async (_req, res) => {
	const orders = await Order.find().sort({ createdAt: -1 });
	res.json(orders);
});

router.post('/orders/:id/fulfill', ownerAuth, async (req, res) => {
	const { id } = req.params;
	const updated = await Order.findByIdAndUpdate(id, { status: 'served' }, { new: true });
	if (!updated) return res.status(404).json({ error: 'Not found' });
	res.json(updated);
});

// Update order status (new -> preparing -> ready -> served, or cancel)
router.post('/orders/:id/status', ownerAuth, async (req, res) => {
	const { id } = req.params;
	const { status } = req.body || {};
	if (!['new', 'preparing', 'ready', 'served', 'cancelled'].includes(status)) {
		return res.status(400).json({ error: 'Invalid status' });
	}
	const set = { status };
	const now = new Date();
	if (status === 'preparing') set.preparingAt = now;
	if (status === 'ready') set.readyAt = now;
	if (status === 'served') set.servedAt = now;
	const updated = await Order.findByIdAndUpdate(id, set, { new: true });
	if (!updated) return res.status(404).json({ error: 'Not found' });
	res.json(updated);
});

// Analytics summary
router.get('/analytics/summary', ownerAuth, async (_req, res) => {
	const todayStart = new Date(); todayStart.setHours(0,0,0,0);
	const dailyOrders = await Order.countDocuments({ createdAt: { $gte: todayStart } });
	const topSelling = await Order.aggregate([
		{ $unwind: '$items' },
		{ $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
		{ $sort: { qty: -1 } },
		{ $limit: 5 },
	]);
	const leastSelling = await Order.aggregate([
		{ $unwind: '$items' },
		{ $group: { _id: '$items.name', qty: { $sum: '$items.quantity' } } },
		{ $sort: { qty: 1 } },
		{ $limit: 5 },
	]);
	// Satisfaction score
	const feedbackAgg = await (await import('mongoose')).default.model('Feedback').aggregate([
		{ $project: { score: { $avg: ['$foodRating', '$serviceRating'] } } },
		{ $group: { _id: null, avg: { $avg: '$score' } } },
	]);
	const satisfaction = feedbackAgg?.[0]?.avg ?? null;
	// Busiest table
	const busiestTableAgg = await Order.aggregate([
		{ $group: { _id: '$tableId', orders: { $sum: 1 } } },
		{ $sort: { orders: -1 } },
		{ $limit: 1 },
	]);
	const busiestTable = busiestTableAgg?.[0] || null;
	// Average prep time (served orders)
	const served = await Order.aggregate([
		{ $match: { servedAt: { $ne: null } } },
		{ $project: { diffMinutes: { $divide: [{ $subtract: ['$servedAt', '$createdAt'] }, 60000] } } },
		{ $group: { _id: null, avg: { $avg: '$diffMinutes' } } },
	]);
	const avgPrepMinutes = served?.[0]?.avg ?? null;
	res.json({ dailyOrders, topSelling, leastSelling, satisfaction, busiestTable, avgPrepMinutes });
});

// Reset table: mark not occupied and (optionally) delete/close orders
router.post('/tables/:tableId/reset', ownerAuth, async (req, res) => {
	const { tableId } = req.params;
	await Table.findOneAndUpdate({ tableId }, { occupied: false });
	// Here we keep order history; could also delete if desired
	res.json({ ok: true });
});

// Feedback listing
router.get('/feedback', ownerAuth, async (_req, res) => {
	const list = await Feedback.find().sort({ createdAt: -1 });
	res.json(list);
});

export default router;




