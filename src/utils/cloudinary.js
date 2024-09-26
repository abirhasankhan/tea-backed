import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // file system in node.js


// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const uplaodOnCloudinary = async (localFilePath) => {

    try {

        if (!localFilePath) {

            return null;
        }

        // upload the file on cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {

            resource_type: "auto"
        })

        // File has been uploaded successfull
        console.log("File is uploaded on cloudinary", uploadResult.url);

        return uploadResult;

    } catch (error) {

        // remove the locally saved temp file as the upload operation got failed
        fs.unlinkSync(localFilePath);

        return null;
    }
}


/*
(async function () {


    // Upload an image
    const uploadResult = await cloudinary.uploader
        .upload(
            'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
            public_id: 'shoes',
        }
        )
        .catch((error) => {
            console.log(error);
        });

    console.log(uploadResult);

    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.url('shoes', {
        fetch_format: 'auto',
        quality: 'auto'
    });

    console.log(optimizeUrl);

    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });

    console.log(autoCropUrl);
})();

*/