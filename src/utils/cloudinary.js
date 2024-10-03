import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'; // file system in node.js
import path from 'path'; // For file path handling



// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// function upload to cloudinary
const uploadOnCloudinary = async (localFilePath) => {

    try {

        // Check if the local file path is provided
        if ( !localFilePath ) {

            return null;
        }

        // upload the file on cloudinary
        const uploadResult = await cloudinary.uploader.upload(localFilePath, {

            resource_type: "auto"
        })

        // File has been uploaded successfull
        // console.log("File is uploaded on cloudinary", uploadResult.url);

        // Successfully uploaded the file to Cloudinary
        if (fs.existsSync(localFilePath)) {
            
            fs.unlinkSync(localFilePath); // Delete the local file to free up space
        }

        // Return the result from Cloudinary, which includes details like URL, public ID, etc.
        return uploadResult;

    } catch (error) {

        // Log any errors that occur during the upload process
        // console.error("Error uploading to Cloudinary:", error.message);

        // Remove the locally saved temp file as the upload operation failed
        if (fs.existsSync(localFilePath)) {

            fs.unlinkSync(localFilePath); // Delete the local file
        }


        // return { error: "Failed to upload the file." };
        return null;
    }
}

const deleteCloudinaryImage = async (imageUrl) => {
    try {
        // Extract the public_id from the image URL
        const publicId = imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Error while deleting Cloudinary image:", error.message);
    }
};

export { uploadOnCloudinary }



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