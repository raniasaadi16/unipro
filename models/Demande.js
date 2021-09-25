const mongoose = require('mongoose');

var demandeSchema = new mongoose.Schema({
    fields:[ {
        type: String,
        required: true,
    }],
    lettre: {
        type: String,
        required: true
    },
    accepted: {
        type: String,
        default: 'not treated',
        enum: ['not treated', 'in progress', 'rejected', 'accepted']
    },
    offer: {
        type: mongoose.Schema.ObjectId,
        ref: 'Offer',
    },
    student: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }
})

module.exports = mongoose.model('Demande', demandeSchema)