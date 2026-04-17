const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fromLocation: {
        address: String,
        lat: Number,
        lng: Number
    },
    toLocation: {
        address: String,
        lat: Number,
        lng: Number
    },
    distance: String,
    duration: String,
    selectedProvider: {
        name: String, // e.g. Uber, Ola, Rapido
        vehicleType: String, // e.g. Cab, Auto, Bike
        price: Number,
        estimatedTime: String
    },
    status: {
        type: String,
        enum: ['completed', 'cancelled', 'scheduled'],
        default: 'completed'
    },
    scheduledFor: {
        type: Date
    }
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
