const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Project = function(project) {
  this.name = project.name;
  this.username = project.username;
  this.picture = project.picture;
  this.foundation_year = project.foundation_year;
  this.end_year = project.end_year;
  this.id_country_fk = project.id_country_fk;
  this.id_region_fk = project.id_region_fk;
  this.id_city_fk = project.id_city_fk;
  this.bio = project.bio;
  this.type = project.type;
  this.kind = project.kind;
  this.activity_status = project.activity_status;
  this.public = project.public;
  this.id_user_creator_fk = project.id_user_creator_fk;
};

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

Project.getProjectsTypes = (result) => {
  sql.query(`SELECT types.id, types.name_EN as nameEN, types.name_ptbr AS namePTBR, types.slug, types.icon FROM projects_types AS types ORDER BY namePTBR ASC`, (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
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
  SELECT p.id, p.name AS title, pt.name_ptbr AS type, CONCAT(genres.name,' - ',cities.name,'/',regions.uf) AS description, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS image, p.foundation_year, p.end_year FROM projects AS p LEFT JOIN cities ON p.id_city_fk = cities.id LEFT JOIN regions ON p.id_region_fk = regions.id LEFT JOIN genres ON p.id_genre_1_fk = genres.id LEFT JOIN projects_types AS pt ON p.type = pt.id WHERE p.name LIKE '%${keyword}%' ORDER BY p.name ASC`, (err, res) => {
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
  SELECT p.id, p.name, p.old_name AS oldName, p.username, p.picture, p.cover_image, p.created, p.foundation_year AS foundationYear, p.end_year AS endDate, p.bio, p.purpose, p.email, p.phone, p.instagram, p.spotify_id AS spotifyId, p.website_url AS website, p.soundcloud, p.type AS typeId, p.kind, p.admin_note AS adminNote, p.currentlyOnTour, projects_types.name_ptbr AS typeName, genre1.name AS genre1, genre2.name AS genre2, genre3.name AS genre3, countries.name AS country, regions.name AS region, cities.name AS city, label_show AS labelShow, label_text AS labelText, label_color AS labelColor, public, ps.description_ptbr AS activityStatus, ps.id AS activityStatusId, ps.color AS activityStatusColor 
  FROM projects AS p 
  LEFT JOIN projects_types ON p.type = projects_types.id 
  LEFT JOIN projects_status AS ps ON p.activity_status = ps.id 
  LEFT JOIN genres AS genre1 ON p.id_genre_1_fk = genre1.id 
  LEFT JOIN genres AS genre2 ON p.id_genre_2_fk = genre2.id 
  LEFT JOIN genres AS genre3 ON p.id_genre_3_fk = genre3.id 
  LEFT JOIN countries ON p.id_country_fk = countries.id 
  LEFT JOIN regions ON p.id_region_fk = regions.id 
  LEFT JOIN cities ON p.id_city_fk = cities.id 
  WHERE p.username = '${projectUsername}' LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      // console.log("found project: ", res[0]);
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

Project.findAllByUser_V1 = (userId, type, result) => {

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

  sql.query(`SELECT usrsp.id, usrsp.confirmed, usrsp.status, usrsp.active, usrsp.admin, usrsp.featured, usrsp.joined_in, usrsp.left_in AS yearLeftTheProject, usrsp.founder, usrsp.show_on_profile AS showOnProfile, usrsp.touring AS touringWithThisBand, usrsp.main_role_fk, usrsp.portfolio, usrsp.created, prjct.id AS projectid, prjct.name, prjct.username, prjct.type, prjct.picture, prjct.foundation_year AS yearFoundation, prjct.end_year AS yearEnd, prjct.label_show AS labelShow, prjct.label_color AS labelColor, prjct.label_text AS labelText, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, g1.name AS genre1, g2.name AS genre2, g3.name AS genre3, events.id AS nextEventId, events.title AS nextEventTitle, events.date_opening AS nextEventDateOpening, events.hour_opening AS nextEventHourOpening, events_invitations.id AS nextEventInvitationId, events_invitations.response AS nextEventInvitationResponse, DATE_FORMAT(events_invitations.created,'%d/%m/%Y às %H:%i:%s') AS nextEventInvitationDate, events_invitations.name AS nextEventInvitationNameWhoInvited, events_invitations.username AS nextEventInvitationUsernameWhoInvited, events_invitations.picture AS nextEventInvitationPictureWhoInvited, events_invitations.id_user_who_invited_fk AS nextEventInvitationUserIdWhoInvited, projects_goals.goal_date AS nextGoalDate, projects_goals.goal_description AS nextGoalDescription, projects_goals.completed AS nextGoalCompleted, projects_goals_user.goal_date AS nextUserGoalDate, projects_goals_user.goal_description AS nextUserGoalDescription, projects_goals_user.completed AS nextUserGoalCompleted, cities.name AS cityName, regions.name AS regionName, regions.uf AS regionUf, countries.name_ptbr AS countryName, project_notes.note AS leaderLastNote, project_notes.note_date AS leaderLastNoteDate, project_notes.authorId AS leaderLastNoteAuthorId, project_notes.username AS leaderLastNoteUsername, project_notes.name AS leaderLastNoteName, project_notes.picture AS leaderLastNotePicture, projects_status.id AS activityStatusId, projects_status.description_ptbr AS activityStatus, projects_status.color AS activityStatusColor, prjct.currentlyOnTour AS projectCurrentlyOnTour 

  FROM users_projects AS usrsp
  
  LEFT JOIN projects AS prjct ON usrsp.id_project_fk = prjct.id 
  LEFT JOIN projects_types ON prjct.type = projects_types.id 
  LEFT JOIN cities ON prjct.id_city_fk = cities.id 
  LEFT JOIN regions ON prjct.id_region_fk = regions.id 
  LEFT JOIN countries ON prjct.id_country_fk = countries.id 
  LEFT JOIN users_projects_relationship ON usrsp.status = users_projects_relationship.id 
  LEFT JOIN roles AS r1 ON usrsp.main_role_fk = r1.id 
  LEFT JOIN roles AS r2 ON usrsp.second_role_fk = r2.id 
  LEFT JOIN roles AS r3 ON usrsp.third_role_fk = r3.id 
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

  WHERE usrsp.id_user_fk = ${userId} AND usrsp.confirmed IN(0,1,2) AND prjct.id IS NOT NULL AND usrsp.portfolio IN(${filterType(type)}) 
  
  GROUP BY usrsp.id 
  
  ORDER BY prjct.end_year IS NOT NULL ASC, usrsp.left_in IS NOT NULL ASC, usrsp.confirmed DESC, usrsp.featured DESC, usrsp.joined_in DESC, usrsp.status ASC, prjct.name ASC, events.date_opening DESC;

  SELECT usrsp.confirmed, usrsp.joined_in, usrsp.left_in, usrsp.portfolio, projects.id AS projectid, projects.name, projects.username FROM users_projects AS usrsp LEFT JOIN projects ON usrsp.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_relationship ON usrsp.status = users_projects_relationship.id WHERE usrsp.id_user_fk = ${userId} AND usrsp.confirmed IN(0,1,2) AND projects.id IS NOT NULL GROUP BY usrsp.id ORDER BY projects.end_year IS NOT NULL ASC, usrsp.left_in IS NOT NULL ASC, usrsp.confirmed DESC, usrsp.featured DESC, usrsp.joined_in DESC, usrsp.status ASC, projects.name ASC;
  
  SELECT u.id AS userId, u.name AS userName, u.lastname AS userLastname, users_projects.active, users_projects.admin, u.username AS userUsername, u.picture AS userPicture, p.id AS projectId, p.username AS projectUsername, users_projects.confirmed, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, users_projects.leader FROM users_projects LEFT JOIN users AS u ON users_projects.id_user_fk = u.id LEFT JOIN projects AS p ON users_projects.id_project_fk = p.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id WHERE users_projects.id_project_fk IN (SELECT projects.id FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1,2) AND projects.id IS NOT NULL GROUP BY users_projects.id) ORDER BY u.id = ${userId} DESC, u.name ASC;
  
  `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (results.length) {
      result(null, { totalProjects: results[0].length, success: true, result: results });
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.findAllByUser = (userId, result) => {
  sql.query(`SELECT usrsp.id, usrsp.confirmed, usrsp.status, usrsp.active, usrsp.admin, usrsp.featured, usrsp.joined_in, usrsp.left_in AS yearLeftTheProject, usrsp.founder, usrsp.show_on_profile AS showOnProfile, usrsp.touring AS touringWithThisBand, usrsp.main_role_fk, usrsp.portfolio, usrsp.created, prjct.id AS projectid, prjct.name, prjct.username, prjct.type, prjct.picture, prjct.foundation_year AS yearFoundation, prjct.end_year AS yearEnd, prjct.label_show AS labelShow, prjct.label_color AS labelColor, prjct.label_text AS labelText, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_relationship.title_ptbr AS workTitle, users_projects_relationship.icon AS workIcon, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, g1.name AS genre1, g2.name AS genre2, g3.name AS genre3, events.id AS nextEventId, events.title AS nextEventTitle, events.date_opening AS nextEventDateOpening, events.hour_opening AS nextEventHourOpening, events_invitations.id AS nextEventInvitationId, events_invitations.response AS nextEventInvitationResponse, DATE_FORMAT(events_invitations.created,'%d/%m/%Y às %H:%i:%s') AS nextEventInvitationDate, events_invitations.name AS nextEventInvitationNameWhoInvited, events_invitations.username AS nextEventInvitationUsernameWhoInvited, events_invitations.picture AS nextEventInvitationPictureWhoInvited, events_invitations.id_user_who_invited_fk AS nextEventInvitationUserIdWhoInvited, projects_goals.goal_date AS nextGoalDate, projects_goals.goal_description AS nextGoalDescription, projects_goals.completed AS nextGoalCompleted, projects_goals_user.goal_date AS nextUserGoalDate, projects_goals_user.goal_description AS nextUserGoalDescription, projects_goals_user.completed AS nextUserGoalCompleted, cities.name AS cityName, regions.name AS regionName, regions.uf AS regionUf, countries.name_ptbr AS countryName, project_notes.note AS leaderLastNote, project_notes.note_date AS leaderLastNoteDate, project_notes.authorId AS leaderLastNoteAuthorId, project_notes.username AS leaderLastNoteUsername, project_notes.name AS leaderLastNoteName, project_notes.picture AS leaderLastNotePicture, projects_status.id AS activityStatusId, projects_status.description_ptbr AS activityStatus, projects_status.color AS activityStatusColor, prjct.currentlyOnTour AS projectCurrentlyOnTour 

  FROM users_projects AS usrsp
  
  LEFT JOIN projects AS prjct ON usrsp.id_project_fk = prjct.id 
  LEFT JOIN projects_types ON prjct.type = projects_types.id 
  LEFT JOIN cities ON prjct.id_city_fk = cities.id 
  LEFT JOIN regions ON prjct.id_region_fk = regions.id 
  LEFT JOIN countries ON prjct.id_country_fk = countries.id 
  LEFT JOIN users_projects_relationship ON usrsp.status = users_projects_relationship.id 
  LEFT JOIN roles AS r1 ON usrsp.main_role_fk = r1.id 
  LEFT JOIN roles AS r2 ON usrsp.second_role_fk = r2.id 
  LEFT JOIN roles AS r3 ON usrsp.third_role_fk = r3.id 
  LEFT JOIN genres AS g1 ON prjct.id_genre_1_fk = g1.id 
  LEFT JOIN genres AS g2 ON prjct.id_genre_2_fk = g2.id 
  LEFT JOIN genres AS g3 ON prjct.id_genre_3_fk = g3.id 
  LEFT JOIN (SELECT id_project_fk, id, title, DATE_FORMAT(date_opening,'%d/%m/%Y') AS date_opening, hour_opening FROM events WHERE date_opening >= CURDATE() ORDER BY date_opening ASC) AS events ON prjct.id = events.id_project_fk 
  LEFT JOIN (SELECT evi.id, evi.response, evi.id_event_fk, evi.created, evi.id_user_who_invited_fk, users.name, users.picture, users.username FROM events_invitations AS evi 
  LEFT JOIN users ON evi.id_user_who_invited_fk = users.id) AS events_invitations ON events.id = events_invitations.id_event_fk 
  LEFT JOIN (SELECT id_project, DATE_FORMAT(goal_date,'%d/%m/%Y') AS goal_date, goal_description, completed FROM projects_goals WHERE goal_date >= CURDATE() ORDER BY goal_date DESC) AS projects_goals ON prjct.id = projects_goals.id_project 
  LEFT JOIN (SELECT id_project, id_user, DATE_FORMAT(goal_date,'%d/%m/%Y') AS goal_date, goal_description, completed FROM projects_goals WHERE goal_date >= CURDATE() AND id_user = ${userId} ORDER BY goal_date DESC) AS projects_goals_user ON prjct.id = projects_goals_user.id_project 
  LEFT JOIN (SELECT id_project, DATE_FORMAT(project_notes.created,'%d/%m/%Y') AS note_date, note, users.id AS authorId, users.name, users.picture, users.username FROM project_notes LEFT JOIN users ON project_notes.id_author = users.id ORDER BY project_notes.created DESC LIMIT 1) AS project_notes ON prjct.id = project_notes.id_project 
  LEFT JOIN projects_status ON prjct.activity_status = projects_status.id 

  WHERE usrsp.id_user_fk = ${userId} AND usrsp.confirmed IN(0,1,2) AND prjct.id IS NOT NULL 
  
  GROUP BY usrsp.id 
  
  ORDER BY prjct.end_year IS NOT NULL ASC, usrsp.left_in IS NOT NULL ASC, usrsp.confirmed DESC, usrsp.featured DESC, usrsp.joined_in DESC, usrsp.status ASC, prjct.name ASC, events.date_opening DESC;

  SELECT usrsp.confirmed, usrsp.joined_in, usrsp.left_in, usrsp.portfolio, p.id AS projectid, p.name, p.username FROM users_projects AS usrsp LEFT JOIN projects AS p ON usrsp.id_project_fk = p.id LEFT JOIN projects_types ON p.type = projects_types.id LEFT JOIN users_projects_relationship AS upr ON usrsp.status = upr.id WHERE usrsp.id_user_fk = ${userId} AND usrsp.confirmed IN(0,1,2) AND p.id IS NOT NULL GROUP BY usrsp.id ORDER BY p.end_year IS NOT NULL ASC, usrsp.left_in IS NOT NULL ASC, usrsp.confirmed DESC, usrsp.featured DESC, usrsp.joined_in DESC, usrsp.status ASC, p.name ASC;
  
  SELECT u.id AS userId, u.name AS userName, u.lastname AS userLastname, users_projects.active, users_projects.admin, u.username AS userUsername, u.picture AS userPicture, p.id AS projectId, p.username AS projectUsername, users_projects.confirmed, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, r1.description_ptbr AS role1, r1.icon AS role1icon, r2.description_ptbr AS role2, r2.icon AS role2icon, r3.description_ptbr AS role3, r3.icon AS role3icon, users_projects.leader FROM users_projects LEFT JOIN users AS u ON users_projects.id_user_fk = u.id LEFT JOIN projects AS p ON users_projects.id_project_fk = p.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id WHERE users_projects.id_project_fk IN (SELECT projects.id FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1,2) AND projects.id IS NOT NULL GROUP BY users_projects.id) ORDER BY u.id = ${userId} DESC, u.name ASC;
  
  `, (err, results) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (results.length) {
      result(null, { totalProjects: results[0].length, success: true, result: results });
      return;
    }
    // not found Project with the id
    result({ kind: "not_found" }, null);
  });
};

Project.findAllUserProjectsBasicInfos = (userId, result) => {
  sql.query(`SELECT usrsp.id, usrsp.confirmed, prjct.id AS projectid, prjct.name, prjct.username, prjct.picture, projects_types.name_ptbr AS type, upr.title_ptbr AS workTitle, r1.description_ptbr AS role1, r2.description_ptbr AS role2, r3.description_ptbr AS role3, g1.name AS genre1, g2.name AS genre2, g3.name AS genre3, cities.name AS cityName, regions.name AS regionName, regions.uf AS regionUf, countries.name_ptbr AS countryName, projects_status.description_ptbr AS activityStatus  

  FROM users_projects AS usrsp
  
  LEFT JOIN projects AS prjct ON usrsp.id_project_fk = prjct.id 
  LEFT JOIN projects_types ON prjct.type = projects_types.id 
  LEFT JOIN cities ON prjct.id_city_fk = cities.id 
  LEFT JOIN regions ON prjct.id_region_fk = regions.id 
  LEFT JOIN countries ON prjct.id_country_fk = countries.id 
  LEFT JOIN users_projects_relationship AS upr ON usrsp.status = upr.id 
  LEFT JOIN roles AS r1 ON usrsp.main_role_fk = r1.id 
  LEFT JOIN roles AS r2 ON usrsp.second_role_fk = r2.id 
  LEFT JOIN roles AS r3 ON usrsp.third_role_fk = r3.id 
  LEFT JOIN genres AS g1 ON prjct.id_genre_1_fk = g1.id 
  LEFT JOIN genres AS g2 ON prjct.id_genre_2_fk = g2.id 
  LEFT JOIN genres AS g3 ON prjct.id_genre_3_fk = g3.id 
  LEFT JOIN projects_status ON prjct.activity_status = projects_status.id 

  WHERE usrsp.id_user_fk = ${userId} AND usrsp.confirmed IN(0,1,2) AND prjct.id IS NOT NULL 

  GROUP BY usrsp.id 

  ORDER BY prjct.end_year IS NOT NULL ASC, usrsp.left_in IS NOT NULL ASC, usrsp.confirmed DESC, usrsp.featured DESC, usrsp.joined_in DESC, usrsp.status ASC, prjct.name ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id_user_fk AS id, users_projects.id_project_fk AS projectId, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, users_projects.confirmed, users.name, users.lastname, users.username, users.gender, users.picture AS picture, users.bio, users.verified, users.legend_badge, role1.description_ptbr AS role1, role2.description_ptbr AS role2, role3.description_ptbr AS role3, projects.name AS projectName, projects.username AS projectUsername, users_projects_relationship.id AS statusId, users_projects_relationship.title_ptbr AS statusName, users_projects_relationship.icon AS statusIcon, users_projects.admin, users_projects.active, users_projects.founder, users_projects.leader, users_projects.touring FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles AS role1 ON users_projects.main_role_fk = role1.id LEFT JOIN roles AS role2 ON users_projects.second_role_fk = role2.id LEFT JOIN roles AS role3 ON users_projects.third_role_fk = role3.id LEFT JOIN users_projects_relationship ON users_projects.status = users_projects_relationship.id WHERE projects.username = '${projectUsername}' AND users_projects.status IN(1,2,3,4,5) AND users.name IS NOT NULL ORDER BY users_projects.admin DESC, users_projects.leader DESC, users.name ASC`, (err, res) => {
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
  sql.query(`SELECT events.id, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, events.price, DATE_FORMAT(events.date_opening,'%Y-%m-%d') AS dateOpeningRaw, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS dateOpening, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS dateEnd, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.picture, users.name AS authorName, users.lastname AS authorLastname, users.username AS authorUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS authorPicture, cities.name AS city, regions.uf AS region, events.id_event_type_fk AS typeId, events_types.title_ptbr AS type, places.id AS placeId, places.name AS placeName, events_purposes.name_ptbr AS purpose FROM events LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN users ON events.id_author_fk = users.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN events_purposes ON events.id_event_purpose_fk = events_purposes.id WHERE projects.username = '${projectUsername}' AND events.date_opening >= CURDATE() ORDER BY events.date_opening ASC`, (err, res) => {
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
  sql.query(`SELECT events.id, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, events.price, DATE_FORMAT(events.date_opening,'%Y-%m-%d') AS dateOpeningRaw, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS dateOpening, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS dateEnd, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.picture, users.name AS authorName, users.lastname AS authorLastname, users.username AS authorUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS authorPicture, cities.name AS city, regions.uf AS region, events.id_event_type_fk AS typeId, events_types.title_ptbr AS type, places.id AS placeId, places.name AS placeName, events_purposes.name_ptbr AS purpose FROM events LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN users ON events.id_author_fk = users.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN events_purposes ON events.id_event_purpose_fk = events_purposes.id WHERE projects.username = '${projectUsername}' ORDER BY events.date_opening ASC`, (err, res) => {
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
  sql.query(`SELECT po.id, UNIX_TIMESTAMP(po.created) AS created, roles.description_ptbr AS rolename, po.info, po.experience AS experienceLevel, projects_opportunities_exp.title_ptbr AS experienceName FROM projects_opportunities AS po LEFT JOIN roles ON po.id_role = roles.id LEFT JOIN projects ON po.id_project = projects.id LEFT JOIN projects_opportunities_exp ON po.experience = projects_opportunities_exp.id WHERE projects.username = '${projectUsername}' AND po.visible = 1 ORDER BY po.created DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found opportunities with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.getNotes = (loggedID, projectUsername, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT project_notes.id, project_notes.note, UNIX_TIMESTAMP(project_notes.created) AS created, users.username AS authorUsername, users.name AS authorName, users.lastname AS authorLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS authorPicture FROM project_notes LEFT JOIN users ON project_notes.id_author = users.id WHERE project_notes.id_project = (SELECT projects.id FROM projects WHERE projects.username = '${projectUsername}' LIMIT 1) AND project_notes.id_project = (SELECT id_project_fk FROM users_projects WHERE id_user_fk = ${x.result.id} AND id_project_fk = (SELECT projects.id FROM projects WHERE projects.username = '${projectUsername}' LIMIT 1) AND confirmed = 1 AND left_in IS NULL) ORDER BY project_notes.created DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found notes with the project username
    result({ kind: "not_found" }, null);
  });
};

Project.createNote = (loggedID, projectId, projectSlug, projectName, note, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO project_notes (id_author, id_project, note) VALUES (${x.result.id}, ${projectId}, '${note}')`, (err, res) => {
      // WHERE id_author = (SELECT id_user_fk FROM users_projects WHERE id_user_fk = ${x.result.id} AND id_project_fk = ${projectId} AND confirmed = 1)
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectName: projectName, success: true, message: `Nota incluída com sucesso no projeto ${projectSlug}` });

      // start sending email
      // var mailOptions = {
      //   from: `Mublin <${process.env.SMTP_USER_NAME}>`,
      //   to: emailTo,
      //   subject: `Nova nota de ${projectName}`,
      //   html: `<h2>Olá, ${nameTo}!</h2><p>Uma nova nota foi postada no painel de controle do projeto <strong>${projectName}</strong>. Acesse o Mublin para conferir!</p><p>Equipe Mublin</p><p><a href='https://mublin.com/dashboard/${projectSlug}' target='_blank'>mublin.com/dashboard/${projectSlug}</a></p>`
      // };

      // transporter.sendMail(mailOptions, function(error, info){
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //   }
      // });
      // end sending email
    }
  );
};

Project.deleteNote = (loggedID, projectUsername, noteId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`DELETE FROM project_notes WHERE id = ${noteId} AND ${x.result.id} = (SELECT id_user_fk FROM users_projects WHERE id_user_fk = ${x.result.id} AND id_project_fk = (SELECT id FROM projects WHERE username = '${projectUsername}'))`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    if (res.affectedRows == 0) {
      // not found note with the id
      result({ kind: "not_found" }, null);
      return;
    }
    // console.log("deleted note with id: ", userId);
    result(null, res);
  });
};

Project.updateProjectInfos = (loggedID, projectUsername, projectId, activityStatus, kind, type, name, slug, foundationYear, endYear, bio, purpose, website, instagram, email, spotifyId, soundcloud, genre1, genre2, genre3, country, region, city, public, currentlyOnTour, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`UPDATE projects SET projects.activity_status = ${activityStatus}, projects.kind = ${kind}, projects.type = ${type}, projects.name = '${name}', projects.username = '${slug}', projects.foundation_year = ${foundationYear || null}, projects.end_year = ${endYear || null}, projects.bio = '${bio}', projects.purpose = '${purpose}', projects.website_url = '${website}', projects.instagram = '${instagram}', projects.email = '${email}', projects.spotify_id = '${spotifyId}', projects.soundcloud = '${soundcloud}', projects.id_genre_1_fk = ${genre1 || null}, projects.id_genre_2_fk = ${genre2 || null}, projects.id_genre_3_fk = ${genre3 || null}, projects.id_country_fk = ${country || null}, projects.id_region_fk = ${region || null}, projects.id_city_fk = ${city || null}, projects.public = ${public}, projects.currentlyOnTour = ${currentlyOnTour || null}, projects.updated = '${dateTime}' WHERE projects.username = '${projectUsername}' AND projects.id = (SELECT users_projects.id_project_fk FROM users_projects WHERE users_projects.id_project_fk = ${projectId} AND users_projects.id_user_fk = ${x.result.id} AND users_projects.confirmed = 1 AND users_projects.admin = 1 LIMIT 1)`, (err, res) => {
      if (err) {
        result(null, err);
        return;
      }
      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }
      result(null, { projectUsername: projectUsername, success: true, message: 'Project info successfully updated!' });
    }
  );
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
