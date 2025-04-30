const Project = require("../models/project.model.js");

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

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
    username: req.body.projectUserName,
    picture: req.body.projectImage,
    foundation_year: req.body.foundation_year,
    end_year: req.body.end_year,
    id_country_fk: req.body.id_country_fk,
    id_region_fk: req.body.id_region_fk,
    id_city_fk: req.body.id_city_fk,
    bio: req.body.bio,
    type: req.body.type,
    kind: req.body.kind,
    activity_status: req.body.activity_status,
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

// Get projects types list (band, solo artist, etc)
exports.getProjectsTypes = (req, res) => {
  Project.getProjectsTypes((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No types found for projects"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects types"
        });
      }
    } else res.send(data);
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

// Retrieve related projects
exports.relatedProjects = (req, res) => {
  Project.relatedProjects(req.params.projectId, req.params.projectCity, req.params.projectMainGenre, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving related projects."
      });
    else res.send(data);
  });
};

// Find all Projects from a user with a userId
exports.findAllUserProjects_V1 = (req, res) => {
  Project.findAllByUser_V1(req.params.userId, req.query.type, (err, data) => {
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

// Find all Projects from a user with a userId
exports.findAllUserProjectsBasicInfos = (req, res) => {
  Project.findAllUserProjectsBasicInfos(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No projects found for user id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects from user id " + req.params.userId
        });
      }
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

// Find future events for projectUsername
exports.events = (req, res) => {
  Project.getEvents(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No future events found for project username ${req.params.projectUsername}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving future events from project username " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Find all events for projectUsername
exports.allEvents = (req, res) => {
  Project.getAllEvents(req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No events found for project username ${req.params.projectUsername}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving events from project username " + req.params.projectUsername
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

// Create project internal note for the team
exports.createNote = (req, res) => {
  Project.createNote(req.headers.authorization, req.body.projectId, req.body.projectSlug, req.body.projectName, req.body.note, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found project id ${req.body.projectId}.`
          });
        } else {
          res.status(500).send({
            message: "Error posting note for project id " + req.body.projectId
          });
        }
    } else res.send(data);
  });
};

// Delete project note from dashboard
exports.deleteNote = (req, res) => {
  Project.deleteNote(req.headers.authorization, req.params.projectUsername, req.params.noteId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Note ${req.body.noteId} not found or you do not have permission to delete that.`
        });
      } else {
        res.status(500).send({
          message: `Could not delete note ${req.body.noteId}.`
        });
      }
    } else res.send({ message: 'Note was successfully deleted', success: true });
  });
};

// Update project infos
exports.updateProjectInfos = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateProjectInfos(req.headers.authorization, req.params.projectUsername, req.body.projectId, req.body.activityStatus, req.body.kind, req.body.type, req.body.name, req.body.slug, req.body.foundationYear, req.body.endYear, req.body.bio, req.body.purpose, req.body.website, req.body.instagram, req.body.email, req.body.spotifyId, req.body.soundcloud, req.body.genre1, req.body.genre2, req.body.genre3, req.body.country, req.body.region, req.body.city, req.body.public, req.body.currentlyOnTour, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `You are not allowed to update infos on project ${req.params.projectUsername}`
          });
        } else {
          res.status(500).send({
            message: `Error updating infos for project ${req.params.projectUsername}`
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

// Update project category (main/portfolio)
exports.updateCategory = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateCategory(req.headers.authorization, req.params.projectId, req.body.userProjectId, req.body.portfolio, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update this project"
          });
        } else {
          res.status(500).send({
            message: "Error updating category for project with id " + req.params.projectId
          });
        }
    } else res.send(data);
  });
};

// Update project featured
exports.updateFeatured = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateFeatured(req.headers.authorization, req.params.projectId, req.body.userProjectId, req.body.featured, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update this project"
          });
        } else {
          res.status(500).send({
            message: "Error updating featured toggle for project with id " + req.params.projectId
          });
        }
    } else res.send(data);
  });
};

// Update project bio
exports.updateMemberDetails = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateMemberDetails(req.headers.authorization, req.body.userId, req.body.projectId, req.body.admin, req.body.active, req.body.leader, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update the member with user id " + req.body.userId + " for this project"
          });
        } else {
          res.status(500).send({
            message: "Error updating member details for user id " + req.body.userId  + " in this project"
          });
        }
    } else res.send(data);
  });
};

// Update member status
exports.updateMemberRequest = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.updateMemberRequest(req.headers.authorization, req.params.projectId, req.body.requestId, req.body.userId, req.body.requestResponse, dateTime, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update the member confirmation with user id " + req.body.userId + " for this project"
          });
        } else {
          res.status(500).send({
            message: "Error updating member confirmation for user id " + req.body.userId  + " in this project"
          });
        }
    } else res.send(data);
  });
};

// Decline member request
exports.declineMemberRequest = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Project.declineMemberRequest(req.headers.authorization, req.params.projectId, req.body.userId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "You cannot update the member confirmation with user id " + req.body.userId + " for this project"
          });
        } else {
          res.status(500).send({
            message: "Error updating member confirmation for user id " + req.body.userId  + " in this project"
          });
        }
    } else res.send(data);
  });
};

// Remove user from project
exports.removeMember = (req, res) => {
  Project.removeMember(req.headers.authorization, req.params.projectId, req.body.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `User ${req.body.userId} not found or you do not have permission to that.`
        });
      } else {
        res.status(500).send({
          message: `Could not remove user ${req.body.userId} from project with id ${req.params.projectId}.`
        });
      }
    } else res.send({ message: `User was successfully removed from the project`, success: true });
  });
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  Project.delete(req.headers.authorization, req.params.projectId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Project id ${req.params.projectId} not found or you do not have permission to that.`
        });
      } else {
        res.status(500).send({
          message: `Could not delete project with id ${req.params.projectId}.`
        });
      }
    } else res.send({ message: `Project was deleted successfully`, success: true });
  });
};

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
