module.exports = app => {
  const notifications = require("../controllers/notification.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve notifictions with userId
  // app.get("/notifications/:userId", notifications.findByUserId);

  // Update notification read with userId and feedId (authorization and read status needed on headers)
  // app.get("/notifications/:userId/:feedId", notifications.updateReadById);

  // Update notifications to read with userId (authorization and read status needed on headers)
  app.put("/notifications/:userId/read", checkToken, notifications.updateAllReads);

  // Retrieve feed
  app.get("/feed", checkToken, notifications.feed);

  // Retrieve simple feed (only users posts)
  app.get("/simpleFeed", checkToken, notifications.simpleFeed);

  // New Post
  app.post("/feed/newPost", checkToken, notifications.newPost);

  // Delete feed item
  app.delete("/feed/:feedId/deleteFeedItem", checkToken, notifications.deleteFeedItem);

  // Retrieve feed item likes
  app.get("/:feedId/feedLikes", checkToken, notifications.getFeedLikes);

  // Post new gear added to feed
  app.post("/feed/newFeedPostGear", checkToken, notifications.feedPostNewGear);

  // Like feed item
  app.post("/feed/:feedId/like", checkToken, notifications.feedLike);

  // Unlike feed item
  app.delete("/feed/:feedId/unlike", checkToken, notifications.feedUnlike);

  // Retrieve user notifications
  app.get("/notifications", checkToken, notifications.notifications);

  // Retrieve user recent notifications
  app.get("/notificationsUnseen", checkToken, notifications.notificationsUnseen);

  // START send notifications

  // Send notification 
  app.post("/notifications/sendNotification", checkToken, notifications.sendNotification);
};
