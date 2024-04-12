const { User } = require("../models/userSchema");

module.exports.userSessionCheck = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect("/home");
    } else {
      next();
    }
  } catch (error) {
    console.log(error.message);
  }
};


module.exports.adminsessionLogin = async (req, res, next) => {
  try {
    console.log("adminsessionLogin middleware");

    if (req.session.admin_id === null) {
      // Check if the user is not already on the login page
      console.log("Redirecting to /admin");
      res.redirect("/admin");
    } else {
      console.log("adminId:", req.session.admin_id);
      return next();
    }
  } catch (error) {
    console.log(error.message);
  }
};



module.exports.blockChecker = async (req, res, next) => {
  try {
    const id = req.session.user._id;
    console.log(id);
    const user = await User.findOne({ _id: id });

    if (user.blocked === true) {
      res.render("user/blocked");
    } else {
      next();
    }

    // res.json("hrtyyy")
  } catch (error) {
    console.log(error.message);
  }
};
// <---------------------------| RENDERING BLOCK USER PAGE -----------------------------------------|>
module.exports.blockedUser = (req, res) => {
  try {
    res.render("user/blockPage");
  } catch (error) {
    console.log("Try catch error in loginCheckUser 🤷‍♀️📀🤷‍♂️");
    console.log(error.message);
  }
};
