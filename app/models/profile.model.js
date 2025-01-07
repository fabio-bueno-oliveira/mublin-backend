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

// start nodemailer
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  pool: true,
  host: process.env.SMTP_SERVICE_HOST,
  port: process.env.SMTP_SERVICE_PORT,
  secure: process.env.SMTP_SERVICE_SECURE,
  auth: {
    user: process.env.SMTP_USER_NAME,
    pass: process.env.SMTP_USER_PASSWORD
  }
});
// end nodemailer

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
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, u.bio, u.email, u.phone_mobile AS phone, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-580,w-580,c-maintain_ratio/',u.id,'/',u.picture) AS pictureLarge, u.first_access AS firstAccess, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, availability_focus AS availabilityFocusId, avf.title_ptbr AS availabilityFocus, c.name AS country, r.name AS region, ci.name AS city, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.legend_badge AS legend, u.verified, u.instagram, u.website, u.public FROM users AS u LEFT JOIN availability_statuses ON u.availability_status = availability_statuses.id LEFT JOIN availability_focuses AS avf ON u.availability_focus = avf.id LEFT JOIN countries AS c ON u.id_country_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN cities AS ci ON u.id_city_fk = ci.id WHERE u.username = '${username}' AND u.status = 1 LIMIT 1`, (err, res) => {
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
  sql.query(`SELECT up.confirmed, up.joined_in, up.left_in, up.show_on_profile, up.portfolio, up.created, p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS picture, p.end_year AS endYear, up.featured, projects_types.name_ptbr AS type, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon, r1.description_ptbr AS role1, r2.description_ptbr AS role2, r3.description_ptbr AS role3 FROM users_projects AS up LEFT JOIN projects AS p ON up.id_project_fk = p.id LEFT JOIN projects_types ON p.type = projects_types.id LEFT JOIN users_projects_relationship ON up.status = users_projects_relationship.id LEFT JOIN roles AS r1 ON up.main_role_fk = r1.id LEFT JOIN roles AS r2 ON up.second_role_fk = r2.id LEFT JOIN roles AS r3 ON up.third_role_fk = r3.id WHERE up.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') AND up.confirmed IN(0,1,2) AND p.public = 1 ORDER BY up.featured DESC, up.status ASC, up.confirmed ASC`, (err, res) => {
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
  sql.query(`SELECT users_roles.id, roles.name_ptbr AS name, roles.description_ptbr AS description, users_roles.main_activity AS main, roles.icon FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id WHERE users_roles.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY users_roles.main_activity DESC`, (err, res) => {
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

Profile.genres = (username, result) => {
  sql.query(`SELECT users_genres.id, genres.name_ptbr AS name, users_genres.main_genre AS main FROM users_genres LEFT JOIN genres ON users_genres.id_genre_fk = genres.id WHERE users_genres.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY users_genres.main_genre DESC`, (err, res) => {
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
  sql.query(`SELECT uf.id, uf.id_follower AS followerId, uf.id_followed AS followedId, u.id AS userId, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.verified, u.legend_badge FROM users_followers AS uf LEFT JOIN users AS u ON uf.id_follower = u.id WHERE uf.id_followed = (SELECT users.id FROM users WHERE users.username = '${username}') AND u.status = 1 ORDER BY uf.id DESC`, 
  (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Profile.following = (username, result) => {
  sql.query(`SELECT users_followers.id, users_followers.id_follower AS followerId, users_followers.id_followed AS followedId, u.id AS userId, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.verified, u.legend_badge FROM users_followers LEFT JOIN users AS u ON users_followers.id_followed = u.id WHERE users_followers.id_follower = (SELECT users.id FROM users WHERE users.username = '${username}') AND u.status = 1 ORDER BY users_followers.id DESC`, 
  (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
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
  sql.query(`SELECT uf.id, IF(uf.id>0,'true','false') AS following, uf.inspiration FROM users_followers AS uf WHERE uf.id_followed = (SELECT users.id FROM users WHERE users.username = '${username}') AND uf.id_follower = ${x.result.id} LIMIT 1`, (err, res) => {
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

Profile.updateInspiration = (loggedID, id, followedId, option, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_followers SET inspiration = '${option}' WHERE id = ${id} AND id_follower = ${x.result.id} AND id_followed = ${followedId}`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { id: id, success: true, message: "Inspiration status updated successfully!" });
    }
  );
};

Profile.posts = (username, result) => {
  sql.query(
    // `SELECT feed.id, UNIX_TIMESTAMP(feed.created) AS created, feed_types.text_ptbr AS action, feed.extra_text AS extraText, feed.image, feed_types.category, IF(feed_types.category='project',projects.name, '') AS relatedProjectName, IF(feed_types.category='project',projects.username, '') AS relatedProjectUsername, IF(feed_types.category='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.picture), '') AS relatedProjectPicture, IF(feed_types.category='project',projects_types.name_ptbr, '') AS relatedProjectType, IF(feed_types.category='event',events.id, '') AS relatedEventId, IF(feed_types.category='event',events.title, '') AS relatedEventTitle, COUNT(feed_likes.id) AS likes, (SELECT COUNT(feed_likes.id) FROM feed_likes WHERE feed_likes.id_feed_item = feed.id AND id_user = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1)) AS likedByMe FROM feed LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item LEFT JOIN projects ON feed.id_item_fk = projects.id LEFT JOIN events ON feed.id_item_fk = events.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE feed.id_user_1_fk = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1) AND feed.id_feed_type_fk NOT IN (6,7,9) AND projects.id > 0 OR events.id > 0 GROUP BY feed.id ORDER BY feed.created DESC LIMIT 2`
    // `SELECT feed.id, feed.id_feed_type_fk AS typeId, UNIX_TIMESTAMP(feed.created) AS created, DATE_FORMAT(feed.created, "%d/%m/%Y") AS created_date, feed_types.text_ptbr AS action, feed.extra_text AS extraText, feed.image FROM feed LEFT JOIN feed_types ON feed.id_feed_type_fk = feed_types.id LEFT JOIN feed_likes ON feed.id = feed_likes.id_feed_item WHERE feed.id_user_1_fk = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1) AND feed.id_feed_type_fk IN (8) GROUP BY feed.id ORDER BY feed.created DESC`
    `SELECT f.id, f.id_item_fk AS relatedItemId, f.extra_text AS extraText, f.extra_info AS extraInfo, IF(f.image IS NOT NULL AND f.image != '', CONCAT('https://ik.imagekit.io/mublin/posts/tr:w-1000,c-maintain_ratio/','/',f.image) , '') AS image, f.video_url AS videoUrl, f.related_item_type AS relatedItemType, f.status, UNIX_TIMESTAMP(f.created) AS created, u.name AS relatedUserName, u.lastname AS relatedUserLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-90,w-90,c-maintain_ratio/',u.id,'/',u.picture) AS relatedUserPicture, u.username AS relatedUserUsername, r.description_ptbr AS relatedUserMainRole, c.name AS relatedUserCity, rg.name AS relatedUserRegion, IF(u.payment_plan=1,'Free', 'Pro') AS relatedUserPlan, u.verified AS relatedUserVerified, u.legend_badge AS relatedUserLegend, IF(f.related_item_type='project',projects.name, '') AS relatedProjectName, IF(f.related_item_type='project',projects.username, '') AS relatedProjectUsername, IF(f.related_item_type='project',CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-140,w-140,c-maintain_ratio/',projects.picture), '') AS relatedProjectPicture, IF(f.related_item_type='project',projects_types.name_ptbr, '') AS relatedProjectType, ft.text_ptbr AS action, ft.category, ft.show_only_as_notification, ft.id AS categoryId, IF(f.related_item_type='event',events.id, '') AS relatedEventId, IF(f.related_item_type='event',events.title, '') AS relatedEventTitle, IF(f.related_item_type='gear',products.id, '') AS relatedGearId, IF(f.related_item_type='gear',products.name, '') AS relatedGearName, IF(f.related_item_type='gear',brands.name, '') AS relatedGearBrand, IF(f.related_item_type='gear',CONCAT('https://ik.imagekit.io/mublin/products/tr:h-140,w-140,cm-pad_resize,bg-FFFFFF/',products.picture), '') AS relatedGearPicture, users_gear.for_sale AS relatedGearForSale, users_gear.price AS relatedGearPrice 

    FROM feed AS f LEFT JOIN users AS u ON f.id_user_1_fk = u.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS r ON ur.id_role_fk = r.id LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS rg ON u.id_region_fk = rg.id LEFT JOIN projects ON f.id_item_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN feed_types AS ft ON f.id_feed_type_fk = ft.id LEFT JOIN events ON f.id_item_fk = events.id LEFT JOIN products ON f.id_item_fk = products.id LEFT JOIN brands ON brands.id = products.id_brand LEFT JOIN users_gear ON products.id = users_gear.id_product LEFT JOIN feed_likes ON f.id = feed_likes.id_feed_item 

    WHERE f.id_user_1_fk = (SELECT users.id FROM users WHERE users.username = '${username}') AND u.id IS NOT NULL AND u.status = 1 

    GROUP BY f.id 

    HAVING ft.show_only_as_notification = 0 AND f.status = 1 

    ORDER BY f.created DESC, ur.main_activity DESC 

    LIMIT 60`
    , (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found posts for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.strengths = (username, result) => {
  sql.query(`SELECT COUNT(users_strengths.id) AS totalVotes, users_strengths.id_strength AS strengthId, users_strengths.id_user_to AS idUserTo, concat(round(count( * ) *100 / (SELECT count( * ) FROM users_strengths WHERE id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}'))) , '%') AS percent, strengths.icon, strengths.title_ptbr AS strengthTitle FROM users_strengths LEFT JOIN strengths ON users_strengths.id_strength = strengths.id WHERE users_strengths.id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}') GROUP BY users_strengths.id_strength ORDER BY percent DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      // result(null, res);
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found strengths for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.strengthsTotalVotes = (username, result) => {
  sql.query(`SELECT users_strengths.id_user_to AS idUserTo, users_strengths.id_strength AS strengthId, count(id_strength) AS totalVotes FROM users_strengths WHERE users_strengths.id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}') GROUP BY id_strength ORDER BY totalVotes DESC`, (err, res) => {
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

Profile.strengthsRecentVotes = (username, result) => {
  sql.query(`SELECT us.id_strength AS strengthId, strengths.title_ptbr AS strength, strengths.icon, us.id_user_from AS userId, users.name, users.lastname, users.verified, users.legend_badge AS legend, users.username, users.picture, DATE_FORMAT(us.created,'%d/%m/%Y %H:%i:%s') AS created FROM users_strengths AS us LEFT JOIN strengths ON us.id_strength = strengths.id LEFT JOIN users ON us.id_user_from = users.id WHERE us.id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}') AND users.status = 1 AND users.name IS NOT NULL ORDER BY us.created DESC LIMIT 100`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found votes for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.strengthsRaw = (username, result) => {
  sql.query(`SELECT users_strengths.id, users_strengths.id_user_to AS idUserTo, users_strengths.id_user_from AS idUserFrom, users_strengths.id_strength AS strengthId, strengths.icon, strengths.title_ptbr AS strengthTitle, DATE_FORMAT(users_strengths.created,'%d/%m/%Y %H:%i:%s') AS created FROM users_strengths LEFT JOIN strengths ON users_strengths.id_strength = strengths.id WHERE users_strengths.id_user_to = (SELECT users.id FROM users WHERE users.username = '${username}') GROUP BY users_strengths.id ORDER BY users_strengths.created DESC`, (err, res) => {
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

Profile.voteStrength = (loggedID, strengthId, strengthTitle, profileId, nameTo, emailTo, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_strengths (id_user_from, id_user_to, id_strength) VALUES (${x.result.id}, ${profileId}, ${strengthId})`, (err, res) => {
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

      var mailOptions = {
        from: process.env.SMTP_USER_NAME,
        to: emailTo,
        subject: 'Você recebeu um ponto forte no Mublin!',
        html: '<h1>Olá, '+nameTo+'!</h1><p>Você recebeu um voto para o ponto forte <strong>'+strengthTitle+'</strong> em seu perfil. Parabéns!</p><p>Equipe Mublin</p><p>mublin.com</p>'
      };
  
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

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
  sql.query(`
  SELECT ug.featured, ug.for_sale AS forSale, ug.price, ug.currently_using AS currentlyUsing, ug.id_product AS productId, ug.owner_comments AS ownerComments, it.name_ptbr AS tuning, it.description AS tuningDescription, brands.name AS brandName, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',brands.logo) AS brandLogo, p.name AS productName, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',p.picture) AS picture, p.picture AS pictureFilename, p.id_brand AS brandId, cat.name_ptbr AS category FROM users_gear AS ug LEFT JOIN products AS p ON ug.id_product = p.id LEFT JOIN brands ON p.id_brand = brands.id LEFT JOIN products_categories AS cat ON p.id_category = cat.id LEFT JOIN instrument_tunings AS it ON ug.tuning = it.id WHERE ug.id_user = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY ug.featured DESC, ug.currently_using DESC, ug.created DESC; 
  
  SELECT cat.name_ptbr AS category, cat.macro_category, COUNT(ug.id_product) as total FROM users_gear AS ug LEFT JOIN products ON ug.id_product = products.id LEFT JOIN products_categories AS cat ON products.id_category = cat.id WHERE ug.id_user = (SELECT users.id FROM users WHERE users.username = '${username}') GROUP BY products.id_category ORDER BY ug.featured DESC, ug.currently_using DESC, ug.created DESC;
  `,  (err, results) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (results[0].length) {
      result(null, { 
        success: true,
        products: {
          total: results[0].length,
          list: results[0]
        },
        categories: {
          total: results[1].length,
          list: results[1]
        }
      });
      return;
    }
    // not found gear with the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.gearSetups = (username, result) => {
  sql.query(`
    SELECT ugs.id, ugs.name FROM users_gear_setup AS ugs WHERE ugs.id_user = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY ugs.id ASC;

    SELECT id_product AS id, id_setup AS setupId FROM users_gear_setup_items WHERE id_user = (SELECT users.id FROM users WHERE users.username = '${username}') ORDER BY id_product ASC
  `, (err, results) => {
    if (err) {
      result(err, null);
      return;
    }
    if (results.length) {
      result(null, { 
        total: results[0].length, success: true, setups: results[0], products: results[1] 
      });
      return;
    }
    // not found setups for the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.gearSetupProducts = (username, setupId, result) => {
  sql.query(`SELECT id_product AS productId FROM users_gear_setup_items WHERE id_setup = ${setupId} ORDER BY id_product ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found setup products for the profile username
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

Profile.newTestimonial = (loggedID, testimonialTitle, testimonialText, profileId, nameTo, emailTo, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_testimonials (	id_user_from_fk, id_user_to_fk, title, testimonial) VALUES (${x.result.id}, ${profileId}, "${testimonialTitle}", "${testimonialText}")`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { profileId: profileId, success: true });

      var mailOptions = {
        from: process.env.SMTP_USER_NAME,
        to: emailTo,
        subject: 'Você recebeu um depoimento no Mublin!',
        html: '<h1>Olá, '+nameTo+'!</h1><p>Você recebeu um voto para o ponto forte <strong>'+strengthTitle+'</strong> em seu perfil. Parabéns!</p><p>Equipe Mublin</p><p>mublin.com</p>'
      };
  
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

    }
  );
};

// Update my testimonial on user profile
Profile.updateTestimonial = (loggedID, testimonialId, testimonialTitle, testimonialText, profileId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_testimonials SET title = '${testimonialTitle}', testimonial = '${testimonialText}' WHERE id = ${testimonialId} AND id_user_from_fk = ${x.result.id} AND id_user_to_fk = ${profileId}`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { profileId: profileId, success: true, message: "Testimonial updated successfully!" });
    }
  );
};

Profile.deleteTestimonial = (loggedID, testimonialId, profileId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_testimonials WHERE id = ${testimonialId}	AND id_user_from_fk = ${x.result.id} AND 	id_user_to_fk = ${profileId}`,
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

Profile.partners = (username, result) => {
  sql.query(`SELECT up.featured, IF(up.type=1,'Endorser', 'Parceiro') AS type, brands.id AS brandId, brands.name AS brandName, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',brands.logo) AS brandLogo, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-100,w-200,cm-pad_resize,bg-FFFFFF/',brands.logo) AS brandLogoRectangular FROM users_partners AS up LEFT JOIN brands ON up.id_brand = brands.id WHERE up.id_user = (SELECT users.id FROM users WHERE users.username = '${username}') AND up.active = 1 ORDER BY up.featured DESC, up.created DESC`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, { total: res.length, success: true, result: res });
      // result(null, res);
      return;
    }
    // not found partners with the profile username
    result({ kind: "not_found" }, null);
  });
};

Profile.relatedUsers = (username, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.picture, users.verified, users.legend_badge AS legendBadge FROM users_projects LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN users_roles ON users.id = users_roles.id_user_fk WHERE (users_projects.id_project_fk IN (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1)) OR users_roles.id_role_fk IN (SELECT id_role_fk FROM users_roles WHERE id_user_fk = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1) AND main_activity = 1) OR users.id IN (SELECT id_followed FROM users_followers WHERE id_follower = (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1)) OR users.social_notability IN(1,2)) AND users_projects.id_user_fk <> (SELECT users.id FROM users WHERE users.username = '${username}' LIMIT 1) AND users.status = 1 AND users.public = 1 GROUP BY users.id ORDER BY RAND(), users.social_notability DESC, users.legend_badge DESC LIMIT 6`, (err, res) => {
    if (err) {
      //console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("result: ", res);
      result(null, { total: res.length, success: true, result: res });
      // result(null, res);
      return;
    }
    // not found partners with the profile username
    result({ kind: "not_found" }, null);
  });
};

module.exports = Profile;