const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError')
const { User, Student, Company } = require('../models/User')
const jwt = require('jsonwebtoken')
const sendEmail = require('../utils/sendEmail')
const { upload, deleteFile } = require('../utils/googleDrive');

//*******************PROTECT*****************/
exports.protect = catchAsync(async (req,res,next)=>{
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];   
    }else if(req.cookies.jwt) {
        token = req.cookies.jwt
    };

    // CHECK IF TOKEN EXIST
    if(!token) return next(new appError('you must loggin',401));
    // CHECK IF TOKEN IS CORRECT
    let decoded;
    jwt.verify(token, process.env.JWT_SECRET,(err,user)=>{
        if(err) return res.status(401).json('token not valid !')
        decoded = user
    });

    // CHECK IF USER STILL EXIST
    const user = await User.findById(decoded.id);
    if(!user) return next(new appError('user no longer exist , please login again', 404));
    
    // CHECK IF PASSWORD WAS CHANGED AFTER THE TOKEN WAS ISSUD
    if(user.passwordChangedAfter(decoded.iat)){
        return next(new appError('User recently changed password! please login again ',401));
    }
    
    req.user = user; 

    next();

});
//*****************CHECK STUDENT*********************/
exports.checkStudent = catchAsync(async (req, res, next) =>{
    const user = await User.findById(req.user.id);
    if(!user) return next(new appError('you must loggin',401));

    if(user.kind != 'Student') return next(new appError('you are not authorized to do that', 401))
    next()
})
//*****************CHECK COMPANY*********************/
exports.checkCompany = catchAsync(async (req, res, next) =>{
    const user = await User.findById(req.user.id);
    if(!user) return next(new appError('you must loggin',401));

    if(user.kind != 'Company') return next(new appError('you are not authorized to do that', 401))
    next()
})
//*******************ADMIN ACTION*****************/
exports.adminAction = (req,res,next) => {
    if(!req.user.isAdmin) return next(new appError('you are not authorizate to do that !',401));
    next();
};
//*******************SINGU (Student)*****************/
exports.signupStudent = catchAsync(async (req,res,next)=>{
    
    const { nom, email, password, passwordConfirm, tel, Bio, status,etablissement, niveau,domaine} = req.body;
    console.log(req.body)
    let picture;
    let cv;
    if(req.file && req.file.fieldname === 'picture'){
        picture = await upload(req.file.filename, req.file.mimetype, req.file.path);
    }
    if(req.file && req.file.fieldname === 'cv'){
        cv = await upload(req.file.filename, req.file.mimetype, req.file.path);
    }
    

    const newUser = await Student.create({ nom, email, password, passwordConfirm, tel, Bio, cv, status,etablissement, niveau,domaine,picture});
    try{
        // GENERATE EMAIL TOKEN FOR ACTIVATE ACCOUNT
        const emailToken = newUser.generateRandomEmailToken();
        // SENDING EMAIL
        const resetURL = `${req.protocol}://${req.get('host')}/api/users/activateAccount/${emailToken}`;
        // sendEmail(newUser.email,'activate your account',message);
        await new sendEmail(newUser,resetURL).sendWelcome();
        await newUser.save({ validateBeforeSave: false });

       
    }catch(err){
        console.log(err)
        return next(new appError('There was an error sending the email, try again',500))
    }
    
    res.status(201).json({
        status: 'success',
        message:'token sent to email',
        data: {
            newUser
        }
    })
});


//*******************SINGUP (COMPANY)*****************/
exports.signupCompany = catchAsync(async (req,res,next)=>{
    const { nom, email, password, passwordConfirm, tel, Bio, lieu, taille,domaine} = req.body;
    let picture;
    if(req.file && req.file.fieldname === 'picture'){
        picture = await upload(req.file.filename, req.file.mimetype, req.file.path);
    }
    const newUser = await Company.create({ nom, email, password, passwordConfirm, tel, Bio, lieu, taille,domaine, picture});
    
    try{
        // GENERATE EMAIL TOKEN FOR ACTIVATE ACCOUNT
        const emailToken = newUser.generateRandomEmailToken();
        // SENDING EMAIL
        const resetURL = `${req.protocol}://${req.get('host')}/api/users/activateAccount/${emailToken}`;
        // sendEmail(newUser.email,'activate your account',message);
        await new sendEmail(newUser,resetURL).sendWelcome();
        await newUser.save({ validateBeforeSave: false });

       
    }catch(err){
        console.log(err)
        return next(new appError('There was an error sending the email, try again',500))
    }
    
    res.status(201).json({
        status: 'success',
        message:'token sent to email',
        data: {
            newUser
        }
    })
});

//*******************LOGIN*****************/
exports.login = catchAsync(async (req,res,next)=>{
    const {email, password} = req.body;
    if(!email || !password) return next(new appError('you must enter all fields', 400));

    const user = await User.findOne({email}).select('+password');
    // CHECK IF USER EXIST
    if(!user || !await user.checkPassword(user.password, password)) return next(new appError('email or password wrong', 400));
    // CHECK IF USER IS ACTIVATED
    if(!user.active) return next(new appError('you must active your account first', 400));

    // LOGIN THE USER WITH NEW TOKEN
    const token = jwt.sign({id: user.id}, process.env.JWT_SECRET);
    const cookieOption = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN*24*60*60*1000),
        httpOnly: true,
        //secure : true
    };
    if(process.env.NODE_ENV === 'production') cookieOption.secure = true;

    res.cookie('jwt', token, cookieOption);

    res.status(200).json({
        status: 'success',
        data: {
            user,
        }
    })

});
//*******************ACTIVATE ACCOUNT*****************/
exports.activateAccount = catchAsync(async (req,res,next)=>{

    const user = await User.findOne({activeToken: req.params.activeToken, activeTokenExpire: {$gt: Date.now()}});
    // CHECK IF USER EXIST
    if(!user) return next(new appError('the token is invalid or expired',400));
    // CHECK IF USER IS ACTIVATED
    if(user.active) return next(new appError('your account is active, please try to login!',400));

    // ACTIVATE THE USER ACCOUNT
    user.active = true;
    user.activeToken = undefined;
    user.activeTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    

    res.status(200).json({
        status: 'success',
        message: 'your account is active! you can login now',       
    })
});
//*******************LOGOUT*****************/
exports.logout = catchAsync(async (req,res,next)=>{
    const cookieOption = {
        expires: new Date(Date.now() + 10*1000),
        httpOnly: true,
        //secure : true
    };
    if(process.env.NODE_ENV === 'production') cookieOption.secure = true;
    res.cookie('jwt', 'logout', cookieOption);
    res.status(200).json({status: 'success'})
})
//*******************GET ME*****************/
exports.getMe = catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: 'success',
        data: user
    })
});