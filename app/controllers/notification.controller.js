const Notification = require("../models/notification.model.js");

// Find all notifications from a user id
exports.findByUserId = (req, res) => {
  Notification.findNotificationsByUserId(req.params.userId, req.header('authorization'), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No notifications found for user id ${req.params.userId} using auth ${req.header('authorization')}`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving notifications with user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Update notification status
// exports.updateReadById = (req, res) => {
//   Notification.updateNotificationReadById(req.params.userId, req.params.feedId, req.header('read'), req.header('authorization'), (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `Notification not found for user id ${req.params.userId} + feed id ${req.params.feedId}, using auth ${req.header('authorization')}`
//         });
//       } else {
//         res.status(500).send({
//           message: "Error retrieving notification with user id " + req.params.userId + " and feed id " + req.params.feedId
//         });
//       }
//     } else res.send(data);
//   });
// };

// Update all user notifications status
exports.updateAllReads = (req, res) => {
  Notification.updateReads(req.params.userId, req.header('read'), req.header('authorization'), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Notification not found for user id ${req.params.userId} using auth ${req.header('authorization')}`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving notification with user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// get user feed
exports.feed = (req, res) => {
  Notification.feed(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed events for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed events for logged user."
        });
      }
    } else res.send(data);
  });
};

// like feed item
exports.feedLike = (req, res) => {
  Notification.feedLike(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item with this id."
        });
      } else {
        res.status(500).send({
          message: "Error liking feed item."
        });
      }
    } else res.send(data);
  });
};

// unlike feed item
exports.feedUnlike = (req, res) => {
  Notification.feedUnlike(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item"
        });
      } else {
        res.status(500).send({
          message: "Error unlinking feed item."
        });
      }
    } else res.send(data);
  });
};

// get user all notitications
exports.notifications = (req, res) => {
  Notification.notifications(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not notifications for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing notifications for logged user."
        });
      }
    } else res.send(data);
  });
};

// get user only recent notifications
exports.notificationsUnseen = (req, res) => {
  Notification.notificationsUnseen(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not unseen notifications for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing unseen notifications for logged user."
        });
      }
    } else res.send(data);
  });
};