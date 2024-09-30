import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        // Debugging logs to check if tokens are being passed correctly
        // console.log("Cookies: ", req.cookies);
        // console.log("Authorization Header: ", req.headers["authorization"]);

        // Retrieving token from either cookies or Authorization header
        const token = req.cookies?.accessToken || req.headers["authorization"]?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        // Verifying the token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        // Fetching the user, excluding sensitive information
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        // Attaching user information to the request
        req.user = user;
        next();
    } catch (error) {
        // Return appropriate error message if JWT verification fails
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});
