import mongoose from 'mongoose';

const AgentSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    countryCode: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    address: { type: String },
    description: { type: String },
    profilePic: { type: String },
    isActive: { type: Boolean, default: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, { timestamps: true });

export default mongoose.model('Agent', AgentSchema);