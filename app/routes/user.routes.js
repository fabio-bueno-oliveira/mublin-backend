module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Create a new User
  // app.post("/users", users.create);

  // Login user
  app.post("/login", users.loginUser)

  // Check active session
  app.get("/session", users.checkSession)

  // Fetch logged user info
  app.get("/userInfo", checkToken, users.getInfo);

  // Retrieve all User
  app.get("/users", users.findAll);
  app.get("/secure/users", checkToken, users.findAll);

  // Retrieve a single User with userId
  // app.get("/user/:userId", users.findOne);
  // app.get("/secure/user/:userId", checkToken, users.findOne);

  // Retrieve a single User with username
  app.get("/user/:username", checkToken, users.findOneByUsername);

  // Retrieve Users with keyword
  app.get("/users/search/:keyword", users.findManyKeyword);
  app.get("/secure/users/search/:keyword", checkToken, users.findManyKeyword);

  // Retrieve Users and Projects with keyword
  app.get("/search/:keyword", users.findByKeyword);
  app.get("/secure/search/:keyword", checkToken, users.findByKeyword);

  // User ID follow a User Profile ID
  app.get("/user/:userId/follow/:profileID", users.followProfile);
  app.get("/secure/user/:userId/follow/:profileID", checkToken, users.followProfile);

  // User ID follow a User Profile ID
  app.get("/user/:userId/unfollow/:profileID", users.unfollowProfile);
  app.get("/secure/user/:userId/unfollow/:profileID", checkToken, users.unfollowProfile);

  // User followers
  app.get("/user/:userId/followers", users.followers);
  app.get("/secure/user/:userId/followers", checkToken, users.followers);

  // User events
  app.get("/user/:userId/events", checkToken, users.events);

  // Check if username is available
  app.get("/check/username/:username", users.checkUsername)

  // Check if email is available
  app.get("/check/email/:email", users.checkEmail)

  // Update a User with userId
  // app.put("/users/:projectId", users.update);

  // Delete a User with userId
  //app.delete("/users/:userId", users.delete);

  // Delete all User
  //app.delete("/users", users.deleteAll);
};
