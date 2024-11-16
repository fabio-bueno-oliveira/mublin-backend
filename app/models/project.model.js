const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Project = function(project) {
  this.name = project.name;
  this.username = project.username;
  this.picture = project.picture;
  this.foundation_year = project.foundation_year;
  this.end_year = project.end_year;
  this.bio = project.bio;
  this.type = project.type;
  this.kind = project.kind;
  this.public = project.public;
  this.id_user_creator_fk = project.id_user_creator_fk;
};

// find users, projects or events by keyword
Project.findProjectsByKeyword = (keyword, result) => {
  sql.query(`
    SELECT projects.id, projects.name, projects.username, projects.bio, projects.foundation_year, cities.name AS city, regions.name AS region, countries.name AS country, genres.name AS genre FROM projects LEFT JOIN cities ON projects.id_city_fk = cities.id LEFT JOIN regions ON projects.id_region_fk = regions.id LEFT JOIN countries ON projects.id_country_fk = countries.id LEFT JOIN genres ON projects.id_genre_1_fk = genres.id WHERE public = 1 HAVING name LIKE '%${keyword}%' OR username LIKE '%${keyword}%' ORDER BY name ASC`, (err, res) => {
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

// find projects by keyword
Project.findProjectByKeyword = (keyword, result) => {
  sql.query(`
  SELECT p.id, p.name AS title, CONCAT(genres.name,' - ',cities.name,'/',regions.uf) AS description, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS image, p.foundation_year, p.end_year FROM projects AS p LEFT JOIN cities ON p.id_city_fk = cities.id LEFT JOIN regions ON p.id_region_fk = regions.id LEFT JOIN genres ON p.id_genre_1_fk = genres.id LEFT JOIN projects_types ON p.type = projects_types.id WHERE p.name LIKE '%${keyword}%' ORDER BY p.name ASC`, (err, res) => {
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

Project.getAll = result => {
  sql.query("SELECT * FROM projects", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("projects: ", res);
    result(null, res);
  });
};

Project.findById = (projectId, result) => {
  sql.query(`SELECT * FROM projects WHERE id = ${projectId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found project: ", res[0]);
      result(null, res[0]);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.findByUsername = (projectUsername, result) => {
  sql.query(`
  SELECT projects.id, projects.name, projects.old_name AS oldName, projects.username, projects.picture, projects.created, projects.foundation_year AS foundationYear, projects.end_year AS endDate, projects.bio, projects.purpose, projects.spotify_uri AS spotifyUri, projects.type AS typeId, projects_types.name_ptbr AS typeName, genre1.name AS genre1, genre2.name AS genre2, genre3.name AS genre3, countries.name AS country, regions.name AS region, cities.name AS city, label_show AS labelShow, label_text AS labelText, label_color AS labelColor, public 
  FROM projects 
  LEFT JOIN projects_types ON projects.type = projects_types.id 
  LEFT JOIN genres AS genre1 ON projects.id_genre_1_fk = genre1.id 
  LEFT JOIN genres AS genre2 ON projects.id_genre_2_fk = genre2.id 
  LEFT JOIN genres AS genre3 ON projects.id_genre_3_fk = genre3.id 
  LEFT JOIN countries ON projects.id_country_fk = countries.id 
  LEFT JOIN regions ON projects.id_region_fk = regions.id 
  LEFT JOIN cities ON projects.id_city_fk = cities.id 
  WHERE projects.username = '${projectUsername}'`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found project: ", res[0]);
      result(null, res[0]);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.relatedProjects = (projectId, projectCity, projectMainGenre, result) => {
  sql.query(`SELECT projects.id, projects.name, projects.username, projects.picture FROM projects LEFT JOIN cities ON cities.name = '${projectCity}' LEFT JOIN genres ON genres.name = '${projectMainGenre}' WHERE projects.id_city_fk = cities.id OR projects.id_genre_1_fk = genres.id AND projects.id <> ${projectId} ORDER BY RAND() LIMIT 3`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Related Projects: ", res);
    result(null, res);
  });
};

Project.findAllByUser = (userId, type, result) => {

  function filterType (type) {
    switch(type) {
      case 'all':
        return '0,1'
      case 'main':
        return '0'
      case 'portfolio':
        return '1'
      default:
        return '0,1'
    }
  }

  sql.query(`SELECT usrsprjcts.id, usrsprjcts.confirmed, usrsprjcts.status, usrsprjcts.active, usrsprjcts.admin, usrsprjcts.featured, usrsprjcts.joined_in, usrsprjcts.left_in AS yearLeftTheProject, usrsprjcts.show_on_profile AS showOnProfile, usrsprjcts.touring AS touringWithThisBand, usrsprjcts.main_role_fk, usrsprjcts.portfolio, usrsprjcts.created, prjct.id AS projectid, prjct.name, prjct.username, prjct.type, prjct.picture, prjct.foundation_year AS yearFoundation, prjct.end_year AS yearEnd, prjct.label_show AS labelShow, prjct.label_color AS labelColor, prjct.label_text AS labelText, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, g1.name AS genre1, g2.name AS genre2, g3.name AS genre3, events.id AS nextEventId, events.title AS nextEventTitle, events.date_opening AS nextEventDateOpening, events.hour_opening AS nextEventHourOpening, events_invitations.id AS nextEventInvitationId, events_invitations.response AS nextEventInvitationResponse, DATE_FORMAT(events_invitations.created,'%d/%m/%Y às %H:%i:%s') AS nextEventInvitationDate, events_invitations.name AS nextEventInvitationNameWhoInvited, events_invitations.username AS nextEventInvitationUsernameWhoInvited, events_invitations.picture AS nextEventInvitationPictureWhoInvited, events_invitations.id_user_who_invited_fk AS nextEventInvitationUserIdWhoInvited, projects_goals.goal_date AS nextGoalDate, projects_goals.goal_description AS nextGoalDescription, projects_goals.completed AS nextGoalCompleted, projects_goals_user.goal_date AS nextUserGoalDate, projects_goals_user.goal_description AS nextUserGoalDescription, projects_goals_user.completed AS nextUserGoalCompleted, cities.name AS cityName, regions.name AS regionName, regions.uf AS regionUf, project_notes.note AS leaderLastNote, project_notes.note_date AS leaderLastNoteDate, project_notes.authorId AS leaderLastNoteAuthorId, project_notes.username AS leaderLastNoteUsername, project_notes.name AS leaderLastNoteName, project_notes.picture AS leaderLastNotePicture, projects_status.id AS activityStatusId, projects_status.description_ptbr AS activityStatus, projects_status.color AS activityStatusColor, prjct.currentlyOnTour AS projectCurrentlyOnTour 

  FROM users_projects AS usrsprjcts
  
  LEFT JOIN projects AS prjct ON usrsprjcts.id_project_fk = prjct.id 
  LEFT JOIN projects_types ON prjct.type = projects_types.id 
  LEFT JOIN cities ON prjct.id_city_fk = cities.id 
  LEFT JOIN regions ON prjct.id_region_fk = regions.id 
  LEFT JOIN users_projects_relationship ON usrsprjcts.status = users_projects_relationship.id 
  LEFT JOIN roles AS r1 ON usrsprjcts.main_role_fk = r1.id 
  LEFT JOIN roles AS r2 ON usrsprjcts.second_role_fk = r2.id 
  LEFT JOIN roles AS r3 ON usrsprjcts.third_role_fk = r3.id 
  LEFT JOIN genres AS g1 ON prjct.id_genre_1_fk = g1.id 
  LEFT JOIN genres AS g2 ON prjct.id_genre_2_fk = g2.id 
  LEFT JOIN genres AS g3 ON prjct.id_genre_3_fk = g3.id 
  LEFT JOIN (SELECT id_project_fk, id, title, DATE_FORMAT(date_opening,'%d/%m/%Y') AS date_opening, hour_opening FROM events WHERE date_opening >= CURDATE() ORDER BY date_opening ASC) AS events ON prjct.id = events.id_project_fk 
  LEFT JOIN (SELECT events_invitations.id, events_invitations.response, events_invitations.id_event_fk, events_invitations.created, events_invitations.id_user_who_invited_fk, users.name, users.picture, users.username FROM events_invitations 
  LEFT JOIN users ON events_invitations.id_user_who_invited_fk = users.id) AS events_invitations ON events.id = events_invitations.id_event_fk 
  LEFT JOIN (SELECT id_project, DATE_FORMAT(goal_date,'%d/%m/%Y') AS goal_date, goal_description, completed FROM projects_goals WHERE goal_date >= CURDATE() ORDER BY goal_date DESC) AS projects_goals ON prjct.id = projects_goals.id_project 
  LEFT JOIN (SELECT id_project, id_user, DATE_FORMAT(goal_date,'%d/%m/%Y') AS goal_date, goal_description, completed FROM projects_goals WHERE goal_date >= CURDATE() AND id_user = ${userId} ORDER BY goal_date DESC) AS projects_goals_user ON prjct.id = projects_goals_user.id_project 
  LEFT JOIN (SELECT id_project, DATE_FORMAT(project_notes.created,'%d/%m/%Y') AS note_date, note, users.id AS authorId, users.name, users.picture, users.username FROM project_notes LEFT JOIN users ON project_notes.id_author = users.id ORDER BY project_notes.created DESC LIMIT 1) AS project_notes ON prjct.id = project_notes.id_project 
  LEFT JOIN projects_status ON prjct.activity_status = projects_status.id 

  WHERE usrsprjcts.id_user_fk = ${userId} AND usrsprjcts.confirmed IN(0,1,2) AND prjct.id IS NOT NULL AND usrsprjcts.portfolio IN(${filterType(type)}) 
  
  GROUP BY usrsprjcts.id 
  
  ORDER BY prjct.end_year IS NOT NULL ASC, usrsprjcts.left_in IS NOT NULL ASC, usrsprjcts.confirmed DESC, usrsprjcts.featured DESC, usrsprjcts.joined_in DESC, usrsprjcts.status ASC, prjct.name ASC, events.date_opening DESC;

  SELECT usrsprjcts.confirmed, usrsprjcts.joined_in, usrsprjcts.left_in, usrsprjcts.portfolio, projects.id AS projectid, projects.name, projects.username FROM users_projects AS usrsprjcts LEFT JOIN projects ON usrsprjcts.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_relationship ON usrsprjcts.status = users_projects_relationship.id WHERE usrsprjcts.id_user_fk = ${userId} AND usrsprjcts.confirmed IN(0,1,2) AND projects.id IS NOT NULL GROUP BY usrsprjcts.id ORDER BY projects.end_year IS NOT NULL ASC, usrsprjcts.left_in IS NOT NULL ASC, usrsprjcts.confirmed DESC, usrsprjcts.featured DESC, usrsprjcts.joined_in DESC, usrsprjcts.status ASC, projects.name ASC;
  
  SELECT users.id AS userId, users.name AS userName, users.lastname AS userLastname, users_projects.active, users.username AS userUsername, users.picture AS userPicture, projects.id AS projectId, projects.username AS projectUsername, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, users_projects.leader FROM users_projects LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id WHERE users_projects.confirmed = 1 AND users_projects.id_project_fk IN (SELECT projects.id FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1,2) AND projects.id IS NOT NULL GROUP BY users_projects.id) ORDER BY users.id = ${userId} DESC, users.name ASC;
  
  `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (results.length) {
      // console.log("User Projects: ", res);
      result(null, results);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.findMainByUser = (userId, result) => {
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1) AND users_projects.portfolio = 0 ORDER BY users_projects.status ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("projects: ", res);
      result(null, res);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.findPortfolioByUser = (userId, result) => {
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1) AND users_projects.portfolio = 1 ORDER BY users_projects.status ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("projects: ", res);
      result(null, res);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.getMembersByProjectId = (userId, result) => {
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.admin, users_projects.leader, users_projects.active, users_projects.touring, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.portfolio = 1 ORDER BY users_projects.status ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.create = (newProject, result) => {
  sql.query("INSERT INTO projects SET ?", newProject, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created project: ", { id: res.insertId, ...newProject });
    result(null, { id: res.insertId, ...newProject });
  });
};

Project.CheckProjectUsernameAvailability = (username, result) => {
  let errorMsg = {message: "Project username "+username+" is not available.", available: false}
  sql.query(`SELECT projects.username AS username FROM projects WHERE projects.username = '${username}' LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found username: ", res[0]);
      result(null, errorMsg);
      return;
    }
    // not found project with the username
    result({ kind: "not_found" }, null);
  });
};

Project.updatePictureById = (projectId, userId, picture, result) => {
  sql.query(`UPDATE projects SET picture = '${picture}' WHERE id = (SELECT id_project_fk FROM users_projects WHERE id_project_fk = ${projectId} AND id_user_fk = ${userId} AND confirmed = 1)`, (err, res) => {
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

      console.log("updated project: ", { projectId: projectId, picture: picture });
      result(null, { projectId: projectId, picture: picture, message: 'success' });
    }
  );
};

Project.updateById = (id, project, result) => {
  sql.query(
    "UPDATE projects SET email = ?, name = ?, active = ? WHERE id = ?",
    [project.email, project.name, project.active, id],
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
      console.log("updated project: ", { id: id, ...project });
      result(null, { id: id, ...project });
    }
  );
};

Project.getMembers = (projectUsername, result) => {
  sql.query(`SELECT users_projects.id_user_fk AS id, users_projects.id_project_fk AS projectId, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, users_projects.confirmed, users.name, users.lastname, users.username, users.picture AS picture, users.bio, role1.name_ptbr AS role1, role2.name_ptbr AS role2, role3.name_ptbr AS role3, projects.name AS projectName, projects.username AS projectUsername, users_projects_relationship.id AS statusId, users_projects_relationship.title_ptbr AS statusName, users_projects_relationship.icon AS statusIcon, users_projects.admin, users_projects.active, users_projects.leader, users_projects.touring FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles AS role1 ON users_projects.main_role_fk = role1.id LEFT JOIN roles AS role2 ON users_projects.second_role_fk = role2.id LEFT JOIN roles AS role3 ON users_projects.third_role_fk = role3.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE projects.username = '${projectUsername}' AND users_projects.status IN(1,2,3,4,5) AND users.name IS NOT NULL ORDER BY users_projects.admin DESC, users_projects.leader DESC, users.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("members: ", res);
      result(null, res);
      return;
    }
    // not found members with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.getMembersByProjectId = (projectId, result) => {
  sql.query(`SELECT users_projects.id_user_fk AS id, users_projects.id_project_fk AS projectId, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, users.name, users.lastname, users.username, users.picture AS picture, users.bio, role1.name_ptbr AS role1, role2.name_ptbr AS role2, role3.name_ptbr AS role3, projects.name AS projectName, projects.username AS projectUsername, users_projects_relationship.id AS statusId, users_projects_relationship.title_ptbr AS statusName, users_projects_relationship.icon AS statusIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles AS role1 ON users_projects.main_role_fk = role1.id LEFT JOIN roles AS role2 ON users_projects.second_role_fk = role2.id LEFT JOIN roles AS role3 ON users_projects.third_role_fk = role3.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE projects.id = '${projectId}' AND users_projects.confirmed = 1 AND users_projects.left_in IS NULL AND users_projects.status IN(1,2,3,4) ORDER BY users_projects.leader DESC, users.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("members: ", res);
      result(null, res);
      return;
    }
    // not found members with the project id
    result({ kind: "not_found" }, null);
  });
};

Project.getOfficialMembers = (projectUserName, result) => {
  sql.query(`SELECT users_projects.id_user_fk AS user_id, users_projects.id_project_fk AS project_id, users_projects.joined_in, users.name, users.lastname, users.username, users.picture AS user_picture, users.bio, roles.name_ptbr AS role, projects.name AS project_name, projects.username AS project_username FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles ON users_projects.main_role_fk = roles.id WHERE projects.username = '${projectUserName}' AND users_projects.confirmed = 1 AND users_projects.portfolio = 0 AND users_projects.left_in IS NULL AND users_projects.status IN(1,3,4) ORDER BY users_projects.leader DESC, users.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("members: ", res);
      result(null, res);
      return;
    }
    // not found official members with the project id
    result({ kind: "not_found" }, null);
  });
};

Project.getEvents = (projectUsername, result) => {
  sql.query(`SELECT events.id, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, events.price, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS dateOpening, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS dateEnd, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.picture, users.name AS authorName, users.lastname AS authorLastname, users.username AS authorUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',events.id_author_fk,'/',users.picture) AS authorPicture, cities.name AS city, regions.uf AS region, events.id_event_type_fk AS typeId, events_types.title_ptbr AS type, places.id AS placeId, places.name AS placeName, events_purposes.name_ptbr AS purpose FROM events LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN users ON events.id_author_fk = users.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN events_purposes ON events.id_event_purpose_fk = events_purposes.id WHERE projects.username = '${projectUsername}' AND events.date_opening >= CURDATE() ORDER BY events.date_opening ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found future events with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.getAllEvents = (projectUsername, result) => {
  sql.query(`SELECT events.id, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, events.price, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS dateOpening, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS dateEnd, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.picture, users.name AS authorName, users.lastname AS authorLastname, users.username AS authorUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',events.id_author_fk,'/',users.picture) AS authorPicture, cities.name AS city, regions.uf AS region, events.id_event_type_fk AS typeId, events_types.title_ptbr AS type, places.id AS placeId, places.name AS placeName, events_purposes.name_ptbr AS purpose FROM events LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN users ON events.id_author_fk = users.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN events_purposes ON events.id_event_purpose_fk = events_purposes.id WHERE projects.username = '${projectUsername}' ORDER BY events.date_opening ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found events with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.getProjectOpportunities = (projectUsername, result) => {
  sql.query(`SELECT projects_opportunities.created, roles.description_ptbr AS rolename, projects_opportunities.info, projects_opportunities.experience AS experienceLevel, projects_opportunities_exp.title_ptbr AS experienceName FROM projects_opportunities LEFT JOIN roles ON projects_opportunities.id_role = roles.id LEFT JOIN projects ON projects_opportunities.id_project = projects.id LEFT JOIN projects_opportunities_exp ON projects_opportunities.experience = projects_opportunities_exp.id WHERE projects.username = '${projectUsername}' AND projects_opportunities.visible = 1 ORDER BY projects_opportunities.created DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      //console.log("opportunities: ", res);
      result(null, res);
      return;
    }
    // not found opportunities with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.getNotes = (loggedID, projectUsername, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT project_notes.id, project_notes.note, UNIX_TIMESTAMP(project_notes.created) AS created, users.username AS authorUsername, users.name AS authorName, users.lastname AS authorLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS authorPicture FROM project_notes LEFT JOIN users ON project_notes.id_author = users.id WHERE project_notes.id_project = (SELECT projects.id FROM projects WHERE projects.username = '${projectUsername}' LIMIT 1) AND project_notes.id_project = (SELECT id_project_fk FROM users_projects WHERE id_user_fk = ${x.result.id} AND id_project_fk = (SELECT projects.id FROM projects WHERE projects.username = '${projectUsername}' LIMIT 1) AND confirmed = 1 AND left_in IS NULL) ORDER BY project_notes.created DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found notes with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.updateBio = (loggedID, projectUsername, projectId, bio, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE projects SET projects.bio = '${bio}' WHERE projects.username = '${projectUsername}' AND projects.id = (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.confirmed = 1 LIMIT 1)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectUsername: projectUsername, newBio: bio, success: true });
    }
  );
};

Project.updateTag = (loggedID, projectUsername, projectId, label_show, label_text, label_color, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE projects SET projects.label_show = '${label_show}', projects.label_text = '${label_text}', projects.label_color = '${label_color}' WHERE projects.username = '${projectUsername}' AND projects.id = (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.confirmed = 1 LIMIT 1)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectUsername: projectUsername, label_show: label_show, label_text: label_text, label_color: label_color, success: true });
    }
  );
};

Project.updateCategory = (loggedID, projectId, userProjectId, portfolio, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_projects SET users_projects.portfolio = ${portfolio} WHERE users_projects.id = ${userProjectId} AND users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id}`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectId: projectId, portfolio: portfolio, success: true, message: 'Project category updated successfully!' });
    }
  );
};

Project.updateFeatured = (loggedID, projectId, userProjectId, featured, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_projects SET users_projects.featured = ${featured} WHERE users_projects.id = ${userProjectId} AND users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id}`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectId: projectId, featured: featured, success: true, message: 'Project category updated successfully!' });
    }
  );
};

Project.updateMemberDetails = (loggedID, userId, projectId, admin, active, leader, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_projects SET users_projects.admin = ${admin}, users_projects.active = ${active}, users_projects.leader = ${leader} WHERE users_projects.id_user_fk = ${userId} AND users_projects.id_project_fk = ${projectId} AND 1 = (SELECT admin FROM (SELECT DISTINCT admin FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.admin = 1 LIMIT 1) AS admin)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: userId, projectId: projectId, admin: admin, active: active, leader: leader, message: 'Updated successfully' });
    }
  );
};

Project.updateMemberRequest = (loggedID, projectId, userId, requestResponse, dateTime, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE users_projects SET users_projects.confirmed = ${requestResponse}, users_projects.modified = '${dateTime}' WHERE users_projects.id_user_fk = ${userId} AND users_projects.id_project_fk = ${projectId} AND 1 = (SELECT admin FROM (SELECT DISTINCT admin FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.admin = 1 LIMIT 1) AS admin)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: userId, projectId: projectId, requestResponse: requestResponse, dateTime: dateTime, message: 'Request updated successfully' });
    }
  );
};

Project.declineMemberRequest = (loggedID, projectId, userId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${userId} AND 1 = (SELECT admin FROM (SELECT DISTINCT admin FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.admin = 1 LIMIT 1) AS admin)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { userId: userId, projectId: projectId, message: 'Request declined' });
    }
  );
};

Project.removeMember = (loggedID, projectId, userId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM users_projects WHERE id_project_fk = ${projectId} AND id_user_fk = ${userId} AND 1 = (SELECT admin FROM (SELECT DISTINCT admin FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.admin = 1 LIMIT 1) AS admin) OR ${userId} = ${x.result.id}`, (err, res) => {
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
    // console.log("deleted member with id: ", userId);
    result(null, res);
  });
};

Project.delete = (loggedID, projectId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM projects WHERE id = ${projectId} AND ${x.result.id} = (SELECT id_user_fk FROM users_projects WHERE id_project_fk = ${projectId} AND id_user_fk = ${x.result.id}) AND 1 = (SELECT admin FROM users_projects WHERE id_project_fk = ${projectId} AND id_user_fk = ${x.result.id})`, (err, res) => {
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
    console.log("deleted project with id: ", projectId);
    result(null, res);
  });
};

// Project.removeAll = result => {
//   sql.query("DELETE FROM projects", (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }

//     console.log(`deleted ${res.affectedRows} projects`);
//     result(null, res);
//   });
// };

module.exports = Project;
