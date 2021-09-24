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
        default: '',
        enum: ['']
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