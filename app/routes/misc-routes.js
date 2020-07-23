module.exports = app => {
  const misc = require("../controllers/misc.controller.js");

  // Retrieve cities by keyword
  app.get("/imagekit", misc.imagekit);

};