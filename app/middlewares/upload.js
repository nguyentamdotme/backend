import multer  from 'multer';

module.exports = multer({dest: './uploads/'}).any();
