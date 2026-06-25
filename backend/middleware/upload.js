const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
console.log('Multer storage configured with destination "uploads/" and unique filename generation');

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    console.log('Accepted file type for user:', req.user.email, 'File:', file.originalname);
    cb(null, true);
  } else {
    console.log('Rejected file type for user:', req.user.email, 'File:', file.originalname);
    cb(new Error('Only PDF files allowed'), false);
  }
};

console.log('Multer file filter configured to accept only PDF files');
module.exports = multer({ storage, fileFilter });