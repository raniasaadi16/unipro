const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const app = express();
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');
const errorMiddleware = require('./utils/errors');
const cookieParser = require('cookie-parser');


dotenv.config({ path: './.env' });
mongoose.connect(process.env.MONGO_URL , 
    {useNewUrlParser: true, 
    useUnifiedTopology: true,
}).then(console.log('DB connected ....')).catch(err=> console.log(err));

app.use(express.json({limit: "30mb", extended: true}));
app.use(express.urlencoded({limit: "30mb", extended: true}));

app.use(cookieParser());


// ROUTES
app.use('/api/users', userRoutes );
app.use('/api/offers', offerRoutes );





//ERROR MIDDLEWARE
app.use( (err, req, res, next)=> {
    err.statusCode = err.statusCode || 500;
    res.status(err.statusCode).json({
        message: err.message
    })
    
    
    next();
});



const PORT = process.env.PORT || 5000
app.listen(PORT, (req,res)=>{
    console.log(`Backend running on port : ${PORT}.....`);
})