module.exports = app => {
  const users = require("../controllers/user.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Create a new User
  app.post("/user/create", users.create);

  // Login user
  app.post("/login", users.loginUser);

  // Check active session
  app.get("/session", users.checkSession);

  // Forgot password
  app.post("/forgotPassword", users.forgotPassword);

  // Fetch logged user info
  app.get("/userInfo", checkToken, users.getInfo);
  app.get("/userInfo/:userId/genres", checkToken, users.getInfoGenres);
  app.get("/userInfo/:userId/roles", checkToken, users.getInfoRoles);
  app.get("/userInfo/:userId/availabilityItems", checkToken, users.getInfoAvailabilityItems);
  app.get("/userInfo/followers", checkToken, users.getFollowers);
  app.get("/userInfo/following", checkToken, users.getFollowing);
  app.get("/userInfo/plan", checkToken, users.getUserPlanInfo);

  // User´s partners infos
  app.get("/userInfo/partners", checkToken, users.getPartners);
  app.post("/user/add/partnership", checkToken, users.addUserPartnership);
  app.delete("/user/delete/partnership", checkToken, users.deleteUserPartnership);

  // Retrieve all User
  // app.get("/users", users.findAll);
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

  // Retrieve user events
  app.get("/user/:userId/events", checkToken, users.events);

  // Respond to event invitation
  app.put("/user/:userId/eventInvitationResponse", checkToken, users.eventInvitationResponse);

  // Check if username is available
  app.get("/check/username/:username", users.checkUsername)

  // Check if email is available
  app.get("/check/email/:email", users.checkEmail)

  // Activate account
  app.put("/activate", users.activate)

  // Update user picture with userId
  app.put("/user/:userId/picture", checkToken, users.updatePicture);

  // Update user cover picture with userId
  app.put("/user/:userId/coverPicture", checkToken, users.updateCoverPicture);

  // Update user picture with userId
  app.put("/user/:userId/firstAccess", checkToken, users.updateFirstAccess);

  // Update Step 2 fields (gender,bio,website,instagram,id_country_fk,id_region_fk,id_city_fk)
  app.put("/user/step2", checkToken, users.updateStep2);

  // Add logged user´s artistic music genre (start > step 3)
  app.post("/user/add/musicGenre", checkToken, users.addUsersMusicGenre);

  // Delete logged user´s artistic music genre (start > step 3)
  app.delete("/user/delete/musicGenre", checkToken, users.deleteUsersMusicGenre);

  // Add logged user´s artistic role (start > step 3)
  app.post("/user/add/role", checkToken, users.addUsersRole);

  // Delete logged user´s artistic role (start > step 3)
  app.delete("/user/delete/role", checkToken, users.deleteUsersRole);

  // Add logged user´s participation on a project
  app.post("/user/add/project", checkToken, users.addUsersProject);

  // Delete logged user´s participation on a project
  app.delete("/user/delete/project", checkToken, users.deleteUsersProject);

  // Update logged user´s preferences on a participation to a project
  app.put("/user/project/updatePreferencesInProject", checkToken, users.updatePreferencesinProject);
  
  // START NOTES ENDPOINTS

  // GET logged user notes
  app.get("/user/:userId/notes", checkToken, users.findNotes);

  // GET note by id
  app.get("/notes/:noteId", checkToken, users.findNoteById);

  // SETTINGS UPDATES

  // Update user profile basic information (settings/profile)
  app.put("/user/updateProfile", checkToken, users.updateBasicInfo);

  // Update user availability status (/settings/preferences)
  app.put("/user/updateAvailabilityStatus", checkToken, users.updateAvailabilityStatus);

  // Add availability item (/settings/preferences)
  app.post("/user/userAvailabilityItem", checkToken, users.addUserAvailabilityItem);

  // Delete availability item (/settings/preferences)
  app.delete("/user/userAvailabilityItem", checkToken, users.deleteUserAvailabilityItem);

  // Update user availability focus information (/settings/preferences)
  app.put("/user/updateAvailabilityFocus", checkToken, users.updateAvailabilityFocus);

  // Retrieve user gear (by logged userId)
  app.get("/user/:userId/gear", checkToken, users.gear);

  // Add user gear item (by logged userId)
  app.post("/user/addGearItem", checkToken, users.addGearItem);
  app.post("/user/addGearItemV2", checkToken, users.addGearItemFull);

  // Add user gear sub item (by logged userId)
  app.post("/user/addGearSubItem", checkToken, users.addGearSubItem);

  // Update user gear item
  app.put("/user/updateGearItem", checkToken, users.updateGearItem);

  // Delete user gear item (by logged userId and gearId)
  app.delete("/user/:userGearId/deleteGearItem", checkToken, users.deleteGearItem);

  // Retrieve user gear setups
  app.get("/userInfo/gearSetups", checkToken, users.getGearSetups);

  // Create new gear setup
  app.post("/user/createNewGearSetup", checkToken, users.createNewGearSetup);

  // Delete user gear setup (by logged userId and gearId)
  app.delete("/user/:gearSetupId/deleteGearSetup", checkToken, users.deleteGearSetup);

  // Upadate user gear setup
  app.put("/user/updateGearSetup", checkToken, users.updateGearSetup);
  
  // Upadate user gear setup image
  app.put("/user/updateGearSetupImage", checkToken, users.updateGearSetupImage);

  // Retrieve user gear setup item
  app.get("/userInfo/gearSetupItems/:setupId", checkToken, users.getGearSetupItems);

  // Add new item to gear setup
  app.post("/user/addItemToSetup", checkToken, users.addItemToSetup);

  // Update user gear setup item (comments, order)
  app.put("/userInfo/updateSetupGearItem", checkToken, users.updateSetupGearItem);

  // Delete user gear setup item
  app.delete("/user/deleteSetupGearItem", checkToken, users.deleteSetupGearItem);

  // Update/change user password (/settings)
  app.put("/userInfo/changePassword", checkToken, users.changePassword);

  // Update/change user password using hash (password recovery)
  app.put("/userInfo/changePasswordbyHash", users.changePasswordbyHash);

  // Update/change user email (/settings)
  app.put("/userInfo/changeEmail", checkToken, users.changeEmail);

  // Retrieve user X project details
  app.get("/user/:projectUsername/preferences", checkToken, users.getProjectPreferences);

  // Retrieve list of last connected friends
  app.get("/lastConnectedFriends", checkToken, users.getLastConnectedFriends);

  // New post
  app.post("/user/newPost", checkToken, users.newPost);

  // Delete post
  app.delete("/user/deletePost", checkToken, users.deletePost);

  // START ADMIN FUNCTIONS

  // Check if user can admin the project page
  app.get("/user/:projectUsername/admin", checkToken, users.checkProjectAdmin);

  // START ARCHIVED ENDPOINTS

  // Update a User with userId
  // app.put("/users/:projectId", users.update);

  // Delete a User with userId
  //app.delete("/users/:userId", users.delete);

  // Delete all User
  //app.delete("/users", users.deleteAll);
};
