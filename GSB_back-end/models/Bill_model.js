const mongoose = require('mongoose')

const billSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  proof: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  lastReminderSent: {
    type: Date,
    required: false, // ← on le rend facultatif pour les factures jamais rappelées
    default: null 
  },
  createdAt: {
    type: String,
    default: Date.now(),
  },
})
const Bill = mongoose.model('Bills', billSchema)
module.exports = Bill