const Project = require("../models/project.model.js");

// Create and Save a new Project
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Project
  const project = new Project({
    name: req.body.projectName,
    username: req.body.projectName,
    foundation_year: req.body.foundation_year,
    end_year: req.body.end_year,
    bio: req.body.bio,
    type: req.body.type,
    kind: req.body.kind,
    public: req.body.public,
    id_user_creator_fk: req.body.id_user_creator_fk
  });

  // Save Project in the database
  Project.create(project, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Project."
      });
    else res.send(data);
  });
};

// Check if project username is available
exports.checkProjectUsername = (req, res) => {
  Project.CheckProjectUsernameAvailability(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send({
          message: `Username ${req.params.projectUsername} is available!`,
          available: true
        });
      } else {
        res.status(500).send({
          message: `Error retrieving username ${req.params.projectUsername}`
        });
      }
    } else res.send(data);
  });
};

// Update project picture identified by projectId
exports.updatePicture = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updatePictureById(req.params.projectId, req.body.userId, req.body.picture, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `It seems you cannot update picture for project with id ${req.params.projectId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.params.projectId
          });
        }
    } else res.send(data);
  });
};

// Find projects by keyword
exports.findByKeyword = (req, res) => {
  Project.findProjectsByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No projects found with keyword ${req.params.keyword}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find projects by keyword (adapted for Semantic UI search)
exports.findProjectByKeyword = (req, res) => {
  Project.findProjectByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No projects found with keyword ${req.params.keyword}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Retrieve all Projects from the database.
exports.findAll = (req, res) => {
  Project.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving projects."
      });
    else res.send(data);
  });
};

// Find a single Project with a projectId
exports.findOne = (req, res) => {
  Project.findById(req.params.projectId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Project with id ${req.params.projectId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Project with id " + req.params.projectId
        });
      }
    } else res.send(data);
  });
};

// Find a single Project with a project username
exports.findProject = (req, res) => {
  Project.findByUsername(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Project with username ${req.params.projectUsername}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Project with username " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Find all Projects from a user with a userId
exports.findAllUserProjects = (req, res) => {
  Project.findAllByUser(req.params.userId, (err, data) => {
    if (err) {
      // if (err.kind === "not_found") {
      //   res.status(404).send({
      //     message: `No projects found for user id ${req.params.userId}.`
      //   });
      // } else {
        res.status(500).send({
          message: "Error retrieving projects from user id " + req.params.userId
        });
      //}
    } else res.send(data);
  });
};

// Find main Projects from a user with a userId
exports.findMainUserProjects = (req, res) => {
  Project.findMainByUser(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No main projects found for user id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving main projects from user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Find portfolio Projects from a user with a userId
exports.findPortfolioUserProjects = (req, res) => {
  Project.findPortfolioByUser(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No portfolio projects found for user id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving portfolio projects from user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Update a Project identified by the projectId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  console.log(req.body);

  Project.updateById(
    req.params.projectId,
    new Project(req.body),
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found Project with id ${req.params.projectId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating Project with id " + req.params.projectId
          });
        }
      } else res.send(data);
    }
  );
};

// Find all members of projectUsername
exports.members = (req, res) => {
  Project.getMembers(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No members found for project username ${req.params.projectUsername}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving members from project username " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Find all members of projectId
exports.membersByProjectId = (req, res) => {
  Project.getMembersByProjectId(req.params.projectId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No members found for project id ${req.params.projectId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving members from project id " + req.params.projectId
        });
      }
    } else res.send(data);
  });
};

// Find all official members of projectId
exports.officialMembers = (req, res) => {
  Project.getOfficialMembers(req.params.projectUserName, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No official members found for project id ${req.params.projectUserName}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving official member from project id " + req.params.projectUserName
        });
      }
    } else res.send(data);
  });
};

// Find all members of projectUsername
exports.opportunities = (req, res) => {
  Project.getProjectOpportunities(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No opportunities found for project ${req.params.projectUsername}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving opportunities from project " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Find all notes of projectUsername
exports.notes = (req, res) => {
  Project.getNotes(req.headers.authorization, req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No notes found for project username ${req.params.projectUsername} or you do not have access.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving notes from project username " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Update project bio
exports.updateBio = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateBio(req.headers.authorization, req.params.projectUsername, req.body.projectId, req.body.bio, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update the project with username " + req.params.projectUsername
          });
        } else {
          res.status(500).send({
            message: "Error updating bio for project with username " + req.params.projectUsername
          });
        }
    } else res.send(data);
  });
};

// Update project tag
exports.updateTag = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateTag(req.headers.authorization, req.params.projectUsername, req.body.projectId, req.body.label_show, req.body.label_text, req.body.label_color, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update the project with username " + req.params.projectUsername
          });
        } else {
          res.status(500).send({
            message: "Error updating tag for project with username " + req.params.projectUsername
          });
        }
    } else res.send(data);
  });
};

// // Delete a Project with the specified projectId in the request
// exports.delete = (req, res) => {
//   Project.remove(req.params.projectId, (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `Not found Project with id ${req.params.projectId}.`
//         });
//       } else {
//         res.status(500).send({
//           message: "Could not delete Project with id " + req.params.projectId
//         });
//       }
//     } else res.send({ message: `Project was deleted successfully!` });
//   });
// };

// // Delete all Projects from the database.
// exports.deleteAll = (req, res) => {
//   Project.removeAll((err, data) => {
//     if (err)
//       res.status(500).send({
//         message:
//           err.message || "Some error occurred while removing all projects."
//       });
//     else res.send({ message: `All Projects were deleted successfully!` });
//   });
// };
