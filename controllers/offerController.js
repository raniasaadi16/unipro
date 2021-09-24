const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError')
const Offer = require('../models/Offer')

exports.getAllOffers = catchAsync(async (req, res, next) => {
    const offers = await Offer.find().populate('company');

    res.status(200).json({
        status: 'success',
        offers
    })
})

exports.getOfferById = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate('company');
    if(!offer) return next(new appError('no offer with this id', 404))

    res.status(200).json({
        status: 'success',
        offer
    })
})


exports.createOffer = catchAsync(async (req, res, next) => {
    const { stageType, description, lieu, startDate, endDate, domains, profile } = req.body
    const offer = await Offer.create({ stageType, description, lieu, startDate, endDate, domains, profile, company: req.user.id });

    res.status(200).json({
        status: 'success',
        offer
    })
})