import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async(userId) => {

    try {

        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save( {validateBeforeSave: false} );

        return {accessToken, refreshToken};

    } catch (error) {
        
        throw new ApiError(500, "Something went wrong while generating Access and refresh token");
    }
}


const registerUser = asyncHandler( async (req, res) => {
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


const loginUser = asyncHandler( async (req, res) => {

    // req body -> data
    // username or email
    // find the user
    // password check
    // access and refresh token
    // send cookie


    const { email, username, password} = req.body;

    if ( !username || !email ) {

        throw new ApiError(400, "username or email is required");
    }

    const findUser = await User.findOne({

        $or: [{username}, {email}]
    });

    if ( !findUser ) {

        throw new ApiError (404, "User dose not exist...");
    }

    const isPasswordValid await findUser.isPasswordCorrect( password );

    if ( !isPasswordValid ) {

        throw new ApiError(401, "Invalid user credentials");
    }

    const {accessToken, refreshToken} =  await generateAccessAndRefreshToken(findUser._id)

    // send cookie
    const loggedInUser = await User.findById(findUser._id)
        .select("-password -refreshToken");

    const options = {

        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json{

            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully")
        }
});


const logoutUser = asyncHandler( async(req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )


    const options = {

        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", options)
        .cookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        )
});




export { 
    registerUser,
    loginUser,
    logoutUser
};
