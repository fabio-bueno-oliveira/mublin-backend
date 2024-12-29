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
  Notification.updateReads(req.headers.authorization, req.params.userId, (err, data) => {
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

// get simple feed (only users posts)
exports.simpleFeed = (req, res) => {
  Notification.simpleFeed(req.headers.authorization, (err, data) => {
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

// new post
exports.newPost = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save post in database
  Notification.newPost(req.headers.authorization, req.body.id_item_fk, req.body.related_item_type, req.body.id_feed_type_fk, req.body.extra_text, req.body.video_url, req.body.image, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting to feed."
      });
    else res.send(data);
  });
};

// delete feed item
exports.deleteFeedItem = (req, res) => {
  Notification.deleteFeedItem(req.headers.authorization, req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found feed item"
        });
      } else {
        res.status(500).send({
          message: "Error deleting feed item"
        });
      }
    } else res.send(data);
  });
};

// get total likes for feed items
exports.feedTotalLikes = (req, res) => {
  Notification.feedTotalLikes(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed likes for logged user."
        });
      } else {
        res.status(500).send({
          message: "Error listing feed likes for logged user."
        });
      }
    } else res.send(data);
  });
};

// get total likes for feed item
exports.getFeedLikes = (req, res) => {
  Notification.getFeedLikes(req.params.feedId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not feed likes for this item"
        });
      } else {
        res.status(500).send({
          message: "Error listing feed likes for this item"
        });
      }
    } else res.send(data);
  });
};

// post new gear added to feed
exports.feedPostNewGear = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save feed post in database
  Notification.feedPostNewGear(req.headers.authorization, req.body.id_item_fk, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while posting to feed."
      });
    else res.send(data);
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

// Send notification
exports.sendNotification = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Notification.sendNotification(req.headers.authorization, req.body.id_user_2_fk, req.body.id_item_fk, req.body.id_event, req.body.id_feed_type_fk, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the notification."
      });
    else res.send(data);
  });
};