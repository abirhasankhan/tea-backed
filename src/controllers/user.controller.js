import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    const { username, email, fullName, password } = req.body; // Corrected fullNamem to fullName

    // Checking if fields are empty or not, if empty then return true
    if (
        [username, email, fullName, password]
            .some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // Checking db, username or email exist or not
    const existedUser = await User.findOne({ // Corrected findone to findOne
        $or: [{ username }, { email }]
    });

    if ( existedUser ) {
        throw new ApiError(409, "User already exists with this username or email");
    }

    // Extract the local file path of the first uploaded file for the 'avater' field.
    // If the 'avater' field is not present or no file is uploaded, 'avaterLocalPath' will be 'undefined'.
    const avaterLocalPath = req.files?.avater?.[0]?.path;

    // Extract the local file path of the first uploaded file for the 'coverImage' field.
    // If the 'coverImage' field is not present or no file is uploaded, 'coverImageLocalPath' will be 'undefined'.
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;


    if ( !avaterLocalPath ) {

        throw new ApiError(409, "Avater file is required");
    }

    const avater = await uploadOnCloudinary(avaterLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if ( !avater ) {

        throw new ApiError(409, "Avater file upload failed");
    }

    // Create user in the database
    const user = await User.create({
        username,
        email,
        fullName,
        password,
        avater: avater.url,
        coverImage: coverImage?.url || "",
    });

    // Removing password & refreshToken from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully :)")
    );
});

export { registerUser };
