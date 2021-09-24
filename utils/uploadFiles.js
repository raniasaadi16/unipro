const multer = require('multer'); 

const multerStorage = multer.diskStorage({
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `docs-${Math.random()}-${Date.now()}.${ext}`);
    }
});



const upload = multer({
  storage: multerStorage,
});

module.exports = upload.single('cv');