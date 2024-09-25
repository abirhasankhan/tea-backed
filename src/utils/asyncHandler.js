/*method 01 using Promise */

const asyncHandler = (requestHandler) => {

    (req, res, next) => {

        Promise
        .resolve(requestHandler(req, res, next))
        .catch((error) => next(error));

    }

}


/*method 02 using try-catch */

// const asyncHandler = () => {}
// const asyncHandler = () => { () => {} }
// const asyncHandler = (fun) => () => {} there we remove {}
// const asyncHandler = (fun) =>  async () => {} // there we add async



// const asyncHandler = (fun) => async (req, res, next) => {

//     try {

//         await fun(req, res, next);

//     } catch (error) {

//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })

//     }
// }



export { asyncHandler }