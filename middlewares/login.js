const isLoginAdmin = (req, res, next) => {
  try {
    if (req.session && req.session.admin_id) {
      return next();
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Internal Server Error");
  }
};
