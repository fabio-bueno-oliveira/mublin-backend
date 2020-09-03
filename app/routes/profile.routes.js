module.exports = app => {
  const profile = require("../controllers/profile.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve profile info (by username)
  app.get("/profile/:username", checkToken, profile.infos);

  // Retrieve roles from profile (by username)
  app.get("/profile/:username/roles", checkToken, profile.roles);
};