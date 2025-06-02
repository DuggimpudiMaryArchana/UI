const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set storage location and file naming logic
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize file name and add timestamp
        const fileName = file.originalname.toLowerCase().split(' ').join('-');
        const uniqueName = `${Date.now()}-${fileName}`;
        cb(null, uniqueName);
    }
});

// File filter to accept only certain file types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png/;
    const extname = path.extname(file.originalname).toLowerCase();
    const mimetype = file.mimetype;

    if (allowedTypes.test(extname) && allowedTypes.test(mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF, JPG, JPEG, or PNG files are allowed'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { 
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
