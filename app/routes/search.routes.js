module.exports = app => {
  const search = require("../controllers/search.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve users with keyword
  app.get("/search/users/:keyword", checkToken, search.findUsersByKeyword);

    // -> Retrieve users projects from the users result
    app.get("/search/users/:userId/projects", checkToken, search.findUsersProjectsFromUserSearch);

  // Retrieve projects with keyword
  app.get("/search/projects/:keyword", checkToken, search.findProjectsByKeyword);
};
