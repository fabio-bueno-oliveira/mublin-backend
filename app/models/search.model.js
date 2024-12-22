const sql = require("./db.js");
// const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// constructor
const Search = function(search) {
  //this.created = user.created;
};

Search.saveSearch = (loggedID, query, source, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO search_history (id_user, query, source) VALUES (${x.result.id}, '${query}', '${source}')`, (err, res) => {
    if (err) {
      console.log("error saving log: ", err);
      result(err, null);
      return;
    }

    // console.log("Query saved: ", { id: res.insertId, userId: x.result.id, query: query });
    // result(null, { id: res.insertId, userId: x.result.id, query: query });
    result(null, { success: true });
  });
};

Search.findUsersByKeyword = (keyword, userCity, result) => {
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.public AS publicProfile, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.status, u.legend_badge AS legend, u.verified, cities.name AS city, regions.name AS region, countries.name AS country, r.name_ptbr AS roleName, r.description_ptbr AS mainRole, r.instrumentalist, projects.name AS projectRelated, projects.public AS projectPublic, avs.title_ptbr AS availabilityStatus, avs.color AS availability_color, pty.name_ptbr AS projectType, (SELECT COUNT(projects.id) FROM users_projects JOIN projects ON users_projects.id_project_fk = projects.id WHERE users_projects.id_user_fk = u.id AND users_projects.show_on_profile = 1) AS totalProjects FROM users AS u LEFT JOIN users_roles ON u.id = users_roles.id_user_fk LEFT OUTER JOIN roles AS r ON users_roles.id_role_fk = r.id LEFT OUTER JOIN users_projects ON u.id = users_projects.id_user_fk LEFT OUTER JOIN projects ON users_projects.id_project_fk = projects.id LEFT OUTER JOIN projects_types AS pty ON projects.type = pty.id LEFT JOIN availability_statuses AS avs ON u.availability_status = avs.id LEFT JOIN cities ON u.id_city_fk = cities.id LEFT JOIN regions ON u.id_region_fk = regions.id LEFT JOIN countries ON u.id_country_fk = countries.id WHERE MATCH(u.name, u.lastname) AGAINST ('%${keyword}%') OR u.name LIKE '%${keyword}%' OR u.lastname LIKE '%${keyword}%' OR cities.name LIKE '${keyword}' OR r.name_ptbr LIKE '${keyword}' OR r.description_ptbr LIKE '${keyword}' OR projects.name LIKE '%${keyword}%' GROUP BY u.id HAVING u.public = 1 AND u.status = 1 ORDER BY u.name ASC, u.lastname ASC, (cities.name = '%${userCity}%') DESC LIMIT 50`, (err, res) => {
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
  sql.query(`SELECT up.id_project_fk AS projectId, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.id,'/',p.picture) AS picture, p.public FROM users_projects AS up LEFT JOIN projects AS p ON up.id_project_fk = p.id WHERE up.id_user_fk = ${userId} AND p.public = 1 ORDER BY up.featured DESC, up.joined_in DESC, up.portfolio DESC, p.name ASC`, (err, res) => {
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
  sql.query(`SELECT p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS picture, p.public, cities.name AS city, regions.name AS region, countries.name AS country, genre1.name AS mainGenre, genre2.name AS secondGenre, genre3.name AS thirdGenre, projects_types.name_ptbr AS type, p.label_show AS labelShow, p.label_text AS labelText, p.label_color AS labelColor, p.foundation_year AS foundationYear, p.end_year AS endYear, (SELECT users_projects.confirmed FROM users_projects WHERE users_projects.id_project_fk = p.id AND users_projects.id_user_fk = ${x.result.id}) AS participationStatus, (SELECT users_projects.id FROM users_projects WHERE users_projects.id_project_fk = p.id AND users_projects.id_user_fk = ${x.result.id}) AS participationId FROM projects AS p LEFT JOIN projects_types ON projects_types.id = p.type LEFT JOIN genres AS genre1 ON p.id_genre_1_fk = genre1.id LEFT JOIN genres AS genre2 ON p.id_genre_2_fk = genre2.id LEFT JOIN genres AS genre3 ON p.id_genre_3_fk = genre3.id LEFT JOIN cities ON p.id_city_fk = cities.id LEFT JOIN regions ON p.id_region_fk = regions.id LEFT JOIN countries ON p.id_country_fk = countries.id WHERE p.name LIKE '%${keyword}%' OR p.username LIKE '%${keyword}%' OR cities.name LIKE '%${keyword}%' HAVING p.public = 1 ORDER BY p.name ASC, (cities.name = '%${userCity}%') DESC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getUserLastSearches = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT query FROM search_history WHERE id_user = ${x.result.id} GROUP BY query ORDER BY createdAt DESC LIMIT 5`, (err, res) => {
    if (err) {
      // console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      // result(null, res.map((i) => i.query));
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

Search.getRandomFeaturedUsers = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.verified, u.legend_badge AS legend, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id WHERE u.status = 1 AND u.public = 1 AND u.id <> ${x.result.id} GROUP BY u.username ORDER BY ur.main_activity DESC, u.legend_badge DESC, u.verified DESC, RAND() LIMIT 3;`, (err, res) => {
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

Search.getRandomFeaturedProjects = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-165,w-165,c-maintain_ratio/',p.picture) AS picture, p.currentlyOnTour, g1.name_ptbr AS genre1, g2.name_ptbr AS genre2, c.name AS city, r.name AS region, r.uf, pt.name_ptbr AS type FROM projects AS p LEFT JOIN cities AS c ON p.id_city_fk = c.id LEFT JOIN regions AS r ON p.id_region_fk = r.id LEFT JOIN genres AS g1 ON p.id_genre_1_fk = g1.id LEFT JOIN genres AS g2 ON p.id_genre_2_fk = g2.id LEFT JOIN users_projects AS up ON p.id = up.id_project_fk LEFT JOIN projects_types AS pt ON p.type = pt.id WHERE p.public = 1 AND p.end_year IS NULL AND up.id_user_fk <> ${x.result.id} ORDER BY RAND() LIMIT 3;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getNewRecentUsers = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.verified, u.legend_badge AS legend, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id WHERE u.status = 1 AND u.public = 1 AND u.id <> ${x.result.id} GROUP BY u.username ORDER BY u.created DESC LIMIT 3;`, (err, res) => {
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

Search.getHomeFeaturedUsers = result => {
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.id,'/',u.picture) AS picture, u.verified, u.legend_badge AS legend, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id WHERE u.status = 1 AND u.public = 1 GROUP BY u.username ORDER BY ur.main_activity DESC, u.legend_badge DESC, u.verified DESC, RAND() LIMIT 8;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Home Featured Users: ", res);
    result(null, res);
  });
};

module.exports = Search;