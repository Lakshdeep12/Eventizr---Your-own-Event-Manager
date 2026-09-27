const moongose = require("mongoose");

const otpSchema = new moongose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {    
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["account_verification", "event_booking"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 180, // OTP expires after 3 minutes
  }
});

module.exports = moongose.model("OTP", otpSchema);