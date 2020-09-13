module.exports = app => {
  const search = require("../controllers/search.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve users with keyword
  app.get("/search/users/:keyword", checkToken, search.findUsersByKeyword);

  // Retrieve projects with keyword
  app.get("/search/projects/:keyword", checkToken, search.findProjectsByKeyword);
};
