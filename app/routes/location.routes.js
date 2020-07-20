module.exports = app => {
  const locations = require("../controllers/location.controller.js");

  // Retrieve cities by keyword
  app.get("/search/cities/:keyword", locations.findByKeyword);

};
