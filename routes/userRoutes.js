const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  updateUser,
  otpGenerate,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(registerUser)
  .get(protect, allUsers)
  .patch(protect, updateUser);
router.post("/login", authUser).post("/generateOTP", otpGenerate);

module.exports = router;
