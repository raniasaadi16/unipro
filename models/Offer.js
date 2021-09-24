const mongoose = require('mongoose');

var offerSchema = new mongoose.Schema({
    stageType: {
        type: String,
        required: true,
        enum: ['ouvrier','pfe','decouvert','pratique']
    },
    description: {
        type: String,
        required: true
    },
    lieu: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    domains:[ {
        type: String,
        required: true
    }],
    profile: [String],
    company: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
})

module.exports = mongoose.model('Offer', offerSchema)