const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromAddress: String,
    toAddress: String,
    fromLat: Number,
    fromLng: Number,
    toLat: Number,
    toLng: Number
}, { timestamps: true });

module.exports = mongoose.model('Search', searchSchema);
