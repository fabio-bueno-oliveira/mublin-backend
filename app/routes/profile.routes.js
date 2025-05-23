module.exports = app => {
  const profile = require("../controllers/profile.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Change password for userId (admin)
  app.put("/profile/changePassword", checkToken, profile.changePassword);

  // Retrieve profile info (by username)
  app.get("/profile/:username", profile.infos);

  // Retrieve projects from profile (by username)
  app.get("/profile/:username/projects", profile.projects);

  // Retrieve roles from profile (by username)
  app.get("/profile/:username/roles", profile.roles);

  // Retrieve roles from profile (by username)
  app.get("/profile/:username/genres", profile.genres);

  // Retrieve followers from profile (by username)
  app.get("/profile/:username/followers", profile.followers);

  // Retrieve following from profile (by username)
  app.get("/profile/:username/following", profile.following);

  // Retrieve inspired from profile (by username)
  app.get("/profile/:username/inspired", profile.inspired);

  // Follow profile (by profileId)
  app.post("/profile/:profileId/follow", checkToken, profile.follow);

  // Unfollow profile (by profileId)
  app.delete("/profile/:profileId/follow", checkToken, profile.unfollow);

  // Check if logged user follows the profile
  app.get("/profile/:username/checkFollow", checkToken, profile.checkFollow);

  // Update followed inspiration status
  app.put("/profile/:username/updateInspiration", checkToken, profile.updateInspiration);

  // Retrieve profile posts (by username)
  app.get("/profile/:username/posts", checkToken, profile.posts);

  // Retrieve profile strengths grouped by percentage (by username)
  app.get("/profile/:username/strengths", checkToken, profile.strengths);

  // Retrieve profile strengths grouped by total votes (by username)
  app.get("/profile/:username/strengthsTotalVotes", checkToken, profile.strengthsByTotalVotes);

  // Retrieve profile list of recent other users strengths votes (by username)
  app.get("/profile/:username/strengthsRecentVotes", checkToken, profile.strengthsRecentVotes);

  // Retrieve profile strengths raw list (by username)
  app.get("/profile/:username/strengthsRaw", checkToken, profile.strengthsRaw);

  // Vote for profile strength (by voteId)
  app.post("/profile/voteStrength", checkToken, profile.voteStrength);

  // Delete my vote for profile strength (by voteId)
  app.delete("/profile/:voteId/unvoteStrength", checkToken, profile.unvoteStrength);

  // Retrieve profile gear (by username)
  app.get("/profile/:username/gear", profile.gear);

  // Retrieve profile gear (by username)
  app.get("/profile/:username/gearItem/:itemId", checkToken, profile.gearItem);

  // Retrieve profile gear subitems (by username and parent item id)
  app.get("/profile/:username/gearSubItems/:parentId", checkToken, profile.gearSubItems);
  
  // Retrieve profile gear setups (by username)
  app.get("/profile/:username/gearSetups", checkToken, profile.gearSetups);

  // Retrieve profile gear setup info
  app.get("/profile/:username/gearSetup/:setupId", checkToken, profile.gearSetup);

  // Retrieve profile gear setup products (by username)
  app.get("/profile/:username/:setupId/gearSetupProducts", checkToken, profile.gearSetupProducts);

  // Retrieve profile availabiity items (by username)
  app.get("/profile/:username/availabilityItems", checkToken, profile.availabilityItems);

  // Retrieve profile testimonials (by username)
  app.get("/profile/:username/testimonials", checkToken, profile.testimonials);

  // Submit testimonial to profile (by username)
  app.post("/profile/:username/newTestimonial", checkToken, profile.newTestimonial);

  // Update my testimonial on user profile (by username)
  app.put("/profile/:username/updateTestimonial", checkToken, profile.updateTestimonial);

  // Update my testimonial on user profile (by username)
  app.delete("/profile/:username/deleteTestimonial", checkToken, profile.deleteTestimonial);

  // Retrieve profile partners
  app.get("/profile/:username/partners", checkToken, profile.partners);

  // Retrieve other users related to the profile user
  app.get("/profile/:username/relatedUsers", checkToken, profile.relatedUsers);
};