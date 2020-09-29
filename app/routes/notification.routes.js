module.exports = app => {
  const notifications = require("../controllers/notification.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve notifictions with userId
  // app.get("/notifications/:userId", notifications.findByUserId);

  // Update notification read with userId and feedId (authorization and read status needed on headers)
  // app.get("/notifications/:userId/:feedId", notifications.updateReadById);

  // Update notifications to read with userId (authorization and read status needed on headers)
  app.get("/notifications/:userId/read", notifications.updateAllReads);

  // Retrieve user feed
  app.get("/feed", checkToken, notifications.feed);

  // Like feed item
  app.post("/feed/:feedId/like", checkToken, notifications.feedLike);

  // Unlike feed item
  app.delete("/feed/:feedId/unlike", checkToken, notifications.feedUnlike);

  // Retrieve user notifications
  app.get("/notifications", checkToken, notifications.notifications);

  // Retrieve user recent notifications
  app.get("/notificationsUnseen", checkToken, notifications.notificationsUnseen);
};
