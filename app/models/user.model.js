const sql = require("./db.js");
const md5 = require("md5");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

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

// constructor
const User = function(user) {
  this.created = user.created;
  this.modified = user.modified;
  this.name = user.name;
  this.lastname = user.lastname;
  this.email = user.email;
  this.username = user.username;
  this.password = user.password;
  this.random_key = user.random_key;
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created customer: ", { id: res.insertId, ...newUser });
    // result(null, { id: res.insertId, ...newUser });
    var results = {
      id: res.insertId,
      email: newUser.email,
      username: newUser.username,
      status: 1
    }
    const jsontoken = sign({ result: results }, process.env.JWT_SECRET, {
        expiresIn: "30 days" 
    });
    result(null, { id: res.insertId, username: newUser.username, name: newUser.name, lastname: newUser.lastname, email: newUser.email, token: jsontoken });

    var mailOptions = {
      from: `Mublin <${process.env.SMTP_USER_NAME}>`,
      to: newUser.email,
      subject: 'Bem-vindo ao Mublin!',
      html: '<h1>Bem-vindo ao Mublin, '+newUser.name+'!</h1><p>Somos uma plataforma de soluções para artistas que trabalham com música. Estamos felizes em ter você conosco!</p><p>Equipe Mublin</p><p>mublin.com</p>'
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

  });
};

User.loginUserByEmail = (email, result) => {
  if (email.indexOf('@') > -1) {
    var loginQuery = `SELECT u.id, u.password, u.status, u.name, u.lastname, u.username, u.bio, u.gender, u.verified, u.id_country_fk AS countryId, countries.name_ptbr AS country, u.id_region_fk AS region, r.name AS regionName, u.id_city_fk AS city, c.name AS cityName, u.email, u.picture, u.picture_cover, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.first_access, u.public, u.instagram, u.website, u.phone_mobile AS phone, u.phone_mobile_public AS phoneIsPublic, u.status, u.legend_badge, u.availability_status, u.availability_focus, u.level, u.previously_registered FROM users AS u LEFT JOIN countries ON u.id_country_fk = countries.id LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id WHERE u.email = '${email}' LIMIT 1`
  } else {
    var loginQuery = `SELECT u.id, u.password, u.status, u.name, u.lastname, u.username, u.bio, u.gender, u.verified, u.id_country_fk AS countryId, countries.name_ptbr AS country, u.id_region_fk AS region, r.name AS regionName, u.id_city_fk AS city, c.name AS cityName, u.email, u.picture, u.picture_cover, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.first_access, u.public, u.instagram, u.website, u.phone_mobile AS phone, u.phone_mobile_public AS phoneIsPublic, u.status, u.legend_badge, u.availability_status, u.availability_focus, u.level, u.previously_registered FROM users AS u LEFT JOIN countries ON u.id_country_fk = countries.id LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id WHERE u.username = '${email}' LIMIT 1`
  }
  sql.query(loginQuery, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      // console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }
    // not found User with the id
    result({ kind: "not_found" }, null);
  });
};

User.log = (usuId, token, result) => {
  sql.query(`INSERT INTO log_users (id_user_fk, date_login, date_activity, session) VALUES (${usuId}, "${dateTime}", "${dateTime}", "${token}")`, 
  (err, res) => {
    if (err) {
      console.log("error saving log: ", err);
      result(err, null);
      return;
    }

    // console.log("Log saved: ", { id: res.insertId, userId: usuId });
    result(null, { id: res.insertId, userId: usuId });
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
    sql.query(`SELECT u.id, u.name, u.lastname, u.username, u.bio, u.gender, u.verified, u.id_country_fk AS country, u.id_region_fk AS region, r.name AS regionName, u.id_city_fk AS city, c.name AS cityName, u.email, u.picture, u.picture_cover, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.first_access, u.public, u.instagram, u.tiktok, u.website, u.phone_mobile AS phone, u.phone_mobile_public AS phoneIsPublic, u.status, u.legend_badge, u.availability_status, u.availability_focus, u.level, u.previously_registered, u.open_to_work AS openToWork, u.open_to_work_text AS openToWorkText FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id WHERE u.email = '${loggedEmail}' LIMIT 1`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        // console.log("found user: ", res[0]);
        result(null, res[0]);
        return;
      }
      // not found User with the email in the token
      result({ kind: "not_found" }, null);
    });
};

User.getUserInfoGenres = (userId, result) => {
  sql.query(`SELECT ug.id, ug.id_genre_fk AS idGenre, genres.name_ptbr AS name, ug.main_genre AS mainGenre FROM users_genres AS ug LEFT JOIN genres ON ug.id_genre_fk = genres.id WHERE ug.id_user_fk = '${userId}' ORDER BY ug.main_genre DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      // console.log("Found user´s genres: ", res);
      result(null, res);
      return;
    }
    // not found User with the email in the token
    result({ kind: "not_found" }, null);
  });
};

User.getUserInfoRoles = (userId, result) => {
  sql.query(`SELECT users_roles.id, users_roles.id_role_fk AS idRole, roles.name_ptbr AS name, roles.description_ptbr AS description, users_roles.main_activity AS mainActivity, roles.icon FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id WHERE users_roles.id_user_fk = '${userId}' ORDER BY mainActivity DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found user´s genres: ", res);
      result(null, res);
      return;
    }
    // not found User with the email in the token
    result({ kind: "not_found" }, null);
  });
};

User.getUserInfoAvailabilityItems = (userId, result) => {
  sql.query(`SELECT users_availability_items.id, users_availability_items.id_item_fk AS idItem, availability_items.name_ptbr AS name FROM users_availability_items LEFT JOIN availability_items ON users_availability_items.id_item_fk = availability_items.id WHERE users_availability_items.id_user_fk = '${userId}' ORDER BY users_availability_items.id ASC`, (err, res) => {
    if (err) {
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

User.getUserFollowers = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT uf.id, uf.id_follower AS followerId, uf.id_followed AS followedId, u.name, u.lastname, u.username, u.picture, u.verified, u.legend_badge FROM users_followers AS uf LEFT JOIN users AS u ON uf.id_follower = u.id WHERE uf.id_followed = ${x.result.id} AND u.status = 1 ORDER BY uf.id DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found user with the id in the token
    result({ kind: "not_found" }, null);
  });
};

User.getUserFollowing = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT uf.id, uf.id_follower AS followerId, uf.id_followed AS followedId, u.name, u.lastname, u.username, u.picture, u.verified, u.legend_badge FROM users_followers AS uf LEFT JOIN users AS u ON uf.id_followed = u.id WHERE uf.id_follower = ${x.result.id} AND u.status = 1 ORDER BY uf.id DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found user with the id in the token
    result({ kind: "not_found" }, null);
  });
};

User.getUserPlanInfo = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT id, name, lastname, username, email, payment_plan, payment_date_start, payment_date_expire, payment_method, payment_id_fk, payment_service FROM users WHERE id = ${x.result.id} LIMIT 1`, (err, res) => {
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

User.getUserPartners = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT users_partners.id AS keyId, brands.id, brands.name, brands.slug, brands.logo, brands.cover, users_partners.featured, IF(users_partners.type=1,'Endorser', 'Parceiro') AS type, users_partners.since_year AS sinceYear, users_partners.active, DATE_FORMAT(users_partners.created,'%d/%m/%Y às %H:%i:%s') AS created FROM users_partners LEFT JOIN brands ON users_partners.id_brand = brands.id WHERE users_partners.id_user = ${x.result.id} ORDER BY users_partners.featured DESC, users_partners.created DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found user with the id in the token
    result({ kind: "not_found" }, null);
  });
};

User.addUserPartnership = (loggedID, userId, brandId, featured, type, since_year, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`INSERT INTO users_partners (id_user, id_brand, featured, type, since_year) VALUES (${userId}, ${brandId}, ${featured}, ${type}, ${since_year})`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }

        result(null, { userId: userId, brandId: brandId, message: 'Marca parceira adicionada com sucesso!' });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.deleteUserPartnership = (loggedID, userId, userPartnershipId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`DELETE FROM users_partners WHERE id = ${userPartnershipId} AND id_user = ${x.result.id}`, (err, res) => {
      if (err) {
        //console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user partnership with the id
        result({ kind: "not_found" }, null);
        return;
      }
      //console.log("deleted partnership with id: ", userPartnershipId);
      // result(null, res);
      result(null, { message: 'Parceria deletada com sucesso'  });
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.getAll = result => {
  sql.query("SELECT name, lastname, username, email, picture FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("users: ", res);
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
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.bio, users.email, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, users.first_access AS firstAccess, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, countries.name AS country, regions.name AS region, cities.name AS city, users.instagram, users.payment_plan AS plan FROM users LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE users.username = '${username}' AND users.status = 1 LIMIT 1`, (err, res) => {
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
    SELECT users.id, users.name AS title, users.lastname AS extra1, users.username AS extra2, users.status AS extra3, IF(users.payment_plan = 2,'PRO','') AS price, IF(troles.rolename IS NOT NULL,troles.rolename,'Usuário') AS description, IF(users.picture IS NOT NULL,CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture),'') AS image, 'Usuário' as category FROM users LEFT JOIN 
    (SELECT users_roles.id_user_fk,
            users_roles.id_role_fk,
            users_roles.main_activity, roles.id AS rid, roles.name_ptbr AS rolename, roles.description_ptbr AS roledesc 
            FROM users_roles LEFT JOIN roles ON users_roles.id_role_fk = roles.id 
            WHERE users_roles.main_activity = 1 
    ) AS troles
    ON users.id = troles.id_user_fk
    WHERE name LIKE '%${keyword}%' OR lastname LIKE '%${keyword}%' OR troles.rolename LIKE '%${keyword}%' OR troles.roledesc LIKE '%${keyword}%' GROUP BY users.id HAVING status = 1 UNION 

    SELECT p.id, p.name AS title, p.username AS extra, p.public AS extra2, p.foundation_year AS extra3, '' AS price, projects_types.name_ptbr AS description, IF(p.picture IS NOT NULL,CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.id,'/',p.picture),'') AS image, 'Projeto' as category FROM projects AS p LEFT JOIN projects_types ON p.type = projects_types.id WHERE p.name LIKE '%${keyword}%' OR p.username LIKE '%${keyword}%' HAVING p.public = 1 UNION 

    SELECT events.id, events.title, events.description AS extra, events.date_opening AS extra2, events.showable_on_site AS extra3, DATE_FORMAT(events.date_opening,"%d/%m/%Y") AS price, CONCAT('Evento de ',tprojects.name) AS description, events.picture AS image, 'Evento' as category FROM events LEFT JOIN 
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
      // console.log("result: ", res);
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
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      // not found profile with the userId
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
  sql.query(`SELECT events_invitations.id AS invitationId, events_invitations.response AS response, events.id AS eventId, users.name AS authorName, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',events.id_author_fk,'/',users.picture) AS authorPicture, users.username AS authorUsername, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS eventDateStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS eventDateEnd, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.leader_comments_before AS authorComments, events.picture AS eventPicture, cities.name AS city, regions.uf AS region, projects.username AS projectUsername, projects.name AS projectName, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/','/',projects.picture) AS projectPicture, projects_types.name_ptbr AS projectType, events.id_event_type_fk AS eventTypeId, events_types.title_ptbr AS eventType, places.id AS placeId, places.name AS placeName FROM events_invitations LEFT JOIN events ON events_invitations.id_event_fk = events.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects ON users_projects.id_project_fk = events.id_project_fk LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN users ON events.id_author_fk = users.id WHERE events_invitations.id_user_invited_fk = ${usuId} AND users_projects.id_user_fk = ${usuId} AND users_projects.confirmed = 1 ORDER BY events.date_opening ASC LIMIT 5`, 
  (err, res) => {
    if (err) {
      console.log("error: ", err);
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

User.eventInvitationResponse = (loggedID, userId, invitationId, response, response_modified, response_comments, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE events_invitations SET response = ${response}, response_modified = '${response_modified}', response_comments = '${response_comments}' WHERE id = ${invitationId} AND id_user_invited_fk = ${userId}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        result(null, { invitationId: invitationId, success: true });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.CheckUsernameAvailability = (username, result) => {
  let errorMsg = {message: "Username "+username+" is not available.", available: false}
  // sql.query(`SELECT users.username AS username FROM users WHERE users.username = '${username}' LIMIT 1 UNION SELECT projects.username AS username FROM projects WHERE projects.username = '${username}' LIMIT 1`, (err, res) => {
  sql.query(`
    SELECT u.username FROM users AS u WHERE u.username = '${username}' LIMIT 1; 
    SELECT ss.name FROM system_slugs AS ss WHERE ss.name = '${username}' LIMIT 1; 
    SELECT b.slug FROM brands AS b WHERE b.slug = '${username}' LIMIT 1; 
  `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (results[0].length || results[1].length || results[2].length) {
      // console.log("found user: ", results[0]);
      // console.log("found slug: ", results[1]);
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

User.activateByHash = (email, hash, result) => {
  sql.query(
    "UPDATE users SET status = 1 WHERE email = ? AND random_key = ?",
    [email, hash],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log(`successfully activated user: ${email}`);
      result(null, { email: email, activated: true });
    }
  );
};

User.updatePictureById = (loggedID, id, picture, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == id) {
    sql.query(`UPDATE users SET picture = '${picture}' WHERE id = ${id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found Customer with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("updated user: ", { id: id, picture: picture });
        result(null, { id: id, picture: picture });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.updateFirstAccessById = (loggedID, id, step, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == id) {
    sql.query(`UPDATE users SET first_access = '${step}' WHERE id = ${id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found Customer with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("updated user: ", { id: id, step: step });
        result(null, { id: id, step: step });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.updateStep2ById = (loggedID, id, gender, bio, website, instagram, id_country_fk, id_region_fk, id_city_fk, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == id) {
    sql.query(`UPDATE users SET gender = '${gender}', bio = '${bio}', website = '${website}', instagram = '${instagram}', id_country_fk = '${id_country_fk}', id_region_fk = '${id_region_fk}', id_city_fk = '${id_city_fk}' WHERE id = ${id}`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("updated user: ", { id: id });
        result(null, { id: id });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.addUsersMusicGenre = (loggedID, userId, musicGenreId, musicGenreMain, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`INSERT INTO users_genres (id_user_fk, id_genre_fk, main_genre) VALUES (${userId}, ${musicGenreId}, ${musicGenreMain})`, (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("added music genre to user: ", { userId: userId, musicGenreId: musicGenreId });
        result(null, { userId: userId, musicGenreId: musicGenreId });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.deleteUsersMusicGenre = (loggedID, userId, userGenreId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`DELETE FROM users_genres WHERE id = ${userGenreId}`, (err, res) => {
      if (err) {
        //console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user genre with the id
        result({ kind: "not_found" }, null);
        return;
      }
      //console.log("deleted user genre with id: ", userGenreId);
      result(null, res);
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.addUsersRole = (loggedID, userId, roleId, roleMain, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`INSERT INTO users_roles (id_user_fk, id_role_fk, main_activity) VALUES (${userId}, ${roleId}, ${roleMain})`, (err, res) => {
        if (err) {
          //console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }

        //console.log("added role to user: ", { userId: userId, roleId: roleId });
        result(null, { userId: userId, roleId: roleId, roleMain: roleMain  });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.deleteUsersRole = (loggedID, userId, userRoleId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`DELETE FROM users_roles WHERE id = ${userRoleId}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user role with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("deleted user role with id: ", userRoleId);
      result(null, res);
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.addUsersProject = (loggedID, userId, projectId, status, main_role_fk, joined_in, left_in, active, leader, featured, confirmed, admin, portfolio, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`INSERT INTO users_projects (id_user_fk, id_project_fk, active, status, main_role_fk, joined_in, left_in, leader, featured, confirmed, admin, portfolio) VALUES (${userId}, ${projectId}, ${active}, ${status}, ${main_role_fk}, ${joined_in}, ${left_in}, ${leader}, ${featured}, ${confirmed}, ${admin}, ${portfolio})`, (err, res) => {
        if (err) {
          //console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }

        //console.log("added project to user: ", { userId: userId, roleId: roleId });
        result(null, { userId: userId, projectId: projectId, success: true });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.deleteUsersProject = (loggedID, userId, userProjectParticipationId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`DELETE FROM users_projects WHERE id = ${userProjectParticipationId}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user role with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("deleted user´s project participation with id: ", userProjectParticipationId);
      result(null, res);
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.updatePreferencesinProject = (loggedID, projectId, status, featured, portfolio, joined_in, left_in, touring, show_on_profile, main_role_fk, second_role_fk, third_role_fk, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_projects SET status = ${status}, featured = ${featured}, portfolio = ${portfolio}, joined_in = ${joined_in}, left_in = ${left_in}, touring = ${touring}, show_on_profile = ${show_on_profile}, main_role_fk = ${main_role_fk}, second_role_fk = ${second_role_fk}, third_role_fk = ${third_role_fk} WHERE id_project_fk = ${projectId} AND id_user_fk = ${x.result.id}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated project: ", { userId: x.result.id, projectId: projectId });
      result(null, { success: true, userId: x.result.id, projectId: projectId, status: status, featured: featured, portfolio: portfolio, joined_in: joined_in, left_in: left_in, touring: touring, show_on_profile: show_on_profile, main_role_fk: main_role_fk, second_role_fk: second_role_fk, third_role_fk: third_role_fk });
    }
  );
};

User.findNotesByLoggedUserId = (loggedID, userId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`SELECT notes.id AS noteId, DATE_FORMAT(notes.created,'%d/%m/%Y às %H:%i:%s') AS noteCreated, UNIX_TIMESTAMP(notes.created) AS created, notes.id_user_owner AS ownerId, notes.id_project AS projectId, notes.title AS noteTitle, notes.description AS noteDescription, CONCAT (users.name,' ',users.lastname) AS ownerName, users.picture AS ownerPicture, users.username AS ownerUsername, projects.name AS projectName, projects.username AS projectUsername, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',notes.id_project,'/',projects.picture) AS projectPicture FROM notes LEFT JOIN users ON users.id = notes.id_user_owner LEFT JOIN projects ON projects.id = notes.id_project WHERE notes.id_user_owner = ${userId} OR notes.id IN (SELECT id_note FROM note_association WHERE id_user_associated = ${userId}) ORDER BY notes.created DESC`, (err, res) => {
      if (err) {
        result(err, null);
        return;
      }
      if (res.length) {
        result(null, res);
        return;
      }
      // not found notes with the logged userId
      result({ kind: "not_found" }, null);
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.findNoteById = (loggedID, noteID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)

    sql.query(`SELECT notes.id AS noteId, DATE_FORMAT(notes.created,'%d/%m/%Y às %H:%i:%s') AS noteCreated, notes.id_user_owner AS ownerId, notes.id_project AS projectId, notes.title AS noteTitle, notes.description AS noteDescription, CONCAT (users.name,' ',users.lastname) AS ownerName, users.picture AS ownerPicture, users.username AS ownerUsername, projects.name AS projectName, projects.username AS projectUsername, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',notes.id_project,'/',projects.picture) AS projectPicture FROM notes LEFT JOIN users ON users.id = notes.id_user_owner LEFT JOIN projects ON projects.id = notes.id_project WHERE notes.id_user_owner = ${x.result.id} OR notes.id IN (SELECT id_note FROM note_association WHERE id_user_associated = ${x.result.id}) HAVING notes.id = ${noteID} ORDER BY notes.created DESC LIMIT 1`, (err, res) => {
      if (err) {
        // console.log("error: ", err);
        result(err, null);
        return;
      }
      if (res.length) {
        // console.log("found note: ", res[0]);
        result(null, res[0]);
        return;
      }
      // not found Note with the id
      result({ kind: "not_found" }, null);
    });
};

// START SETTINGS MENU UPDATES

User.updateBasicInfo = (loggedID, userId, name, lastname, email, phone_mobile, phone_mobile_public, website, instagram, tiktok, gender, bio, id_country_fk, id_region_fk, id_city_fk, public, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE users SET name = '${name}', lastname = '${lastname}', email = '${email}', phone_mobile = '${phone_mobile}', phone_mobile_public = '${phone_mobile_public}',  website = '${website}', instagram = '${instagram}', tiktok = '${tiktok}', gender = '${gender}', bio = '${bio}', id_country_fk = '${id_country_fk}', id_region_fk = '${id_region_fk}', id_city_fk = '${id_city_fk}', public = '${public}', modified = '${dateTime}' WHERE id = ${userId}`, (err, res) => {
        if (err) {
          //console.log("error: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }
        // console.log("updated user: ", { userId: userId });
        result(null, { userId: userId, success: true });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.updateAvailabilityStatus = (loggedID, userId, availabilityStatusId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE users SET availability_status = '${availabilityStatusId}' WHERE id = ${userId}`, (err, res) => {
        if (err) {
          result(null, err);
          return;
        }
        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, { userId: userId, availabilityStatus: availabilityStatusId, success: true });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.addUserAvailabilityItem = (loggedID, userId, availabilityItemId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`INSERT INTO users_availability_items (id_user_fk, id_item_fk) VALUES (${userId}, ${availabilityItemId})`, (err, res) => {
        if (err) {
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, { userId: userId, item: availabilityItemId  });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.deleteUserAvailabilityItem = (loggedID, userId, userItemId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`DELETE FROM users_availability_items WHERE id_item_fk = ${userItemId} AND id_user_fk = ${userId}`, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("deleted user availability item with id: ", userItemId);
      result(null, res);
    });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.updateAvailabilityFocus = (loggedID, userId, availabilityFocus, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE users SET availability_focus = '${availabilityFocus}' WHERE id = ${userId}`, (err, res) => {
        if (err) {
          result(null, err);
          return;
        }
        if (res.affectedRows == 0) {
          // not found user with the id
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, { userId: userId, availabilityFocus: availabilityFocus, success: true });
      }
    );
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.gear = (loggedID, userId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
  sql.query(`SELECT users_gear.id, users_gear.featured, users_gear.for_sale AS forSale, users_gear.price, users_gear.currently_using AS currentlyUsing, users_gear.id_product AS productId, users_gear.is_subproduct, users_gear.parent_product_id, it.id AS tuningId, it.name_ptbr AS tuningName, it.description AS tuningDescription, users_gear.owner_comments AS ownerComments, brands.name AS brandName, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',brands.logo) AS brandLogo, products.name AS productName, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-200,w-200,cm-pad_resize,bg-FFFFFF/',products.picture) AS picture, products.id_brand AS brandId, products_categories.name_ptbr AS category, LOWER(products_categories.macro_category_en) AS macroCategory FROM users_gear LEFT JOIN products ON users_gear.id_product = products.id LEFT JOIN brands ON products.id_brand = brands.id LEFT JOIN products_categories ON products.id_category = products_categories.id LEFT JOIN instrument_tunings AS it ON users_gear.tuning = it.id WHERE users_gear.id_user = ${userId} ORDER BY users_gear.featured DESC, users_gear.currently_using DESC, users_gear.created DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found gear for logged userID
    result({ kind: "not_found" }, null);
  });
  } else {
    result({ kind: "unauthorized" }, null);
    return;
  }
};

User.addGearItem = (loggedID, productId, featured, for_sale, price, currently_using, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_gear (id_user, id_product, featured, for_sale, price, currently_using) VALUES (${x.result.id}, ${productId}, ${featured}, ${for_sale}, ${price}, ${currently_using})`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: x.result.id, productId: productId, featured: featured, for_sale: for_sale, price: price, currently_using: currently_using, message: 'Product added successfully to user gear'  });
    }
  );
};

User.addGearItemFull = (loggedID, productId, featured, forSale, price, currentlyUsing, tuning, ownerComments, colorId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_gear (id_user, id_product, featured, for_sale, price, currently_using, tuning, owner_comments, id_color) VALUES (${x.result.id}, ${productId}, ${featured}, ${forSale}, ${price ? price : null}, ${currentlyUsing}, ${tuning ? tuning : null}, ${ownerComments ? "'"+ownerComments+"'" : null}, ${colorId ? colorId : null})`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: x.result.id, productId: productId, featured: featured, for_sale: forSale, price: price, currently_using: currentlyUsing, message: 'Product added successfully to user gear'  });
    }
  );
};

User.addGearSubItem = (loggedID, parentId, productId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO users_gear (id_user, is_subproduct, parent_product_id, id_product) VALUES (${x.result.id}, 1, ${parentId}, ${productId})`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: x.result.id, productId: productId, message: 'Subproduto adicionado com sucesso ao equipamento'  });
    }
  );
};

User.updateGearItem = (loggedID, itemId, productId, featured, for_sale, price, currently_using, tuning, owner_comments, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_gear SET featured = ${featured}, for_sale = ${for_sale}, price = ${price}, currently_using = ${currently_using}, tuning = ${tuning}, owner_comments = '${owner_comments}' WHERE id = ${itemId} AND id_product = ${productId} AND id_user = ${x.result.id}`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: x.result.id, itemId: itemId, featured: featured, for_sale: for_sale, price: price, currently_using: currently_using, success: true, message: 'User gear updated successfully' });
    }
  );
};

User.deleteGearItem = (loggedID, userGearId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_gear WHERE users_gear.id = ${userGearId} AND users_gear.id_user = ${x.result.id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user gear with id: ", userGearId);
    result(null, res);
  });
};

User.forgotPassword = (email, result) => {
  sql.query(`UPDATE users SET random_key = '${md5(dateTime+process.env.FORGOT_EMAIL_KEY+email)}' WHERE users.email = '${email}'`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        // not found user with the username or email
        result({ kind: "not_found" }, null);
        return;
      }
      // start sending email
      var mailOptions = {
        from: `Mublin <${process.env.SMTP_USER_NAME}>`,
        to: email,
        subject: '[Mublin] Definir nova senha',
        html: '<h1>Mublin</h1><p>Olá! Foi solicitada a recuperação de sua senha através do mublin.com.</p><p><a href="https://mublin.com/login/redefine-password?hash='+md5(dateTime+process.env.FORGOT_EMAIL_KEY+email)+'&email='+email+'" target="_blank">Clique aqui para redefinir sua senha</a></p>'
      };

      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
      // end sending email
      result(null, { success: true, message: 'Email de refinição de senha enviado com sucesso para '+email });
    }
  );
};

User.changePassword = (loggedID, userId, newPassword, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE users SET password = '${newPassword}' WHERE id = ${userId} AND id = ${x.result.id}`, (err, res) => {
        if (err) {
          result(null, err);
          return;
        }
        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, { userId: userId, success: true });
      }
    );
  } else {
    result({ kind: "Unauthorized" }, null);
    return;
  }
};

// Forgot password
User.changePasswordbyHash = (email, hash, newPassword, result) => {
  sql.query(`UPDATE users SET password = '${newPassword}' WHERE email = '${email}' AND random_key = '${hash}'`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { email: email, success: true, message: "Password updated" });
    }
  );
};

User.changeEmail = (loggedID, userId, newEmail, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  if (x.result.id == userId) {
    sql.query(`UPDATE users SET email = '${newEmail}' WHERE id = ${userId}`, (err, res) => {
        if (err) {
          result(null, err);
          return;
        }
        if (res.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }
        result(null, { userId: userId, success: true });
      }
    );
  } else {
    result({ kind: "Unauthorized" }, null);
    return;
  }
};

User.getProjectPreferences = (loggedID, projectUsername, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT projects.id AS projectId, projects.name, projects.username, projects.type, projects_types.name_ptbr AS typeName, projects.foundation_year, projects.end_year, users_projects.admin, users_projects.status, users_projects_status.title_ptbr AS statusName, users_projects.confirmed, users_projects.featured, users_projects.portfolio, users_projects.joined_in, users_projects.left_in, users_projects.touring, users_projects.show_on_profile, users_projects.main_role_fk, r1.name_ptbr AS role1, users_projects.second_role_fk, r2.name_ptbr AS role2, users_projects.third_role_fk, r3.name_ptbr AS role3 FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE projects.username = '${projectUsername}' AND users_projects.id_user_fk = ${x.result.id} LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      // console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }
    // not found related project with the projectUsername
    result({ kind: "not_found" }, null);
  });
};

User.checkProjectAdmin = (loggedID, projectUsername, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  // let msg = {project: projectUsername, accessible: 1}
  sql.query(`SELECT users_projects.confirmed, users_projects.admin, users_projects.active, users_projects.leader FROM users_projects WHERE users_projects.id_project_fk = (SELECT projects.id FROM projects WHERE projects.username = '${projectUsername}') AND users_projects.id_user_fk = ${x.result.id} LIMIT 1`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      // console.log(904, res)
      result(null, res[0]);
      return;
    }
    // not found project with the username
    result({ kind: "not_found" }, null);
  });
};

User.getLastConnectedFriends = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`
      SELECT u.id, u.name, u.lastname, u.username, u.picture, MAX(log_users.date_login) AS lastLogin FROM log_users
      LEFT JOIN users u ON log_users.id_user_fk = u.id
      WHERE u.id IS NOT NULL AND u.id <> ${x.result.id} AND u.status = 1 AND log_users.id_user_fk = (SELECT users_followers.id_followed FROM users_followers WHERE users_followers.id_follower = ${x.result.id} AND users_followers.id_followed = log_users.id_user_fk)
      GROUP BY u.id
      ORDER BY MAX(log_users.date_login) DESC
      LIMIT 20
    `, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found friends logs
    result({ kind: "not_found" }, null);
  });
};

User.newPost = (loggedID, text, image, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO feed (id_user_1_fk, extra_text, image, id_feed_type_fk) VALUES (${x.result.id}, '${text}', '${image}', ${8})`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found user with the id
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: x.result.id, success: true, message: 'New post submitted successfully!'  });
    }
  );
};

User.deletePost = (loggedID, postId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM feed WHERE feed.id = ${postId} AND feed.id_user_1_fk = ${x.result.id}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user post with id: ", postId);
    result(null, res);
  });
};

module.exports = User;