const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();
const offerController = require('../controllers/offerController');
const demandeRoutes = require('../routes/demandeRoutes');
//const router = express.Router({ mergeParams: true });

router.use('/:offerId/demandes', demandeRoutes)


router.route('/').get(offerController.getAllOffers).post(authController.protect, authController.checkCompany, offerController.createOffer);//
router.route('/:id').get(offerController.getOfferById)





module.exports = router