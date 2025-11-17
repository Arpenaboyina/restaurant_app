import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		price: { type: Number, required: true, min: 0 },
		category: { type: String, required: true, trim: true, enum: ['Starter', 'Main', 'Drinks', 'Dessert'] },
		available: { type: Boolean, default: true },
		imageUrl: { type: String, default: '' },
		isVeg: { type: Boolean, default: true },
		stock: { type: Number, default: 0, min: 0 },
		popularity: { type: Number, default: 0, min: 0 },
		tags: { type: [String], default: [] }, // spicy, gluten-free, etc.
		discountLabel: { type: String, default: '' }, // e.g., "10% OFF"
		customizationOptions: { type: [String], default: ['extra cheese', 'no onion', 'extra spice'] },
	},
	{ timestamps: true }
);

export default mongoose.model('MenuItem', MenuItemSchema);




