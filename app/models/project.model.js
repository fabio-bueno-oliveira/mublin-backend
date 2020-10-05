const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Project = function(project) {
  this.name = project.name;
  this.username = project.username;
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
    SELECT projects.id AS price, projects.name AS title, CONCAT(genres.name,' - ',cities.name,'/',regions.name,' (@',projects.username,')') AS description, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',projects.id,'/',projects.picture) AS image, projects.foundation_year, projects.end_year FROM projects LEFT JOIN cities ON projects.id_city_fk = cities.id LEFT JOIN regions ON projects.id_region_fk = regions.id LEFT JOIN genres ON projects.id_genre_1_fk = genres.id WHERE public = 1 HAVING projects.name LIKE '%${keyword}%' ORDER BY projects.name ASC`, (err, res) => {
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

Project.findAllByUser = (userId, result) => {
  sql.query(`SELECT users_projects.id, users_projects.confirmed, users_projects.status, users_projects.active, users_projects.admin, users_projects.featured, users_projects.joined_in, users_projects.left_in AS yearLeftTheProject, users_projects.show_on_profile AS showOnProfile, users_projects.touring, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects.foundation_year AS yearFoundation, projects.end_year AS yearEnd, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_status.title_ptbr AS workTitle, users_projects_status.icon AS workIcon, r1.description_ptbr AS role1, r2.description_ptbr AS role2, r3.description_ptbr AS role3, g1.name AS genre1, g2.name AS genre2, g3.name AS genre3 FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id LEFT JOIN roles AS r1 ON users_projects.main_role_fk = r1.id LEFT JOIN roles AS r2 ON users_projects.second_role_fk = r2.id LEFT JOIN roles AS r3 ON users_projects.third_role_fk = r3.id LEFT JOIN genres AS g1 ON projects.id_genre_1_fk = g1.id LEFT JOIN genres AS g2 ON projects.id_genre_2_fk = g2.id LEFT JOIN genres AS g3 ON projects.id_genre_3_fk = g3.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1,2) AND projects.id IS NOT NULL ORDER BY users_projects.featured DESC, users_projects.status ASC, projects.name ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_status.title_ptbr AS workTitle, users_projects_status.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1) AND users_projects.portfolio = 0 ORDER BY users_projects.status ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_status.title_ptbr AS workTitle, users_projects_status.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.confirmed IN(0,1) AND users_projects.portfolio = 1 ORDER BY users_projects.status ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id, users_projects.id_user_fk, users_projects.id_project_fk, users_projects.confirmed, users_projects.admin, users_projects.leader, users_projects.touring, users_projects.status, users_projects.joined_in, users_projects.main_role_fk, users_projects.portfolio, users_projects.created, projects.id AS projectid, projects.name, projects.username, projects.type, projects.picture, projects_types.id AS ptid, projects_types.name_ptbr AS ptname, projects_types.icon AS pticon, users_projects_status.title_ptbr AS workTitle, users_projects_status.icon AS workIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN projects_types ON projects.type = projects_types.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id WHERE users_projects.id_user_fk = ${userId} AND users_projects.portfolio = 1 ORDER BY users_projects.status ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id_user_fk AS id, users_projects.id_project_fk AS projectId, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, users_projects.confirmed, users.name, users.lastname, users.username, users.picture AS picture, users.bio, role1.name_ptbr AS role1, role2.name_ptbr AS role2, role3.name_ptbr AS role3, projects.name AS projectName, projects.username AS projectUsername, users_projects_status.id AS statusId, users_projects_status.title_ptbr AS statusName, users_projects_status.icon AS statusIcon, users_projects.admin, users_projects.leader, users_projects.touring FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles AS role1 ON users_projects.main_role_fk = role1.id LEFT JOIN roles AS role2 ON users_projects.second_role_fk = role2.id LEFT JOIN roles AS role3 ON users_projects.third_role_fk = role3.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id WHERE projects.username = '${projectUsername}' AND users_projects.left_in IS NULL AND users_projects.status IN(1,2,3,4) ORDER BY users_projects.leader DESC, users.name ASC`, (err, res) => {
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
  sql.query(`SELECT users_projects.id_user_fk AS id, users_projects.id_project_fk AS projectId, users_projects.joined_in AS joinedIn, users_projects.left_in AS leftIn, users.name, users.lastname, users.username, users.picture AS picture, users.bio, role1.name_ptbr AS role1, role2.name_ptbr AS role2, role3.name_ptbr AS role3, projects.name AS projectName, projects.username AS projectUsername, users_projects_status.id AS statusId, users_projects_status.title_ptbr AS statusName, users_projects_status.icon AS statusIcon FROM users_projects LEFT JOIN projects ON users_projects.id_project_fk = projects.id LEFT JOIN users ON users_projects.id_user_fk = users.id LEFT JOIN roles AS role1 ON users_projects.main_role_fk = role1.id LEFT JOIN roles AS role2 ON users_projects.second_role_fk = role2.id LEFT JOIN roles AS role3 ON users_projects.third_role_fk = role3.id LEFT JOIN users_projects_status ON users_projects.status = users_projects_status.id WHERE projects.id = '${projectId}' AND users_projects.confirmed = 1 AND users_projects.left_in IS NULL AND users_projects.status IN(1,2,3,4) ORDER BY users_projects.leader DESC, users.name ASC`, (err, res) => {
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

// Project.remove = (id, result) => {
//   sql.query("DELETE FROM projects WHERE id = ?", id, (err, res) => {
//     if (err) {
//       console.log("error: ", err);
//       result(null, err);
//       return;
//     }
//     if (res.affectedRows == 0) {
//       // not found Project with the id
//       result({ kind: "not_found" }, null);
//       return;
//     }
//     console.log("deleted project with id: ", id);
//     result(null, res);
//   });
// };

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
