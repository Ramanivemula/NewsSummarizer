const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  country: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  notifyDaily: { type: Boolean, default: false },
  deliveryMethod: { type: String, enum: ['email', 'whatsapp'], default: 'email' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
