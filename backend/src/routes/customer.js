import express from 'express';
import jwt from 'jsonwebtoken';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import Order from '../models/Order.js';
import Feedback from '../models/Feedback.js';

const router = express.Router();

function tableAuth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	try {
		const payload = jwt.verify(token, process.env.TABLE_JWT_SECRET || 'table_secret');
		if (payload.role !== 'table') throw new Error('Invalid role');
		req.tableId = payload.tableId;
		next();
	} catch {
		return res.status(401).json({ error: 'Unauthorized' });
	}
}

// Verify table access with password
router.post('/table/verify', async (req, res) => {
	const { tableId, tablePassword } = req.body || {};
	if (!tableId || !tablePassword) return res.status(400).json({ error: 'Missing fields' });
	const table = await Table.findOne({ tableId, active: true });
	if (!table || table.tablePassword !== tablePassword) {
		return res.status(401).json({ error: 'Invalid table credentials' });
	}
	const token = jwt.sign({ role: 'table', tableId }, process.env.TABLE_JWT_SECRET || 'table_secret', {
		expiresIn: '12h',
	});
	res.json({ token, table: { tableId: table.tableId, name: table.name || table.tableId } });
});

// Public menu (only available items)
router.get('/menu', async (_req, res) => {
	const items = await MenuItem.find({ available: true }).sort({ category: 1, name: 1 });
	res.json(items);
});

// Place order
router.post('/orders', tableAuth, async (req, res) => {
	const { items, notes = '' } = req.body || {};
	if (!Array.isArray(items) || items.length === 0) {
		return res.status(400).json({ error: 'No items' });
	}

	// Validate items and compute total from DB prices
	const ids = items.map((i) => i.menuItemId);
	const dbItems = await MenuItem.find({ _id: { $in: ids }, available: true });
	const dbMap = new Map(dbItems.map((i) => [String(i._id), i]));

	let total = 0;
	const orderItems = [];
	for (const item of items) {
		const db = dbMap.get(String(item.menuItemId));
		if (!db) return res.status(400).json({ error: 'Invalid item in order' });
		const qty = Math.max(1, Number(item.quantity || 1));
		total += db.price * qty;
		orderItems.push({
			menuItemId: db._id,
			name: db.name,
			price: db.price,
			quantity: qty,
			customizations: typeof item.customizations === 'string' ? item.customizations : '',
		});
	}

	const created = await Order.create({
		tableId: req.tableId,
		items: orderItems,
		notes,
		total,
		status: 'new',
	});
	res.status(201).json(created);
});

// View my table orders
router.get('/orders', tableAuth, async (req, res) => {
	const orders = await Order.find({ tableId: req.tableId }).sort({ createdAt: -1 });
	res.json(orders);
});

// Call waiter (simple log endpoint; could integrate notifications)
router.post('/call-waiter', tableAuth, async (req, res) => {
	console.log(`Waiter called by table ${req.tableId}`);
	// For simplicity, store a lightweight notification in-memory log or DB. Here: reuse Order with special note.
	await Order.create({
		tableId: req.tableId,
		items: [],
		total: 0,
		status: 'new',
		notes: 'CALL_WAITER',
	});
	res.json({ ok: true });
});

// Submit feedback for a served order
router.post('/feedback', tableAuth, async (req, res) => {
	const { orderId, foodRating, serviceRating, suggestions = '' } = req.body || {};
	if (!orderId || !foodRating || !serviceRating) return res.status(400).json({ error: 'Missing fields' });
	const order = await Order.findOne({ _id: orderId, tableId: req.tableId });
	if (!order) return res.status(404).json({ error: 'Order not found' });
	const created = await Feedback.create({
		orderId,
		tableId: req.tableId,
		foodRating,
		serviceRating,
		suggestions,
	});
	res.status(201).json(created);
});

export default router;




