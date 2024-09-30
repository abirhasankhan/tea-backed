import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {

    try {

        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and refresh token");
    }
}

const registerUser = asyncHandler(async (req, res) => {
    
    // Get user details from frontend
    const { username, email, fullName, password } = req.body;

    // Check if fields are empty
    if ([username, email, fullName, password]
            .some((field) => field?.trim() === "")) {

                throw new ApiError(400, "All fields are required");
    }

    // Check if username or email already exists
    const existedUser = await User.findOne({

        $or: [{ username }, { email }]
    });

    if ( existedUser ) {
        throw new ApiError(409, "User already exists with this username or email");
    }

    // Handle file uploads for avatar and cover image
    const avaterLocalPath = req.files?.avater?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if ( !avaterLocalPath ) {

        throw new ApiError(409, "Avatar file is required");
    }


    const avater = await uploadOnCloudinary(avaterLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if ( !avater ) {

        throw new ApiError(409, "Avatar file upload failed");
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

    // Remove password & refreshToken from the response
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user!");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully :)")
    );
});

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body;

    if ( !username && !email ) {

        throw new ApiError(400, "Username or email is required");
    }

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")
        
    // }



    const findUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (!findUser) {
        throw new ApiError(404, "User does not exist...");
    }

    const isPasswordValid = await findUser.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(findUser._id);

    // Removing password & refreshToken from response
    const loggedInUser = await User.findById(findUser._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "User logged in successfully")
        );
});

const logoutUser = asyncHandler(async (req, res) => {

    // Remove refresh token from database
    await User.findByIdAndUpdate(
        req.user._id,
        { 
            $set: {
                refreshToken: undefined 
                } 
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
        expires: new Date(0) // Set cookie to expire immediately
    };

    return res.status(200)
        .cookie("accessToken", "", options)
        .cookie("refreshToken", "", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully")
        );
});

const refreshAccessToken = asyncHandler( async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if ( !incomingRefreshToken ) {

        throw new ApiError(401, "Unauthorized request");
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        );
    
        const user =awaitUser.findById(decodedToken?._id);
    
    
        if ( !user ) {
    
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if( incomingRefreshToken !== user?.refreshToken ) {
    
            throw new ApiError(401, "Refresh Token is expired");
        }
    
    
        const options = {
            httpOnly: true,
            secure: true
        };
    
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshToken(user._id);
    
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookies("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token refreshed successfully")
            );

    } catch (error) {

        throw new ApiError(401, error?.message || "Invalid Refresh Token");
    }


});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
};
