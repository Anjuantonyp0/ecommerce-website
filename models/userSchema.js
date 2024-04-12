const mongoose = require("mongoose");
const schema = mongoose.Schema;

const userSchema = new schema({
  profilePic: {
    type: String, // URL of the profile picture
    default: "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-chat/ava3.webp",
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: [{
    type: schema.Types.ObjectId,
    ref: 'Address',
  }],
  password: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },

  blocked: {
    type: Boolean,
    default: false,
  },
  verify: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
});

module.exports.User = mongoose.model("User", userSchema);
