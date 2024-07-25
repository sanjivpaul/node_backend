// method 1: complex

const asyncHandler = (requestHandler) => {
  (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export {asyncHandler};

// method 2: easy

// const asyncHandler = () =>{}

// const asyncHandler = (func) => () => {}; // higher order dunction

// const asyncHandler = (func) => async ()=>{};

// final function
// const asyncHandler = (func) => async (req, res, next) => {
//   try {
//     await func(req, res, next);
//   } catch (err) {
//     res.status(err.code || 500).json({
//       success: false,
//       message: err.message,
//     });
//   }
// };
