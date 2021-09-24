const catchAsync = require('./../utils/catchAsync');
const appError = require('./../utils/appError')
const { User, Student, Company } = require('../models/User')

exports.getStudents = catchAsync(async (req, res, next)=> {
    const students = await Student.find({active: true})

    res.status(200).json({
        status: 'success',
        students
    })
})

exports.getCompanies = catchAsync(async (req, res, next)=> {
    const companies = await Company.find({active: true})

    res.status(200).json({
        status: 'success',
        companies
    })
})

exports.getCompanyById = catchAsync(async (req, res, next)=> {
    const company = await Company.findOne({id:req.params.companyId,active: true})
    if(!company) return next(new appError('invalid id', 404))
    res.status(200).json({
        status: 'success',
        company
    })
})

