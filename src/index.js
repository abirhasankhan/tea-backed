// require('dotenv').config({path: './env'});

import dotenv from "dotenv";

import mongoose from "mongoose";
import { DB_name } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
});




connectDB();







// first approach to connect with mongodb using iife ;()()
/*
import express from "express";
const app = express();

;( async () => {

    try {

        await mongoose.connect(`${process.env.MONGO_URI}/${DB_name}`);

        app.on("error", (error) => {
            console.log("Error: ", error);
            throw error;
        })

        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port: ${process.env.PORT}`);
        })

    } catch (error) {

        console.log("Error: ", error);
        throw error;

    }

})()

*/