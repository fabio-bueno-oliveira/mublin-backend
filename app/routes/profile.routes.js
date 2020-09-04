module.exports = app => {
  const profile = require("../controllers/profile.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve profile info (by username)
  app.get("/profile/:username", checkToken, profile.infos);

  // Retrieve roles from profile (by username)
  app.get("/profile/:username/roles", checkToken, profile.roles);

  // Retrieve followers from profile (by username)
  app.get("/profile/:username/followers", checkToken, profile.followers);

  // Retrieve following from profile (by username)
  app.get("/profile/:username/following", checkToken, profile.following);

  // Follow profile (by profileId)
  app.post("/profile/:profileId/follow", checkToken, profile.follow);

  // Unfollow profile (by profileId)
  app.delete("/profile/:profileId/follow", checkToken, profile.unfollow);

  // Check if logged user follows the profile
  app.get("/profile/:username/checkFollow", checkToken, profile.checkFollow);
};