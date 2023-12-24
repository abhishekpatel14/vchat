const asyncHandler = require("express-async-handler");
require("dotenv").config();
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const transporter = require("../config/transporter");
const { otpGen } = require("otp-gen-agent");

async function otpGenerate(req, res) {
  const { email } = req.body;

  // Generate a new OTP code and send it via email
  global.oneTimePassword = await otpGen();
  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "LogIn OTP",
    text: `Your OTP code is ${oneTimePassword}.`,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(result);
    console.log("OTP sent: ", oneTimePassword);
    res.status(200).send({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending email: ", error);
    res.status(500).send({ message: "Failed to send OTP" });
  }
}

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic, otp } = req.body;

  if (otp === oneTimePassword && otp != 0) {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please Enter all the Fields");
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      pic,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        pic: user.pic,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error("Failed to create the user");
    }
  } else {
    res.status(401).send({ message: "Invalid OTP" });
  }
});

const updateUser = asyncHandler(async (req, res) => {
  const { name, pic, _id } = req.body;

  const user = await User.findOneAndUpdate({ _id }, { name, pic });
  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Unable to update profile");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

module.exports = { registerUser, authUser, allUsers, updateUser, otpGenerate };
