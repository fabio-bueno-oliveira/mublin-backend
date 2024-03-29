const sql = require("./db.js");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// constructor
const Search = function(search) {
  //this.created = user.created;
};

Search.findUsersByKeyword = (keyword, userCity, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.public AS publicProfile, IF(users.payment_plan=1,'Free', 'Pro') AS plan, users.status, users.legend_badge AS legend, users.verified, cities.name AS city, regions.name AS region, countries.name AS country, roles.name_ptbr AS roleName, roles.description_ptbr AS mainRole, roles.instrumentalist, projects.name AS projectRelated, projects.public AS projectPublic, availability_statuses.title_ptbr AS availabilityStatus, availability_statuses.color AS availability_color, projects_types.name_ptbr AS projectType, (SELECT COUNT(projects.id) FROM users_projects JOIN projects ON users_projects.id_project_fk = projects.id WHERE users_projects.id_user_fk = users.id AND users_projects.show_on_profile = 1) AS totalProjects FROM users LEFT JOIN users_roles ON users.id = users_roles.id_user_fk LEFT OUTER JOIN roles ON users_roles.id_role_fk = roles.id LEFT OUTER JOIN users_projects ON users.id = users_projects.id_user_fk LEFT OUTER JOIN projects ON users_projects.id_project_fk = projects.id LEFT OUTER JOIN projects_types ON projects.type = projects_types.id LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT JOIN cities ON users.id_city_fk = cities.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN countries ON users.id_country_fk = countries.id WHERE MATCH(users.name, users.lastname) AGAINST ('%${keyword}%') OR users.name LIKE '%${keyword}%' OR users.lastname LIKE '%${keyword}%' OR cities.name LIKE '%${keyword}%' OR roles.name_ptbr LIKE '%${keyword}%' OR roles.description_ptbr LIKE '%${keyword}%' OR projects.name LIKE '%${keyword}%' GROUP BY users.id HAVING users.public = 1 AND users.status = 1 ORDER BY users.name ASC, users.lastname ASC, (cities.name = '%${userCity}%') DESC LIMIT 100`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findUsersProjectsFromUserSearch = (userId, result) => {
  sql.query(`SELECT users_projects.id_project_fk AS projectId, projects.name, projects.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture) AS picture, projects.public FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id WHERE users_projects.id_user_fk = ${userId} AND projects.public = 1 ORDER BY users_projects.featured DESC, users_projects.joined_in DESC, users_projects.portfolio DESC, projects.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findProjectsByKeyword = (loggedUserId, keyword, userCity, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT projects.id, projects.name, projects.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.picture) AS picture, projects.public, cities.name AS city, regions.name AS region, countries.name AS country, genre1.name AS mainGenre, genre2.name AS secondGenre, genre3.name AS thirdGenre, projects_types.name_ptbr AS type, projects.label_show AS labelShow, projects.label_text AS labelText, projects.label_color AS labelColor, projects.foundation_year AS foundationYear, projects.end_year AS endYear, (SELECT users_projects.confirmed FROM users_projects WHERE users_projects.id_project_fk = projects.id AND users_projects.id_user_fk = ${x.result.id}) AS participationStatus, (SELECT users_projects.id FROM users_projects WHERE users_projects.id_project_fk = projects.id AND users_projects.id_user_fk = ${x.result.id}) AS participationId FROM projects LEFT JOIN projects_types ON projects_types.id = projects.type LEFT JOIN genres AS genre1 ON projects.id_genre_1_fk = genre1.id LEFT JOIN genres AS genre2 ON projects.id_genre_2_fk = genre2.id LEFT JOIN genres AS genre3 ON projects.id_genre_3_fk = genre3.id LEFT JOIN cities ON projects.id_city_fk = cities.id LEFT JOIN regions ON projects.id_region_fk = regions.id LEFT JOIN countries ON projects.id_country_fk = countries.id WHERE projects.name LIKE '%${keyword}%' OR projects.username LIKE '%${keyword}%' OR cities.name LIKE '%${keyword}%' HAVING projects.public = 1 ORDER BY projects.name ASC, (cities.name = '%${userCity}%') DESC LIMIT 100`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findUsersBySuggestion = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.bio, users.verified, roles.name_ptbr AS roleName, roles.description_ptbr AS mainRole, roles.instrumentalist, cities.name AS city, regions.name AS region, countries.name AS country, IF(users.payment_plan=1,'Free', 'Pro') AS plan, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, (SELECT COUNT(id) FROM users_projects WHERE id_user_fk = users.id AND show_on_profile = 1) AS totalProjects, (SELECT name FROM cities WHERE id IN (SELECT id_city_fk FROM users WHERE id = ${x.result.id})) AS myCity FROM users LEFT JOIN users_roles ON users.id = users_roles.id_user_fk LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT OUTER JOIN roles ON users_roles.id_role_fk = roles.id LEFT JOIN cities ON users.id_city_fk = cities.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN countries ON users.id_country_fk = countries.id WHERE users.id NOT IN (SELECT id_followed FROM users_followers WHERE id_follower = ${x.result.id}) AND users.id <> ${x.result.id} AND users.public = 1 GROUP BY users.id ORDER BY cities.name = myCity DESC, RAND() LIMIT 8`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

module.exports = Search;