const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Notification = function(notification) {
  this.email = notification.email;
};

Notification.findNotificationsByUserId = (userId, authorization, result) => {
  sql.query(`SELECT feed.id, feed.id_item_fk, feed.id_user_1_fk, feed.id_user_2_fk, feed.date_related, feed.hour_related, feed.extra_text, feed.extra_info, feed.created, feed.notification_read, feed_types.category, feed_types.text_ptbr AS feed_text, users.id AS uid, users.name AS uname, users.lastname AS ulastname, log_users.session FROM feed LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN users ON feed.id_user_1_fk = users.id LEFT JOIN log_users ON feed.id_user_2_fk = log_users.id_user_fk 
  WHERE feed.id_user_2_fk = ${userId} AND log_users.session = '${authorization}' AND feed.created >= CURDATE() - INTERVAL 60 DAY GROUP BY feed.id ORDER BY feed.created DESC LIMIT 15`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("notifications: ", res);
      result(null, res);
      return;
    }
    // not found user with the keyword
    result({ kind: "not_found" }, null);
  });
};

// Notification.updateNotificationReadById = (usuId, feedId, read, authorization, result) => {
//   sql.query(`UPDATE feed SET feed.notification_read = ${read} WHERE feed.id = ${feedId} AND feed.id_user_2_fk IN (SELECT log_users.id_user_fk FROM log_users WHERE log_users.session = '${authorization}' AND log_users.id_user_fk = ${usuId})`, 
//   (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }
//     if (res.affectedRows == 0) {
//       // not found Project with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }
//     console.log("updated feed: ", { feedId: feedId });
//     result(null, { feedId: feedId });
//   });
// };

Notification.updateReads = (loggedID, usuId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == usuId) {
    sql.query(`UPDATE feed SET feed.seen = 1 WHERE feed.id_user_2_fk = ${usuId}`, 
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found Project with the id
        result({ kind: "not_found" }, null);
        return;
      }
      console.log("updated feeds:");
      result(null, { userId: usuId, success: true, message: 'All messages set to seen' });
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

Notification.feed = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT feed.id, feed.id_item_fk AS relatedItemId, feed.extra_text AS extraText, feed.extra_info AS extraInfo, UNIX_TIMESTAMP(feed.created) AS created, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, IF(feed_types.category='project',projects.name, '') AS relatedProjectName, IF(feed_types.category='project',projects.username, '') AS relatedProjectUsername, IF(feed_types.category='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture), '') AS relatedProjectPicture, IF(feed_types.category='project',projects_types.name_ptbr, '') AS relatedProjectType, feed_types.text_ptbr AS action, feed_types.category, feed_types.show_only_as_notification, feed_types.id AS categoryId, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = feed.id AND id_user = ${x.result.id}) AS likedByMe FROM feed LEFT JOIN users ON feed.id_user_1_fk = users.id LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN events ON feed.id_item_fk = events.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item WHERE feed.id_item_fk IN (SELECT project_fans.id_fan_fk FROM project_fans WHERE project_fans.id_fan_fk = ${x.result.id}) OR feed.id_item_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = ${x.result.id}) OR feed.id_user_1_fk IN (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id}) OR feed.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = ${x.result.id} GROUP BY feed.id HAVING feed_types.show_only_as_notification = 0 ORDER BY feed.created DESC LIMIT 100`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // no feed events found for logged user
    result({ kind: "not_found" }, null);
  });
};

Notification.feedLike = (loggedID, feedId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed_likes (id_feed_item, id_user) VALUES (${feedId}, ${x.result.id})`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { feedId: feedId, like: true, success: true });
    }
  );
};

Notification.feedUnlike = (loggedID, feedId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM feed_likes WHERE id_feed_item = ${feedId} AND id_user = ${x.result.id}`, 
  (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, res);
  });
};

Notification.notifications = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT feed.id, feed.id_feed_type_fk, feed.seen, feed.id_item_fk AS relatedItemId, feed.extra_text AS extraText, feed.extra_info AS extraInfo, DATE_FORMAT(feed.created,'%d/%m/%Y às %H:%i:%s') AS created, UNIX_TIMESTAMP(feed.created) AS createdAlternativeFormat, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, projects.name AS relatedProjectName, projects.username AS relatedProjectUsername, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture) AS relatedProjectPicture, projects_types.name_ptbr AS relatedProjectType, feed_types.text_ptbr AS action, feed_types.category, feed_types.id AS categoryId, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle FROM feed LEFT JOIN users ON feed.id_user_2_fk = users.id LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN events ON feed.id_event = events.id WHERE feed.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = 1 AND feed_types.show_only_as_notification = 1 GROUP BY feed.id ORDER BY feed.created DESC LIMIT 200`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // no notification found for logged user
    result({ kind: "not_found" }, null);
  });
};

Notification.notificationsUnseen = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT feed.id, feed.id_feed_type_fk, feed.seen, feed.id_item_fk AS relatedItemId, feed.extra_text AS extraText, feed.extra_info AS extraInfo, UNIX_TIMESTAMP(feed.created) AS created, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, IF(feed_types.category='project',projects.name, '') AS relatedProjectName, IF(feed_types.category='project',projects.username, '') AS relatedProjectUsername, IF(feed_types.category='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture), '') AS relatedProjectPicture, IF(feed_types.category='project',projects_types.name_ptbr, '') AS relatedProjectType, feed_types.text_ptbr AS action, feed_types.category, feed_types.id AS categoryId, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = feed.id AND id_user = ${x.result.id}) AS likedByMe FROM feed LEFT JOIN users ON feed.id_user_1_fk = users.id LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN events ON feed.id_item_fk = events.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item WHERE feed.id_item_fk IN (SELECT project_fans.id_fan_fk FROM project_fans WHERE project_fans.id_fan_fk = ${x.result.id}) OR feed.id_item_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = ${x.result.id}) OR feed.id_user_1_fk IN (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id}) OR feed.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = ${x.result.id} GROUP BY feed.id HAVING feed.id_feed_type_fk IN(6,7) AND feed.seen = 0 ORDER BY feed.created DESC LIMIT 300`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // no notification found for logged user
    result({ kind: "not_found" }, null);
  });
};

Notification.sendNotification = (loggedID, id_user_2_fk, id_item_fk, id_event, id_feed_type_fk, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed (id_user_1_fk, id_user_2_fk, id_item_fk, id_event, id_feed_type_fk) VALUES (${x.result.id}, ${id_user_2_fk}, ${id_item_fk}, ${id_event}, ${id_feed_type_fk})`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("Created notification: ", { id: res.insertId });
      result(null, { id: res.insertId, message: 'Notification created successfully' });
    }
  );
};

module.exports = Notification;