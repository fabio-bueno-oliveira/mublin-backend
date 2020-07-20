const jwt = require("jsonwebtoken");
module.exports = {
  checkToken: (req, res, next) => {
    let token = req.get("authorization");
    if (token) {
      // Remove Bearer from string
      token = token.slice(7);
      jwt.verify(token, "mb2020HIT", (err, decoded) => {
        if (err) {
          // return res.json({
          //   success: 0,
          //   message: "Invalid Token..."
          // });
          return res.status(401).send({
            message: 'Invalid Token!'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.json({
        success: 0,
        message: "Access Denied! Unauthorized User"
      });
    }
  }
};
