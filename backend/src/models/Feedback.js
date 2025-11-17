import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema(
	{
		orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
		tableId: { type: String, required: true, index: true },
		foodRating: { type: Number, min: 1, max: 5, required: true },
		serviceRating: { type: Number, min: 1, max: 5, required: true },
		suggestions: { type: String, default: '' },
	},
	{ timestamps: true }
);

export default mongoose.model('Feedback', FeedbackSchema);


