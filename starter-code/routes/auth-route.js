const authRoute = require("express").Router();

authRoute.use((req, res, next) => {
  if (req.session.currentUser) {
    next();
  } else {
    res.redirect("/login");
  }
});


authRoute.get("/", (req, res, next) => {
  req.session.currentUser = currentUser;  
  res.render("user-views/index", {
    currentUser
  });
});

module.exports = authRoute;