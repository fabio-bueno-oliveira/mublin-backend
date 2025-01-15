module.exports = app => {
  const search = require("../controllers/search.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve users with search keyword
  app.get("/search/users/:keyword", checkToken, search.findUsersByKeyword);

  // -> Retrieve users projects from the users result
  app.get("/search/users/:userId/projects", checkToken, search.findUsersProjectsFromUserSearch);

  // Retrieve projects with search keyword
  app.get("/search/projects/:keyword", checkToken, search.findProjectsByKeyword);

  // Retrieve gear equipments with search keyword
  app.get("/search/gear/:keyword", checkToken, search.findGearByKeyword);

  // Save user search query
  app.post("/search/saveSearch", checkToken, search.saveSearch);

  // Retrieve user last searches
  app.get("/search/queries/userLastSearches", checkToken, search.getUserLastSearches);

  // Retrieve suggested users for explore
  app.get("/search/explore/suggestedUsers", checkToken, search.findUsersBySuggestion);

  // Retrieve random featured users
  app.get("/search/explore/featuredUsers", checkToken, search.getRandomFeaturedUsers);

  // Retrieve random featured projects
  app.get("/search/explore/featuredProjects", checkToken, search.getRandomFeaturedProjects);

  // Retrieve new recent signed users
  app.get("/search/explore/newUsers", checkToken, search.getNewRecentUsers);

  // Retrieve home featured users
  app.get("/home/featuredUsers", search.getHomeFeaturedUsers);
};
