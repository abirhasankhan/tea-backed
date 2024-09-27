import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import { uplaodOnCloudinary } from "../utils/cloudinary.js"

const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avter
    // upload them to cloudinary, avater
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation 
    // return response

    // if data come from form or json
    const { username, email, fullNamem, password} = req.body;
    console.log("username: ", username, " password: ", password );

    // checking is fields empty or not, if empty then return true
    if (
        [username, email, fullName, password]
        .some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    
    // checking db, username or email exist or not
    const existedUser = User.findone({
        $or: [{ username }, { email }]
    })

    if ( existedUser ) {
        throw new ApiError(409, "User already exist with this username or email");
    }
    
    const avterLocalPath = req.files?.avater[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if ( !avterLocalPath ) {
        throw new ApiError(409, "Avater file is required");
    }

    const avater = await uplaodOnCloudinary(avterLocalPath);
    const coverImage = await uplaodOnCloudinary(coverImageLocalPath);

    if ( !avater ) {
        throw new ApiError(409, "Avater file is required");
    }

    // create user to db
    const user = await User.create({
        username,
        email,
        fullNamem,
        password,
        avater: avater.url,
        coverImage: coverImage?.url || "",
    });

    // removing password & refreshToken from field
    const createdUser = await User.findById(user._id).select("-password -refreshToken"
    );

    if ( !createdUser ) {
        throw new ApiError(500, "Somthing went while registering the user!");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully :)")
    );


} );


export { registerUser }