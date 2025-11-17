import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema(
	{
		menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
		name: { type: String, required: true },
		price: { type: Number, required: true, min: 0 },
		quantity: { type: Number, required: true, min: 1 },
		customizations: { type: String, default: '' }, // per-item notes/options
	},
	{ _id: false }
);

const OrderSchema = new mongoose.Schema(
	{
		tableId: { type: String, required: true, index: true },
		items: { type: [OrderItemSchema], required: true },
		status: {
			type: String,
			enum: ['new', 'preparing', 'ready', 'served', 'cancelled'],
			default: 'new',
			index: true,
		},
		total: { type: Number, required: true, min: 0 },
		notes: { type: String, default: '' }, // customer notes
		preparingAt: { type: Date },
		readyAt: { type: Date },
		servedAt: { type: Date },
	},
	{ timestamps: true }
);

export default mongoose.model('Order', OrderSchema);




