const {google} = require('googleapis');
const fs = require('fs')
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    process.env.GOOGLE_DRIVE_URL
);

oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_DRIVE_TOKEN });
const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
});

exports.upload = async (filename, mimetype, path) => {
    try{
        const response = await drive.files.create({
            requestBody: {
                name: filename , 
                mimeType: mimetype,
                parents:["1sjFPL9ekc_UzBpS3frCkhLhFcdMHU80m"]
            },
            media: {
                mimeType : mimetype,
                body: fs.createReadStream(path),
            },
        });  
        return `https://drive.google.com/uc?id=${response.data.id}`
    }catch (error) {
        console.log(error.message);
    }
}


exports.deleteFile = (fileId) => {
    drive.files.delete({
      'fileId': fileId
    });
};

