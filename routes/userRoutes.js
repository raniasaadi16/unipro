const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const offerRoutes = require('../routes/offerRoutes');
const router = express.Router();
const uploadPictures = require('../utils/uploadPictures');
const uploadFiles = require('../utils/uploadFiles');

//app.use('/:company/offers', offerRoutes)

router.route('/students').get(userController.getStudents)
router.route('/companies').get(userController.getCompanies)
router.route('/companies/:companyId').get(userController.getCompanyById)



router.route('/students/signup').post(uploadFiles,uploadPictures, authController.signupStudent);//
router.route('/company/signup').post(uploadPictures, authController.signupCompany);//

router.post('/login', authController.login); 
router.get('/logout', authController.logout);
router.get('/getMe',authController.protect, authController.getMe);

router.get('/activateAccount/:activeToken', authController.activateAccount);//





module.exports = router