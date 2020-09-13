const sql = require("./db.js");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// constructor
const Search = function(search) {
  //this.created = user.created;
};

Search.findUsersByKeyword = (keyword, userCity, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.public AS publicProfile, IF(users.payment_plan=1,'Free', 'Pro') AS plan, users.status, cities.name AS city, regions.name AS region, countries.name AS country, roles.name_ptbr AS roleName, roles.description_ptbr AS mainRole, projects.name AS projectRelated, projects.public AS projectPublic, availability_statuses.title_ptbr AS availabilityStatus, availability_statuses.color AS availability_color, projects_types.name_ptbr AS projectType FROM users LEFT JOIN users_roles ON users.id = users_roles.id_user_fk LEFT OUTER JOIN roles ON users_roles.id_role_fk = roles.id LEFT OUTER JOIN users_projects ON users.id = users_projects.id_user_fk LEFT OUTER JOIN projects ON users_projects.id_project_fk = projects.id LEFT OUTER JOIN projects_types ON projects.type = projects_types.id LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT JOIN cities ON users.id_city_fk = cities.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN countries ON users.id_country_fk = countries.id WHERE MATCH(users.name, users.lastname) AGAINST ('%${keyword}%') OR users.name LIKE '%${keyword}%' OR users.lastname LIKE '%${keyword}%' OR cities.name LIKE '%${keyword}%' OR roles.name_ptbr LIKE '%${keyword}%' OR roles.description_ptbr LIKE '%${keyword}%' OR projects.name LIKE '%${keyword}%' GROUP BY users.id HAVING users.public = 1 AND users.status = 1 AND projects.public = 1 ORDER BY users.name ASC, (cities.name = '%${userCity}%') DESC`, (err, res) => {
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

Search.findProjectsByKeyword = (keyword, userCity, result) => {
  sql.query(`SELECT projects.id, projects.name, projects.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture) AS picture, projects.public, cities.name AS city, regions.name AS region, countries.name AS country FROM projects LEFT JOIN cities ON projects.id_city_fk = cities.id LEFT JOIN regions ON projects.id_region_fk = regions.id LEFT JOIN countries ON projects.id_country_fk = countries.id WHERE projects.name LIKE '%${keyword}%' OR projects.username LIKE '%${keyword}%' HAVING projects.public = 1 ORDER BY projects.name ASC, (cities.name = '%${userCity}%') DESC`, (err, res) => {
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