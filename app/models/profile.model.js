const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Profile = function(profile) {
  this.created = profile.created;
  this.modified = profile.modified;
  this.name = profile.name;
  this.lastname = profile.lastname;
  this.email = profile.email;
  this.username = profile.username;
  this.password = profile.password;
  this.random_key = profile.random_key;
};

Profile.changePassword = (loggedID, userId, newPassword, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users SET password = '${newPassword}' WHERE id = ${userId} AND ${x.result.id} = 1`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: userId, success: true });
    }
  );
};

Profile.infos = (username, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.bio, users.email, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.first_access AS firstAccess, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, availability_focus AS availabilityFocus, countries.name AS country, regions.name AS region, cities.name AS city, IF(users.payment_plan=1,'Free', 'Pro') AS plan, users.legend_badge AS legend, users.verified FROM users LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE users.username = '${username}' AND users.status = 1 LIMIT 1`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }
    // not found User with the id
    result({ kind: "not_found" }, null);
  });
};

Profile.projects = (username, result) => {
  sql.query(`SELECT users_projects.joined_in, users_projects.portfolio, users_projects.created, projects.id, projects.name, projects.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.picture) AS picture, users_projects.featured, projects_types.name_ptbr AS type, users_projects_status.title_ptbr AS workTitle, users_projects_status.icon AS workIcon, r1.description_ptbr AS role1, r2.description_ptbr AS role2, r3.description_ptbr AS role3 FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id WHERE users_projects.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') AND users_projects.confirmed IN(0,1,2) AND projects.public = 1 ORDER BY users_projects.featured DESC, users_projects.status ASC, users_projects.confirmed ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("projects: ", res);
      result(null, res);
      return;
    }
    // not found projects with the id
    result({ kind: "not_found" }, null);
  });
};

Profile.roles = (username, result) => {
  sql.query(`SELECT users_roles.id, roles.name_ptbr AS name, roles.description_ptbr AS description, users_roles.main_activity AS main FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id WHERE users_roles.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY users_roles.main_activity DESC`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found roles with the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.followers = (username, result) => {
  sql.query(`SELECT users_followers.id, users_followers.id_follower AS followerId, users_followers.id_followed AS followedId, users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture FROM users_followers LEFT JOIN users ON users_followers.id_follower = users.id WHERE users_followers.id_followed = (SELECT users.id FROM users WHERE users.username = '${username}') AND users.status = 1`, 
  (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    result(null, res);
  });
};

Profile.following = (username, result) => {
  sql.query(`SELECT users_followers.id, users_followers.id_follower AS followerId, users_followers.id_followed AS followedId, users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture FROM users_followers LEFT JOIN users ON users_followers.id_followed = users.id WHERE users_followers.id_follower = (SELECT users.id FROM users WHERE users.username = '${username}') AND users.status = 1`, 
  (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    result(null, res);
  });
};

Profile.follow = (loggedID, profileId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_followers (id_follower, id_followed) VALUES (${x.result.id}, ${profileId})`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { followingId: profileId, success: true });
    }
  );
};

Profile.unfollow = (loggedID, profileId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_followers WHERE id_follower = ${x.result.id} AND id_followed = ${profileId}`, 
  (err, res) => {
      if (err) {
        console.log("error: ", err);
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

Profile.checkFollow = (loggedID, username, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT users_followers.id, IF(users_followers.id>0,'true','false') AS following FROM users_followers WHERE users_followers.id_followed = (SELECT users.id FROM users WHERE users.username = '${username}') AND id_follower = ${x.result.id} LIMIT 1`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // not following profiile with the username informed
    result({ kind: "not_found" }, null);
  });
};

Profile.posts = (username, result) => {
  sql.query(`SELECT feed.id, UNIX_TIMESTAMP(feed.created) AS created, feed_types.text_ptbr AS action, feed.extra_text AS extraText, feed.image, feed_types.category, IF(feed_types.category='project',projects.name, '') AS relatedProjectName, IF(feed_types.category='project',projects.username, '') AS relatedProjectUsername, IF(feed_types.category='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.picture), '') AS relatedProjectPicture, IF(feed_types.category='project',projects_types.name_ptbr, '') AS relatedProjectType, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = feed.id AND id_user = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1)) AS likedByMe FROM feed LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN events ON feed.id_item_fk = events.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE feed.id_user_1_fk = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1) AND feed.id_feed_type_fk NOT IN (6,7) GROUP BY feed.id ORDER BY feed.created DESC LIMIT 2`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found posts for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.strengths = (username, result) => {
  sql.query(`SELECT users_strengths.id, users_strengths.id_user_to AS idUserTo, users_strengths.id_user_from AS idUserFrom, users_strengths.id_strenght AS strengthId, concat(round(count( * ) *100 / (SELECT count( * ) FROM users_strengths WHERE id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}'))) , '%') AS percent, strengths.icon, strengths.title_ptbr AS strengthTitle FROM users_strengths LEFT JOIN strengths ON users_strengths.id_strenght = strengths.id WHERE users_strengths.id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}') GROUP BY users_strengths.id_strenght ORDER BY percent DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found strengths for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.voteStrength = (loggedID, strengthId, profileId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_strengths (id_user_from, id_user_to, id_strenght) VALUES (${x.result.id}, ${profileId}, ${strengthId})`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { profileId: profileId, success: true, strengthId: strengthId });
    }
  );
};

Profile.unvoteStrength = (loggedID, voteId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_strengths WHERE id = ${voteId}	AND id_user_from = ${x.result.id}`, 
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

Profile.gear = (username, result) => {
  sql.query(`SELECT users_gear.featured, users_gear.for_sale AS forSale, users_gear.price, users_gear.currently_using AS currentlyUsing, users_gear.id_product AS productId, brands.name AS brandName, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',brands.logo) AS brandLogo, brands_products.name AS productName, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',brands_products.picture) AS picture, brands_products.id_brand AS brandId, brands_categories.name_ptbr AS category FROM users_gear LEFT JOIN brands_products ON users_gear.id_product = brands_products.id LEFT JOIN brands ON brands_products.id_brand = brands.id LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id WHERE users_gear.id_user = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY users_gear.featured DESC, users_gear.currently_using DESC, users_gear.created DESC`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found gear with the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.availabilityItems = (username, result) => {
  sql.query(`SELECT users_availability_items.id, availability_items.id AS itemId, availability_items.name_ptbr AS itemName FROM users_availability_items LEFT JOIN availability_items ON users_availability_items.id_item_fk = availability_items.id WHERE users_availability_items.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY users_availability_items.id ASC`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found roles with the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.testimonials = (username, result) => {
  sql.query(`SELECT users_testimonials.id, DATE_FORMAT(users_testimonials.created,'%d/%m/%Y') AS created, users_testimonials.id_user_from_fk AS friendId, users_testimonials.title, users_testimonials.testimonial, CONCAT(users.name,' ',users.lastname) AS friendName, users.username AS friendUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users_testimonials.id_user_from_fk,'/',users.picture) AS friendPicture, IF(users.payment_plan=1,'Free', 'Pro') AS friendPlan FROM users_testimonials LEFT JOIN users ON users_testimonials.id_user_from_fk = users.id WHERE users_testimonials.id_user_to_fk = (SELECT users.id FROM users WHERE users.username = '${username}') AND users.status = 1 ORDER BY users_testimonials.created DESC`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found testimonials with the profile username
    result({ kind: "not_found" }, null);
  });
};

module.exports = Profile;