const express = require('express');
const demandeController = require('../controllers/demandeController');
const authController = require('../controllers/authController');
const router = express.Router({ mergeParams: true });

router.route('/').get(authController.protect,authController.checkCompany, demandeController.getAllDemandes).post(authController.protect, authController.checkStudent, demandeController.createDemande)

module.exports = router