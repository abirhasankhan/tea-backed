# A backend for learning in Node.js

# Tea-Backed

## Description
Tea-Backed is a backend application built with Node.js, designed for learning purposes. This project leverages modern JavaScript features, various libraries, and cloud-based services to create a functional backend structure.

## Features
- User authentication with JWT tokens
- File uploads using Cloudinary
- MongoDB integration for NoSQL database management
- Prettier for code formatting
- Error handling and response management
- Middleware support for enhanced request processing
- API versioning

## Table of Contents
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [License](#license)

## Technologies Used
- **Node.js**: Backend JavaScript runtime
- **Express**: Web application framework for Node.js
- **MongoDB**: NoSQL database for storing user data
- **Mongoose**: MongoDB object modeling tool
- **dotenv**: Module for loading environment variables
- **jsonwebtoken**: For generating and verifying JWT tokens
- **bcrypt**: Password hashing library
- **Cloudinary**: Image and video management in the cloud
- **Multer**: Middleware for handling file uploads
- **cookie-parser**: Middleware for parsing cookies
- **CORS**: Middleware for enabling CORS
- **Prettier**: Code formatter

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tea-backed.git
   cd tea-backed

2. Create an empty folder named `tea-backed`.

3. Initialize Node.js:
   ```bash
   npm init
   ```

4. Create a `.gitignore` file and add the following:
   ```plaintext
   /node_modules
   .env
   ```

5. Create a `.env` file to store your environment variables.

6. Set the project type to `module` in `package.json`:
   ```json
   {
     "type": "module",
     "description": "a backend for learning in Node.js"
   }
   ```

7. Install required packages:
   ```bash
   npm install mongoose express dotenv cookie-parser cors
   npm install --save-dev nodemon prettier
   npm install mongoose-aggregate-paginate-v2 bcrypt jsonwebtoken cloudinary multer
   ```

8. Create the following folder structure under `src`:
   - controllers
   - db
   - middlewares
   - models
   - routes
   - utils
## Folder Structure

```
tea-backed/
│
├── .gitignore                  # Specifies files and folders to ignore in Git
├── .env                        # Environment variables for the project
├── .prettierrc                 # Prettier configuration file
├── .prettierignore             # Files to ignore for Prettier
├── package.json                # Project metadata and dependencies
├── README.md                   # Project documentation
│
├── public/                     # Public directory for static files
│   └── temp/                   # Temporary folder for storing images
│
└── src/                        # Main source code directory
    │
    ├── controllers/            # Contains route handler functions
    │   └── user.controller.js   # Handles user-related requests
    │
    ├── db/                     # Database connection setup
    │   └── index.js            # Mongoose connection settings
    │
    ├── middlewares/            # Custom middleware functions
    │   ├── auth.middleware.js   # Authentication middleware
    │   └── multer.middleware.js  # Middleware for handling file uploads
    │
    ├── models/                 # Mongoose models for database schemas
    │   ├── subscription.model.js # Model for subscription data
    │   ├── user.model.js        # Model for user data
    │   └── video.model.js       # Model for video data
    │
    ├── routes/                 # API route definitions
    │   └── user.routes.js       # User-related routes
    │
    └── utils/                  # Utility functions and helpers
    |   ├── apiError.js         # Custom error handling class
    |   ├── apiResponse.js       # Helper for standardized API responses
    |   ├── asyncHandler.js       # Async error handling middleware
    |   └── cloudinary.js        # Configuration for Cloudinary file uploads
    ├── app.js                   # Main application setup and configuration
    ├── constants.js             # Constants used throughout the application
    └── index.js                 # Entry point for the application
```
  
## Environment Variables
In your `.env` file, add the following environment variables:
```plaintext
ACCESS_TOKEN_SECRET=your_generated_token
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_generated_token
REFRESH_TOKEN_EXPIRY=10d
```

## Usage
To start the development server, run:
```bash
npm run dev
```

### File Uploads
This project supports file uploads to Cloudinary using Multer. Ensure you have configured your Cloudinary account and added the necessary credentials to your `.env` file.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

## Learning Outcomes
- Understanding of environment variables with `.env` files
- Knowledge of MongoDB and Mongoose for database operations
- Implementation of JWT for user authentication
- File handling and uploading in a Node.js application
- Best practices for structuring a Node.js project
