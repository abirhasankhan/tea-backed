// require('dotenv').config({path: './env'});

import dotenv from "dotenv";

import mongoose from "mongoose";
import { DB_name } from "./constants.js";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./env",
});




connectDB()
.then( () => {


    app.on("error", (error) => {

        console.log("Error: ", error);
        throw error;

    })


    app.listen(process.env.PORT || 8000, () => {

        console.log(`Server is running on port: ${process.env.PORT || 8000}`);

    })
    
})
.catch((error) => {

    console.log("MongoDB connection failed !!! ", error);
    
})







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