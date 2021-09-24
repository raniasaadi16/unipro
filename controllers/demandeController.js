const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError')
const Demande = require('../models/Demande')
const Offer = require('../models/Offer')

exports.getAllDemandes = catchAsync(async (req, res, next) => {
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId).populate('company')
    if(!offer) return next(new appError('no offer with this id', 404))
    if(!(offer.company.id === req.user.id)) return next(new appError('you are not authorize to do that', 401))

    const demandes = await Demande.find().populate('student');

    res.status(200).json({
        status: 'success',
        demandes
    })
})

exports.createDemande = catchAsync(async (req, res, next) => {
    const { fields, lettre  } = req.body
    const { offerId } = req.params;
    const offer = await Offer.findById(offerId)
    const demande = await Demande.create({ fields, lettre, student: req.user.id, offer});

    res.status(201).json({
        status: 'success',
        demande
    })
})