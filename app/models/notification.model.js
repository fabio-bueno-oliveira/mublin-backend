const sql = require("./db.js");

// constructor
const Notification = function(notification) {
  this.email = notification.email;
};

Notification.findNotificationsByUserId = (userId, authorization, result) => {
  sql.query(`SELECT feed.id, feed.id_item_fk, feed.id_user_1_fk, feed.id_user_2_fk, feed.date_related, feed.hour_related, feed.extra_text, feed.extra_info, feed.created, feed.notification_read, feed_types.type, feed_types.text_ptbr AS feed_text, users.id AS uid, users.name AS uname, users.lastname AS ulastname, log_users.session FROM feed LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN users ON feed.id_user_1_fk = users.id LEFT JOIN log_users ON feed.id_user_2_fk = log_users.id_user_fk 
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

Notification.updateReads = (usuId, read, authorization, result) => {
  sql.query(`UPDATE feed SET feed.notification_read = ${read} WHERE feed.id_user_2_fk IN (SELECT log_users.id_user_fk FROM log_users WHERE log_users.session = '${authorization}' AND log_users.id_user_fk = ${usuId})`, 
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
    result(null, { usuId: usuId });
  });
};

module.exports = Notification;