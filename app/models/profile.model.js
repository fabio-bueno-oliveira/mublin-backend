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

Profile.infos = (username, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.bio, users.email, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.first_access AS firstAccess, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, countries.name AS country, regions.name AS region, cities.name AS city, IF(users.payment_plan=1,'Free', 'Pro') AS plan FROM users LEFT JOIN availability_statuses ON users.availability = availability_statuses.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE users.username = '${username}' AND users.status = 1 LIMIT 1`, (err, res) => {
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

module.exports = Profile;