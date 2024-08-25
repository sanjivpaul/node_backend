import {asyncHandler} from "../utils/ayncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken(); //method from user schema
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});

    return {accessToken, refreshToken};
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //   res.status(200).json({
  //     message: "ok",
  //   });

  // step 1: get the username and pass from user

  // step 2: validation-not empty

  // step 3: check if user is already exist using email, username

  // step 4: check for images, check for avatar

  // step 5: upload them to cludinary, avatar

  // step 6: creat user object

  // step 7: remove password and refresh token from response

  // step 8: save user to db

  // step 9: handle exception

  const {username, email, fullName, password} = req.body;
  console.log("email:", email);

  //   validation first method
  //   if (fullName === "") {
  //     throw new ApiError(400, "fullname is required");
  //   }
  //   if (username === "") {
  //     throw new ApiError(400, "username is required");
  //   }
  //   if (email === "") {
  //     throw new ApiError(400, "email is required");
  //   }
  //   if (password === "") {
  //     throw new ApiError(400, "password is required");
  //   }

  //   validation second method
  if (
    [fullName, email, password, username].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check user exist or not
  const existedUser = await User.findOne({
    // it will check username and email
    $or: [{username}, {email}],
  });

  if (existedUser) {
    throw new ApiError(409, "User with username and email already exist");
  }

  console.log("files===", req.files);

  // multer provides access of file
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //   here handle cover image if not send
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    // we pass here what field we dont want to print in reponse using minus in a string
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get username and password from user
  // verify user
  // find the user
  // password check
  // generate access and refresh token
  // send cookie

  //   get username email and password from user
  const {username, email, password} = req.body;

  //   check username and email not empty
  if (!username && !email) {
    throw new ApiError(400, "username and email is required");
  }

  //   check user in database
  const user = await User.findOne({
    $or: [{username}, {email}],
  });

  //   if user not exist in database then show error
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  //   check user password with middleware isPasswordCorrect
  const isPasswordValid = await user.isPasswordCorrect(password);

  //   if password is not match then show a error
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //   generate access and refresh token
  const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(
    user._id
  );

  //   dont show password and refreshtoken in response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshtoken"
  );

  //   send cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  //   send response
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // remove refresh token and access token
  //   const user = req.user._id

  //   clean refresh token
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});

// in this function we match refresh token
// send expire refresh token to db is its mathch with db refresh token then
// send one more fresh refresh token to the user
// it is also called session
const refreshAccessToken = asyncHandler(async (req, res) => {
  // get refresh token from user cookes
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // if not refresh token then unauthorised
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }

  //   using try catch to handle decode password

  try {
    //   decode incoming refresh token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    //   find user from database
    const user = await User.findById(decodedToken?._id);

    //   if user is not exist then show invalid refresh token
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    //   match incoming refreshToken with existing refreshToken
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }

    //   if match then generate new refreshToken

    // first send in cookies
    const options = {
      httpOnly: true,
      secure: true,
    };

    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(
      user._id
    );

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {accessToken, refreshToken: newRefreshToken},
          "Access token refreshed!"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.messsage || "Invalid refresh token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const {oldPassword, newPassword} = req.body;

  // find user
  const user = await User.findById(req.user?._id);

  // chceck password in model we have a method isPasswordCorrect
  const isPasswordCorrect = await user.isPasswordCorrect(oldPassword); // return boolean

  if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed Succcessfully"));
});

// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const getUserDetails = asyncHandler(async (req, res) => {
//   const {username, password, accessToken} = req.body;

const {username} = req.query;

console.log("username===", username);

console.log("query===", req.query);

  if (!username ) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findOne({
    $or: [{username}],
  });

  console.log("user===", user);

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

//   const isPasswordValid = await user.isPasswordCorrect(password);

//   if (!isPasswordValid) {
//     throw new ApiError(401, "Invalid user credentials");
//   }

  const userDetails = await User.findById(user._id).select("-password");

  console.log("userDetails===", userDetails);

  return res
    .status(200)
    .json(new ApiResponse(200, userDetails, "User fetch successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const {fullName, email} = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  //   console.log("user id===", req.user?._id);

  //   console.log("req===", req);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    {new: true}
  ).select("-password");

  //   console.log("user===", user);

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  // user must be login
  // get req.file using multer middleware
  // we need single file here so we used file if we want to user multiple file here then we have to use files as an array fields

  const avatarLocalPath = req.file?.path;

  //   if file is not exist
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(400, "Error while uploading on avatar");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {new: true}
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Avatar update successfully"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, "Cover image is missing");
  }

  //   upload file on cloudinary using cloudinary middleware
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //   coverImage is object which return by cloudinary
  if (!coverImage.url) {
    throw new ApiError(400, "Error while uploading a cover image");
  }

  //   if you get the url then upload it to db
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {coverImage: coverImage.url},
    },
    {new: true}
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Cover Image updated Successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserDetails,
};
