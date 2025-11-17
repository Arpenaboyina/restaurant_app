import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema(
	{
		tableId: { type: String, required: true, unique: true, index: true }, // URL id
		name: { type: String, required: false, default: '' }, // Display name
		tablePassword: { type: String, required: true },
		active: { type: Boolean, default: true },
		occupied: { type: Boolean, default: false },
	},
	{ timestamps: true }
);

export default mongoose.model('Table', TableSchema);




