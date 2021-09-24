const nodemailer = require("nodemailer");
const htmlToText = require('html-to-text');
const hbs = require('nodemailer-handlebars');

module.exports = class Email{
    constructor(user, url){
        this.to = user.email,
        this.firstName = user.firstName,
        this.url = url,
        this.from = '"Mee 👻" <apikey>'
    }

    // SETUP THE TRANSPORTER BASED ON THE NODE ENVIRONMENT
    newTransport() {
        let transporter
        if (process.env.NODE_ENV === 'production'){
            // sedngrid
        }
        transporter = nodemailer.createTransport({
            host: "smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "049cced25f46a2",
                pass: "b16fb9bec66b17"
            },
            tls:{
                rejectUnauthorized:false
            }
        });
        transporter.use('compile', hbs({
            viewEngine: {
                extname: '.handlebars',
                layoutsDir: `${__dirname}/views/`, 
                partialsDir: `${__dirname}/views/`,
                defaultLayout : '',       
            },
            viewPath: `${__dirname}/views/`
        }));
        return transporter
    }

    // SEND EMAIL FUNCTION 
    async send(template, subject) {
        
        //1 Email options
        let info = {
            from: this.from, 
            to: this.to, 
            subject: subject, 
            text: htmlToText.fromString(template), 
            //text: 'hello',
            template,
            context: {
                firstName: this.firstName,
                url : this.url,
                subject
            }
        
        };
        //2 Create a transport and send email
        await this.newTransport().sendMail(info);
    }

    // SEND WELCOME
    async sendWelcome() {
        await this.send('welcome', 'Welcome to the our web app!');
    }
    // SEND RESET PASSWORD
    async sendPasswordReset() {
        await this.send(
          'passwordReset',
          'Your password reset token (valid for only 10 minutes)'
        );
    }
    // SEND RESET PASSWORD
    async sedConfirmNewEmail() {
        await this.send(
          'confirmNewEmail',
          'Your confirm email token'
        );
    }
}


