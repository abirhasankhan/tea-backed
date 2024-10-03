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
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if ( !avatarLocalPath ) {

        throw new ApiError(409, "Avatar file is required");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if ( !avatar ) {

        throw new ApiError(409, "Avatar file upload failed");
    }

    
    // Create user in the database
    const user = await User.create({

        username,
        email,
        fullName,
        password,
        avatar: avatar.url,
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


const changePassword = asyncHandler(async (req, res) => {

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect = await user.isPasswordCorrect( oldPassword );

    if( !isPasswordCorrect ) {

        throw new ApiError(400, "Invalid password");
    }

    user.password = newPassword;
    await user.save( {validateBeforeSave: false} );

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully "));
});


const getCurrentUser = asyncHandler( async ( req, res ) => {

    return res.status(200)
        .json{ new ApiResponse(
            200, 
            req.user, 
            "Current user fetch successfully"
        ) };
});


const updateAccountDetails = asyncHandler( async ( req, res ) => {

    const ( fullName, email ) = req.body;

    if( !fullName || !email ) {

        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }

    ).select("-password ");

    return res.status(200)
        .json{ new ApiResponse(200, user, "Account Details updated successfully") };

});


const updateUserAvatar = asyncHandler( async ( req, res ) => {

    const avatarLocalPath = req.file?.path;

    if( !avatarLocalPath ){

        throw new ApiError(400, "Avatar file is missing");
    }

    // ToDO deleted old image - assignment

    const avatar = await uploadOnCloudinary( avatarLocalPath );

    if ( !avatar ) {

        throw new ApiError(400, "Error while uploading on avatar");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
        .json{
        new ApiResponse(200, user, "avatar image updated successfully")
    };

});

const updateUserCover = asyncHandler(async (req, res) => {

    const coverLocalPath = req.file?.path;

    if ( !coverLocalPath ) {

        throw new ApiError(400, "Cover file is missing");
    }

    const cover = await uploadOnCloudinary( coverLocalPath );

    if ( !cover ) {

        throw new ApiError(400, "Error while uploading on cover");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: cover.url
            }
        },
        { new: true }
    ).select("-password")

    return res.status(200)
        .json{
            new ApiResponse(200, user, "cover image updated successfully")
        };

});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCover
};
