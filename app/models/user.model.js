const sql = require("./db.js");

// constructor
const User = function(user) {
  this.email = user.email;
  this.name = user.name;
  this.active = user.active;
};

User.loginUserByEmail = (email, result) => {
  sql.query(`SELECT id, email, username, password FROM users WHERE email = '${email}'`, (err, res) => {
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

User.checkUserByToken = (loggedEmail, result) => {
  sql.query(`SELECT id, email, status FROM users WHERE email = '${loggedEmail}' AND status = '1' LIMIT 1`, (err, res) => {
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
    // not found User with the email in the token
    result({ kind: "not_found" }, null);
  });
};

User.getUserInfo = (email, loggedEmail, result) => {
    sql.query(`SELECT id, name, lastname, username, email, picture, payment_plan, first_access FROM users WHERE email = '${loggedEmail}' LIMIT 1`, (err, res) => {
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
      // not found User with the email in the token
      result({ kind: "not_found" }, null);
    });
};

User.getAll = result => {
  sql.query("SELECT name, lastname, username, email, picture FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("projects: ", res);
    result(null, res);
  });
};

User.findById = (userId, result) => {
  sql.query(`SELECT name, lastname, username, email, picture FROM users WHERE id = ${userId}`, (err, res) => {
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

User.findByUsername = (username, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.bio, users.email, users.picture, users.first_access AS firstAccess, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, countries.name AS country, regions.name AS region, cities.name AS city, users.payment_plan AS plan FROM users LEFT JOIN availability_statuses ON users.availability = availability_statuses.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE users.username = '${username}' AND users.status = 1 LIMIT 1`, (err, res) => {
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

User.findUserByKeyword = (keyword, result) => {
  sql.query(`SELECT id, name, lastname, username, email, picture FROM users WHERE users.name LIKE '%${keyword}%' ORDER BY users.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("users: ", res);
      result(null, res);
      return;
    }
    // not found user with the keyword
    result({ kind: "not_found" }, null);
  });
};

// find users, projects or events by keyword
User.findAllByKeyword = (keyword, result) => {
  // sql.query(`
  //   SELECT users.id, users.name AS title, users.lastname AS extra1, users.username AS extra2, users.status AS extra3, troles.rolename AS extra4, 'Usuários' as category FROM users LEFT JOIN 
  //   (SELECT users_roles.id_user_fk,
  //           users_roles.id_role_fk,
  //           users_roles.main_activity, roles.id AS rid, roles.name_ptbr AS rolename, roles.description_ptbr AS roledesc 
  //           FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id 
  //           WHERE users_roles.main_activity = 1 
  //   ) AS troles
  //   ON users.id = troles.id_user_fk
  //   WHERE name LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR troles.rolename LIKE '%${keyword}%' OR troles.roledesc LIKE '%${keyword}%' GROUP BY users.id HAVING status = 1 UNION 

  //   SELECT id, name AS title, username AS extra, bio AS extra2, public AS extra3, foundation_year AS extra4, 'Projetos' as category FROM projects WHERE name LIKE '%${keyword}%' OR username LIKE '%${keyword}%' HAVING public = 1 UNION 

  //   SELECT events.id, events.title, events.description AS extra, events.date_opening AS extra2, events.showable_on_site AS extra3, tprojects.name AS extra4, 'Eventos' as category FROM events LEFT JOIN 
  //   (SELECT projects.id, projects.name 
  //     FROM projects 
  //   ) AS tprojects
  //   ON events.id_project_fk = tprojects.id 
  //   WHERE title LIKE '%${keyword}%' OR description LIKE '%${keyword}%' HAVING showable_on_site = 1 AND date_opening >= CURDATE() ORDER BY title ASC LIMIT 50`, (err, res) => {
    sql.query(`
    SELECT users.id, users.name AS title, users.lastname AS extra1, users.username AS extra2, users.status AS extra3, IF(users.payment_plan = 2,'PRO','') AS price, IF(troles.rolename IS NOT NULL,troles.rolename,'Usuário') AS description, IF(users.picture IS NOT NULL,CONCAT('https://mublin.com/img/users/avatars/',users.id,'/',users.picture),'') AS image FROM users LEFT JOIN 
    (SELECT users_roles.id_user_fk,
            users_roles.id_role_fk,
            users_roles.main_activity, roles.id AS rid, roles.name_ptbr AS rolename, roles.description_ptbr AS roledesc 
            FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id 
            WHERE users_roles.main_activity = 1 
    ) AS troles
    ON users.id = troles.id_user_fk
    WHERE name LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR troles.rolename LIKE '%${keyword}%' OR troles.roledesc LIKE '%${keyword}%' GROUP BY users.id HAVING status = 1 UNION 

    SELECT projects.id, projects.name AS title, projects.username AS extra, projects.public AS extra2, projects.foundation_year AS extra3, '' AS price, projects_types.name_ptbr AS description, IF(projects.picture IS NOT NULL,CONCAT('https://mublin.com/img/projects/',projects.id,'/',projects.picture),'') AS image FROM projects LEFT JOIN projects_types ON projects.type = projects_types.id WHERE projects.name LIKE '%${keyword}%' OR projects.username LIKE '%${keyword}%' HAVING public = 1 UNION 

    SELECT events.id, events.title, events.description AS extra, events.date_opening AS extra2, events.showable_on_site AS extra3, DATE_FORMAT(events.date_opening,"%d/%m/%Y") AS price, CONCAT('Evento de ',tprojects.name) AS description, events.picture AS image FROM events LEFT JOIN 
    (SELECT projects.id, projects.name 
      FROM projects 
    ) AS tprojects
    ON events.id_project_fk = tprojects.id 
    WHERE title LIKE '%${keyword}%' OR description LIKE '%${keyword}%' HAVING showable_on_site = 1 AND date_opening >= CURDATE() ORDER BY title ASC LIMIT 50`, (err, res) => {
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
    // not found user with the keyword
    result({ kind: "not_found" }, null);
  });
};

User.followByProfileId = (usuId, profileID, result) => {
  sql.query(`INSERT INTO users_followers (id_follower, id_followed) VALUES (${usuId}, ${profileID})`, 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      // not found profile with the id
      result({ kind: "not_found" }, null);
      return;
    }
    console.log("user following:");
    result(null, { profileID: profileID });
  });
};

User.unfollowByProfileId = (usuId, profileID, result) => {
  sql.query(`DELETE FROM users_followers WHERE id_follower = ${usuId} AND id_followed = ${profileID}`, 
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
    console.log("unfollowed");
    result(null, res);
  });
};

User.followersByUserId = (usuId, result) => {
  sql.query(`SELECT users_followers.id, users_followers.id_follower, users_followers.id_followed, users.id, users.name, users.lastname, users.username FROM users_followers LEFT JOIN users ON users_followers.id_follower = users.id WHERE users_followers.id_followed = ${usuId}`, 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    //console.log("followers:");
    //result(null, { usuId: usuId });
    result(null, res);
  });
};

User.eventsByUserId = (usuId, result) => {
  sql.query(`SELECT events_invitations.id, events_invitations.id_event_fk, events_invitations.id_user_invited_fk, events_invitations.presence_confirmed, events.id AS eid, events.id_project_fk, events.id_author_fk, events.title, events.description, events.method, events.date_opening, events.hour_opening, events.leader_comments_before, events.id_event_type_fk, events.id_city_fk, events.id_region_fk, cities.id AS cid, cities.name AS city, regions.id AS rid, regions.uf AS region, projects.id AS pid, projects.name AS pname, projects.picture, projects.type, projects_types.id AS ptid, projects_types.name_ptbr AS ptype, users_projects.id AS upid, users_projects.id_project_fk AS uppid, users_projects.id_user_fk, users_projects.confirmed, users_projects.active, events_types.id AS etid, events_types.title_ptbr, places.id AS plid, places.name AS plname, users.id AS uid, users.name AS uname FROM events_invitations LEFT JOIN events ON events_invitations.id_event_fk = events.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects ON users_projects.id_project_fk = events.id_project_fk LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN users ON events.id_author_fk = users.id WHERE events_invitations.id_user_invited_fk = ${usuId} AND users_projects.id_user_fk = ${usuId} AND users_projects.confirmed = 1 AND users_projects.active = 1 ORDER BY events.date_opening ASC`, 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    result(null, res);
  });
};

User.CheckUsernameAvailability = (username, result) => {
  let errorMsg = {message: "Username "+username+" is not available.", available: false}
  sql.query(`SELECT users.username AS username FROM users WHERE users.username = '${username}' LIMIT 1 UNION SELECT projects.username AS username FROM projects WHERE projects.username = '${username}' LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found user: ", res[0]);
      result(null, errorMsg);
      return;
    }
    // not found User with the username
    result({ kind: "not_found" }, null);
  });
};

User.CheckEmailAvailability = (email, result) => {
  let errorMsg = {message: "Email "+email+" already registered", available: false}
  sql.query(`SELECT users.email FROM users WHERE users.email = '${email}' LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found user: ", res[0]);
      result(null, errorMsg);
      return;
    }
    // not found User with the email
    result({ kind: "not_found" }, null);
  });
};

module.exports = User;