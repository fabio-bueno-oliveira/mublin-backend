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
  sql.query(`
    SELECT f.id, (SELECT COUNT(id) FROM feed_likes WHERE id_feed_item = f.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = f.id AND feed_likes.id_user = ${x.result.id} LIMIT 1) AS likedByMe, (SELECT COUNT(id) FROM feed_comments WHERE id_feed_item = f.id) AS totalComments, f.id_item_fk AS relatedItemId, f.extra_text AS extraText, f.extra_info AS extraInfo, IF(f.image IS NOT NULL AND f.image != '', CONCAT('https://ik.imagekit.io/mublin/posts/tr:w-1000,c-maintain_ratio/','/',f.image) , '') AS image, f.video_url AS videoUrl, f.related_item_type AS relatedItemType, f.show_as_suggested AS suggested, f.status, UNIX_TIMESTAMP(f.created) AS created, u.name AS relatedUserName, u.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-90,w-90,c-maintain_ratio/',u.picture) AS relatedUserPicture, u.username AS relatedUserUsername, u.open_to_work AS relatedUserOpenToWork, u.open_to_work_text AS relatedUserOpenToWorkText, r.description_ptbr AS relatedUserMainRole, c.name AS relatedUserCity, rg.name AS relatedUserRegion, IF(u.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, u.verified AS relatedUserVerified, u.legend_badge AS relatedUserLegend, IF(f.related_item_type='project',projects.name, '') AS relatedProjectName, IF(f.related_item_type='project',projects.username, '') AS relatedProjectUsername, IF(f.related_item_type='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-140,w-140,c-maintain_ratio/',projects.picture), '') AS relatedProjectPicture, IF(f.related_item_type='project',projects_types.name_ptbr, '') AS relatedProjectType, ft.text_ptbr AS action, ft.category, ft.show_only_as_notification, ft.id AS categoryId, IF(f.related_item_type='event',events.id, '') AS relatedEventId, IF(f.related_item_type='event',events.title, '') AS relatedEventTitle, IF(f.related_item_type='gear',products.id, '') AS relatedGearId, IF(f.related_item_type='gear',products.name, '') AS relatedGearName, IF(f.related_item_type='gear',brands.name, '') AS relatedGearBrand, IF(f.related_item_type='gear',CONCAT('https://ik.imagekit.io/mublin/products/tr:h-140,w-140,cm-pad_resize,bg-FFFFFF/',products.picture), '') AS relatedGearPicture, users_gear.for_sale AS relatedGearForSale, users_gear.price AS relatedGearPrice 

    FROM feed AS f LEFT JOIN users AS u ON f.id_user_1_fk = u.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS r ON ur.id_role_fk = r.id LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS rg ON u.id_region_fk = rg.id LEFT JOIN projects ON f.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types AS ft ON f.id_feed_type_fk = ft.id LEFT JOIN events ON f.id_item_fk = events.id LEFT JOIN products ON f.id_item_fk = products.id LEFT JOIN brands ON brands.id = products.id_brand LEFT JOIN users_gear ON products.id = users_gear.id_product LEFT JOIN feed_likes ON f.id = feed_likes.id_feed_item 

    WHERE f.show_as_suggested = 1 OR f.id_item_fk IN (SELECT project_fans.id_fan_fk FROM project_fans WHERE project_fans.id_fan_fk = ${x.result.id}) OR f.id_item_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = ${x.result.id}) OR f.id_user_1_fk IN (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id}) OR f.id_user_1_fk = ${x.result.id} AND u.id IS NOT NULL AND u.status = 1 

    GROUP BY f.id 

    HAVING ft.show_only_as_notification = 0 AND f.status = 1 

    ORDER BY f.created DESC, ur.main_activity DESC 

    LIMIT 60
    `, (err, res) => {
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

Notification.simpleFeed = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT f.id, f.id_item_fk AS relatedItemId, f.extra_text AS extraText, f.image AS image, f.status, f.extra_info AS extraInfo, UNIX_TIMESTAMP(f.created) AS created, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, users.verified AS relatedUserVerified, feed_types.text_ptbr AS action, feed_types.category, feed_types.show_only_as_notification, feed_types.id AS categoryId, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = f.id AND id_user = ${x.result.id}) AS likedByMe FROM feed AS f LEFT JOIN users ON f.id_user_1_fk = users.id LEFT JOIN feed_types ON f.id_feed_type_fk = feed_types.id LEFT JOIN feed_likes ON f.id = feed_likes.id_feed_item WHERE f.id_item_fk IN (SELECT project_fans.id_fan_fk FROM project_fans WHERE project_fans.id_fan_fk = ${x.result.id}) OR f.id_item_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = ${x.result.id}) OR f.id_user_1_fk IN (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id}) OR f.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = 1 GROUP BY f.id HAVING feed_types.id = 8 AND feed_types.show_only_as_notification = 0 AND f.status = 1 ORDER BY f.created DESC LIMIT 60`, (err, res) => {
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

Notification.newPost = (loggedID, id_item_fk, related_item_type, id_feed_type_fk, extra_text, image, video_url, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed (id_user_1_fk, id_item_fk, related_item_type, id_feed_type_fk, extra_text, image, video_url) VALUES (${x.result.id}, '${id_item_fk}', '${related_item_type}', ${id_feed_type_fk}, '${extra_text}', '${image}', '${video_url}')`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { feedId: res.insertId, like: true, success: true });
    }
  );
};

Notification.deleteFeedItem = (loggedID, feedId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM feed WHERE id = ${feedId} AND id_user_1_fk = ${x.result.id}`, 
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

Notification.getFeedLikes = (feedId, result) => {
  sql.query(`SELECT fl.id, fl.id_feed_item AS idItem, DATE_FORMAT(fl.created,'%d/%m/%Y às %H:%i:%s') AS created, u.name, u.lastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-100,w-100,c-maintain_ratio/',u.picture) AS picture, u.username, u.verified, u.legend_badge, roles.description_ptbr FROM feed_likes AS fl LEFT JOIN users AS u ON fl.id_user = u.id LEFT JOIN users_roles ON users_roles.id_user_fk = u.id LEFT JOIN roles ON users_roles.id_role_fk = roles.id WHERE fl.id_feed_item = ${feedId} AND u.status = 1 GROUP BY fl.id_user ORDER BY fl.created DESC, users_roles.main_activity DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      // result(null, res);
      result(null, { total: res.length, success: true, list: res });
      return;
    }
    // no feed likes found for this item
    result({ kind: "not_found" }, null);
  });
};

Notification.feedPostNewGear = (loggedID, id_item_fk, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed (id_item_fk, id_user_1_fk, related_item_type, id_feed_type_fk) VALUES (${id_item_fk}, ${x.result.id}, 'gear', 10)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { feedId: res.insertId, like: true, success: true });
    }
  );
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

Notification.feedComments = (feedId, result) => {
  sql.query(`SELECT comment.id, DATE_FORMAT(comment.createdAt,'%d/%m/%Y às %H:%i:%s') AS created, comment.text, users.id AS userId, users.name, users.lastname, users.picture, users.username, users.verified, users.legend_badge, roles.description_ptbr AS role FROM feed_comments AS comment LEFT JOIN users ON comment.id_user = users.id LEFT JOIN users_roles ON users_roles.id_user_fk = users.id LEFT JOIN roles ON roles.id = users_roles.id_role_fk WHERE comment.id_feed_item = ${feedId} ORDER BY comment.createdAt DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, list: res });
      return;
    }
    // no feed comments found for post id
    result({ kind: "not_found" }, null);
  });
};

Notification.postComment = (loggedID, feedId, text, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed_comments (id_user, id_feed_item, text) VALUES (${x.result.id}, '${feedId}', '${text}')`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { feedId: res.insertId, like: true, success: true });
    }
  );
};

Notification.deletePostComment = (loggedID, commentId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM feed_comments WHERE id = ${commentId} AND id_user = ${x.result.id}`, 
  (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      // result(null, res);
      result(null, { message: 'Comentário deletado com sucesso', success: true });
  });
};

Notification.notifications = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT feed.id, feed.id_feed_type_fk, feed.seen, feed.id_item_fk AS relatedItemId, feed.extra_text AS extraText, feed.extra_info AS extraInfo, DATE_FORMAT(feed.created,'%d/%m/%Y às %H:%i:%s') AS created, UNIX_TIMESTAMP(feed.created) AS createdAlternativeFormat, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, projects.name AS relatedProjectName, projects.username AS relatedProjectUsername, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture) AS relatedProjectPicture, projects_types.name_ptbr AS relatedProjectType, feed_types.text_ptbr AS action, feed_types.category, feed_types.id AS categoryId, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle FROM feed LEFT JOIN users ON feed.id_user_2_fk = users.id LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN events ON feed.id_event = events.id WHERE feed.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = 1 AND feed_types.show_only_as_notification = 1 GROUP BY feed.id ORDER BY feed.created DESC LIMIT 200`, (err, res) => {
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
  sql.query(`SELECT feed.id, feed.id_feed_type_fk, feed.seen, feed.id_item_fk AS relatedItemId, feed.extra_text AS extraText, feed.extra_info AS extraInfo, UNIX_TIMESTAMP(feed.created) AS created, users.name AS relatedUserName, users.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS relatedUserPicture, users.username AS relatedUserUsername, IF(users.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, IF(feed_types.category='project',projects.name, '') AS relatedProjectName, IF(feed_types.category='project',projects.username, '') AS relatedProjectUsername, IF(feed_types.category='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture), '') AS relatedProjectPicture, IF(feed_types.category='project',projects_types.name_ptbr, '') AS relatedProjectType, feed_types.text_ptbr AS action, feed_types.category, feed_types.id AS categoryId, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = feed.id AND id_user = ${x.result.id}) AS likedByMe FROM feed LEFT JOIN users ON feed.id_user_1_fk = users.id LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN events ON feed.id_item_fk = events.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item WHERE feed.id_item_fk IN (SELECT project_fans.id_fan_fk FROM project_fans WHERE project_fans.id_fan_fk = ${x.result.id}) OR feed.id_item_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = ${x.result.id}) OR feed.id_user_1_fk IN (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id}) OR feed.id_user_1_fk = ${x.result.id} AND users.id IS NOT NULL AND users.status = ${x.result.id} GROUP BY feed.id HAVING feed.id_feed_type_fk IN(6,7) AND feed.seen = 0 ORDER BY feed.created DESC LIMIT 300`, (err, res) => {
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