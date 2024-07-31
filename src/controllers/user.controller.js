import {asyncHandler} from "../utils/ayncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";

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

export {registerUser};
