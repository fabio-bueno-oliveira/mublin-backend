const sql = require("./db.js");

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
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found user: ", res[0]);
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
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found roles with the profile username
    result({ kind: "not_found" }, null);
  });
};

module.exports = Profile;