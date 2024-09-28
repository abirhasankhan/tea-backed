import multer from "multer";
import fs from "fs";
import path from 'path';

// Define the storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp/") // Use the ensured directory
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // Get the original file extension
        const fileExtension = path.extname(file.originalname).toLowerCase();
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

// // Define the file filter function
// const fileFilter = (req, file, cb) => {
//     // Allowed file types
//     const allowedFormats = /jpeg|jpg|png|gif/;
//     const extname = allowedFormats.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = allowedFormats.test(file.mimetype);

//     if (mimetype && extname) {
//         return cb(null, true); // Accept the file
//     } else {
//         cb(new Error('Only images of format jpeg, jpg, png, and gif are allowed!'), false); // Reject the file
//     }
// };

export const upload = multer({ storage: storage })

// // Create the upload middleware with storage and file filter
// export const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: { fileSize: 1024 * 1024 * 5 } // Optional: Limit file size to 5MB
// });