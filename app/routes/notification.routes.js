module.exports = app => {
  const notifications = require("../controllers/notification.controller.js");

  // Retrieve notifictions with userId
  app.get("/notifications/:userId", notifications.findByUserId);

  // Update notification read with userId and feedId (authorization and read status needed on headers)
  // app.get("/notifications/:userId/:feedId", notifications.updateReadById);

  // Update notifications to read with userId (authorization and read status needed on headers)
  app.get("/notifications/:userId/read", notifications.updateAllReads);
};
