const User = require("../models/user.model.js");
const { hashSync, genSaltSync, compareSync } = require("bcrypt");
const md5 = require("md5");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

var today = new Date();
var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var dateTime = date+' '+time;

// Create new User
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Generate bcrypt salt
  var salt = genSaltSync(10);

  // Create a User
  const user = new User({
    created: dateTime,
    modified: dateTime,
    name: req.body.name,
    lastname: req.body.lastname,
    email: req.body.email,
    username: req.body.username,
    password: hashSync(req.body.password, salt),
    random_key: md5(today+req.body.username)
  });

  // Save User in the database
  User.create(user, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the User."
      });
    else res.send(data);
  });
};

// Login User
exports.loginUser = (req, res) => {
  const body = req.body;
  User.loginUserByEmail(body.email, (err, results) => {
    if (err) {
      console.log(err);
    }
    if (!results) {
      return res.status(401).send({
        message: 'Invalid email or password'
      });
    }
    if (results.status === 0) {
      return res.status(401).send({
        message: 'Usuário inativo.'
      });
    }

    const result = compareSync(body.password, results.password);
    if (result) {
      results.password = undefined;
      const jsontoken = sign({ result: { id: results.id, name: results.name, lastname: results.lastname, username: results.username, email: results.email, plan: results.plan, status: results.status, level: results.level } }, process.env.JWT_SECRET, {
        expiresIn: "30 days" 
      });
      User.log(results.id, jsontoken, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while saving user log"
        });
        // else res.send(data);
      });
      return res.json({
        success: 1,
        token: jsontoken,
        message: "login successfully",
        id: results.id,
        firstAccess: results.first_access,
        userInfo: {
          id: results.id,
          status: results.status,
          name: results.name,
          lastname: results.lastname,
          username: results.username,
          email: results.email,
          bio: results.bio,
          gender: results.gender,
          verified: results.verified,
          legend_badge: results.legend_badge,
          countryId: results.countryId,
          country: results.country,
          region: results.region,
          regionName: results.regionName,
          city: results.city,
          cityName: results.cityName,
          picture: results.picture,
          picture_cover: results.picture_cover,
          plan: results.plan,
          public: results.public,
          instagram: results.instagram,
          website: results.website,
          phone: results.phone,
          availability_status: results.availability_status,
          availability_focus: results.availability_focus,
          level: results.level,
          previously_registered: results.previously_registered
        },
        // status: results.status,
        // name: results.name,
        // lastname: results.lastname,
        // username: results.username,
        // email: results.email,
        // bio: results.bio,
        // gender: results.gender,
        // verified: results.verified,
        // legend_badge: results.legend_badge,
        // countryId: results.countryId,
        // country: results.country,
        // region: results.region,
        // regionName: results.regionName,
        // city: results.city,
        // cityName: results.cityName,
        // picture: results.picture,
        // picture_cover: results.picture_cover,
        // plan: results.plan,
        // public: results.public,
        // instagram: results.instagram,
        // website: results.website,
        // phone: results.phone,
        // availability_status: results.availability_status,
        // availability_focus: results.availability_focus,
        // level: results.level,
        // previously_registered: results.previously_registered
      });
    } else {
      return res.status(401).send({
        message: 'Email ou senha inválidos'
      });
      // return res.json({
      //   success: 0,
      //   data: "Invalid email or password"
      // });
    }
  });
},

// Check if current session token is valid
exports.checkSession = (req, res) => {
  const token = req.get("authorization").slice(7);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // return res.json({
      //   success: 0,
      //   message: "Invalid Token..."
      // });
      return res.status(401).send({
        message: 'Invalid email or password'
      });
    } else {
      req.decoded = decoded;
      // next();
      console.log(78, decoded.result.email)

      User.checkUserByToken(decoded.result.email, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving user info."
          });
        else res.send(data);
      });

    }
  });
};

exports.forgotPassword = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.forgotPassword(req.body.email, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "No user found with email " + req.body.email
          });
        } else {
          res.status(500).send({
            message: "Error retrieving user email " + req.body.email
          });
        }
    } else res.send(data);
  });
};

// Retrieve logged user info from the database
exports.getInfo = (req, res) => {
  const token = req.get("authorization").slice(7);
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // return res.json({
      //   success: 0,
      //   message: "Invalid Token..."
      // });
      return res.status(401).send({
        message: 'Invalid Token...'
      });
    } else {
      req.decoded = decoded;
      // next();
      // console.log(78, decoded.result.email)

      User.getUserInfo(req.headers['email'], decoded.result.email, (err, data) => {
        if (err)
          res.status(500).send({
            message:
              err.message || "Some error occurred while retrieving user info."
          });
        else res.send(data);
      });

    }
  });
};

// Retrieve user´s genres info from database
exports.getInfoGenres = (req, res) => {
  User.getUserInfoGenres(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send(
          [{id: '', idGenre:'', name: '', mainGenre: ''}]
          //message: `Not found genres for user with id ${req.params.userId}.`
        );
      } else {
        res.status(500).send({
          message: "Error retrieving genres from user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Retrieve user´s roles info from database
exports.getInfoRoles = (req, res) => {
  User.getUserInfoRoles(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send(
          [{id: '', idRole:'', name: '', description: '', mainActivity: ''}]
          //message: `Not found roles for user with id ${req.params.userId}.`
        );
      } else {
        res.status(500).send({
          message: "Error retrieving roles from user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Retrieve user´s roles info from database
exports.getInfoAvailabilityItems = (req, res) => {
  User.getUserInfoAvailabilityItems(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send(
          [{id: '', idItem:'', name: ''}]
        );
      } else {
        res.status(500).send({
          message: "Error retrieving roles from user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Retrieve user´s partners from database
exports.getPartners = (req, res) => {
  User.getUserPartners(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send(
          { 
            total: 0, success: true, 
            result: [{keyId: '', id: '', name: '', slug: '', logo: '', cover: '', featured: '', type: '', sinceYear: '', active: '', created: ''}]
          }
        );
      } else {
        res.status(500).send({
          message: "Error retrieving partners from logged user"
        });
      }
    } else res.send(data);
  });
};

// Add user´s new brand partner
exports.addUserPartnership = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addUserPartnership(req.headers.authorization, req.body.userId, req.body.brandId, req.body.featured, req.body.type, req.body.since_year, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: `Error adding partner to user with id ${req.body.userId}.`
          });
        }
    } else res.send(data);
  });
};

// Delete user´s partner
exports.deleteUserPartnership = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteUserPartnership(req.headers.authorization, req.body.userId, req.body.userPartnershipId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user partnership with id ${req.body.userPartnershipId}`
          });
        } else {
          res.status(500).send({
            message: `Error deleting user´s partnership id ${req.body.userPartnershipId}`
          });
        }
    } else res.send(data);
  });
};

// Retrieve all Users from the database
exports.findAll = (req, res) => {
  User.getAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving users."
      });
    else res.send(data);
  });
};

// Find a single user with a userId
exports.findOne = (req, res) => {
  User.findById(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Project with id ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Project with id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Find a single user with a username
exports.findOneByUsername = (req, res) => {
  User.findByUsername(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No user found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find all users from a keyword
exports.findManyKeyword = (req, res) => {
  User.findUserByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No users found with keyword ${req.params.keyword}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find users and projects by keyword
exports.findByKeyword = (req, res) => {
  User.findAllByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No results found with keyword ${req.params.keyword}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving results with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// userId follow a profileID
exports.followProfile = (req, res) => {
  User.followByProfileId(req.params.userId, req.params.profileID, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found profile with id ${req.params.profileID}.`
        });
      } else {
        res.status(500).send({
          message: "Error following project with id " + req.params.profileID
        });
      }
    } else res.send(data);
  });
};

// userId unfollow a profileID
exports.unfollowProfile = (req, res) => {
  User.unfollowByProfileId(req.params.userId, req.params.profileID, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found profile with id ${req.params.profileID}.`
        });
      } else {
        res.status(500).send({
          message: "Error unfollowing project with id " + req.params.profileID
        });
      }
    } else res.send(data);
  });
};

// userId unfollow a profileID
exports.followers = (req, res) => {
  User.followersByUserId(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found followers for id ${req.params.profileID}.`
        });
      } else {
        res.status(500).send({
          message: "Error listing followers for id " + req.params.profileID
        });
      }
    } else res.send(data);
  });
};

// userId events
exports.events = (req, res) => {
  User.eventsByUserId(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found events for id ${req.params.profileID}.`
        });
      } else {
        res.status(500).send({
          message: "Error listing events for id " + req.params.profileID
        });
      }
    } else res.send(data);
  });
};

// Update event invitation
exports.eventInvitationResponse = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.eventInvitationResponse(req.headers.authorization, req.params.userId, req.body.invitationId, req.body.response, req.body.response_modified, req.body.response_comments, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found event invitation with id " + req.body.invitationId
          });
        } else {
          res.status(500).send({
            message: "Error updating event invitation with id " + req.body.invitationId
          });
        }
    } else res.send(data);
  });
};

// Check if username is available
exports.checkUsername = (req, res) => {
  User.CheckUsernameAvailability(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send({
          message: `Username ${req.params.username} is available.`,
          available: true
        });
      } else {
        res.status(500).send({
          message: `Error retrieving username ${req.params.username}`
        });
      }
    } else res.send(data);
  });
};

// Check if email is available
exports.checkEmail = (req, res) => {
  User.CheckEmailAvailability(req.params.email, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send({
          message: `Email ${req.params.email} allowed.`,
          available: true
        });
      } else {
        res.status(500).send({
          message: `Error retrieving email ${req.params.email}`
        });
      }
    } else res.send(data);
  });
};

// Activate user based on email and hash
exports.activate = (req, res) => {
  const body = req.body;
  User.activateByHash(body.email, body.hash, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found user with hash and email ${body.email}.`,
          activated: false
        });
      } else {
        res.status(500).send({
          message: "Error retrieving user with email " + body.email,
          activated: false
        });
      }
    } else res.send(data);
  });
};

// Update user picture identified by the userId in the request
exports.updatePicture = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updatePictureById(req.headers.authorization, req.params.userId, req.body.picture, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.params.userId
          });
        }
    } else res.send(data);
  });
};

// Update user firstaccess option identified by the userId in the request
exports.updateFirstAccess = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateFirstAccessById(req.headers.authorization, req.params.userId, req.body.step, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.params.userId
          });
        }
    } else res.send(data);
  });
};

// Update Step 2 fields (gender,bio,id_country_fk,id_region_fk,id_city_fk)
exports.updateStep2 = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateStep2ById(req.headers.authorization, req.body.userId, req.body.gender, req.body.bio, req.body.website, req.body.instagram, req.body.id_country_fk, req.body.id_region_fk, req.body.id_city_fk, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.params.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.params.userId
          });
        }
    } else res.send(data);
  });
};

// Add user´s Music Genre
exports.addUsersMusicGenre = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addUsersMusicGenre(req.headers.authorization, req.body.userId, req.body.musicGenreId, req.body.musicGenreMain, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Delete User´s Music Genre
exports.deleteUsersMusicGenre = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteUsersMusicGenre(req.headers.authorization, req.body.userId, req.body.userGenreId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user genre with id ${req.body.userGenreId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user genre with id " + req.body.userGenreId
          });
        }
    } else res.send(data);
  });
};

// Add User Role
exports.addUsersRole = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addUsersRole(req.headers.authorization, req.body.userId, req.body.roleId, req.body.roleMain, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Delete User´s Role
exports.deleteUsersRole = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteUsersRole(req.headers.authorization, req.body.userId, req.body.userRoleId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user enre with id ${req.body.userRoleId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user role with id " + req.body.userRoleId
          });
        }
    } else res.send(data);
  });
};

// Add User´s Participation on Project
exports.addUsersProject = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addUsersProject(req.headers.authorization, req.body.userId, req.body.projectId, req.body.status, req.body.main_role_fk, req.body.joined_in, req.body.left_in, req.body.active, req.body.leader, req.body.featured, req.body.confirmed, req.body.admin, req.body.portfolio, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Delete User´s Participation on Project
exports.deleteUsersProject = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteUsersProject(req.headers.authorization, req.body.userId, req.body.userProjectParticipationId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user´s participation project with id ${req.body.userProjectParticipationId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user´s participation project with id " + req.body.userProjectParticipationId
          });
        }
    } else res.send(data);
  });
};

// Update logged user´s preferences on a participation to a project
exports.updatePreferencesinProject = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updatePreferencesinProject(req.headers.authorization, req.body.projectId, req.body.status, req.body.featured, req.body.portfolio, req.body.joined_in, req.body.left_in, req.body.touring, req.body.show_on_profile, req.body.main_role_fk, req.body.second_role_fk, req.body.third_role_fk, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found project with id " + req.params.projectId
          });
        } else {
          res.status(500).send({
            message: "Error updating project with id " + req.params.projectId
          });
        }
    } else res.send(data);
  });
};

// Find all notes created by logged user or associated to logged user
exports.findNotes = (req, res) => {
  User.findNotesByLoggedUserId(req.headers.authorization, req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No notes found for logged user id " + req.params.userId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving notes for logged user id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Find a single note with a noteId
exports.findNoteById = (req, res) => {
  User.findNoteById(req.headers.authorization, req.params.noteId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No note found with id ${req.params.noteId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving note with id " + req.params.noteId
        });
      }
    } else res.send(data);
  });
};

// START SETTINGS UPDATES

// Update user profile basic information (settings/profile)
exports.updateBasicInfo = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateBasicInfo(req.headers.authorization, req.body.userId, req.body.name, req.body.lastname, req.body.email, req.body.phone_mobile, req.body.phone_mobile_public, req.body.website, req.body.instagram, req.body.gender, req.body.bio, req.body.id_country_fk, req.body.id_region_fk, req.body.id_city_fk, req.body.public, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Update user availability status information (settings/preferences)
exports.updateAvailabilityStatus = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateAvailabilityStatus(req.headers.authorization, req.body.userId, req.body.availabilityStatusId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating availability status for user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Add availability item
exports.addUserAvailabilityItem = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addUserAvailabilityItem(req.headers.authorization, req.body.userId, req.body.availabilityItemId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating availability item for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Delete user´s delete availability item
exports.deleteUserAvailabilityItem = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteUserAvailabilityItem(req.headers.authorization, req.body.userId, req.body.userItemId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found that info for with id ${req.body.userItemId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating user availability item with id " + req.body.userItemId
          });
        }
    } else res.send(data);
  });
};

// Update user availability focus information (settings/preferences)
exports.updateAvailabilityFocus = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateAvailabilityFocus(req.headers.authorization, req.body.userId, req.body.availabilityFocus, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating availability focus for user with id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Retrieve logged user´s gear
exports.gear = (req, res) => {
  User.gear(req.headers.authorization, req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No gear found for logged userId ${req.params.userId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear for logged userId " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Add gear item to userId
exports.addGearItem = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addGearItem(req.headers.authorization, req.body.productId, req.body.featured, req.body.for_sale, req.body.price, req.body.currently_using, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error adding item for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Add gear sub item to userId
exports.addGearSubItem = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.addGearSubItem(req.headers.authorization, req.body.parentId, req.body.productId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error adding sub item for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Update user gear item
exports.updateGearItem = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.updateGearItem(req.headers.authorization, req.body.id, req.body.productId, req.body.featured, req.body.for_sale, req.body.price, req.body.currently_using, req.body.tuning, req.body.owner_comments, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found gear item with id ${req.body.id}.`
          });
        } else {
          res.status(500).send({
            message: "Error updating gear item with id " + req.body.id
          });
        }
    } else res.send(data);
  });
};

// Delete user gear item
exports.deleteGearItem = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deleteGearItem(req.headers.authorization, req.params.userGearId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found gear item with id ${req.params.userGearId}.`
          });
        } else {
          res.status(500).send({
            message: "Error deleting gear item with id " + req.params.userGearId
          });
        }
    } else res.send(data);
  });
};

// Change user password
exports.changePassword = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Generate bcrypt salt
  var salt = genSaltSync(10);

  User.changePassword(req.headers.authorization, req.body.userId, hashSync(req.body.newPassword, salt), (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error changing the password for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Change user password
exports.changePasswordbyHash = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Generate bcrypt salt
  var salt = genSaltSync(10);

  User.changePasswordbyHash(req.body.email, req.body.hash, hashSync(req.body.newPassword, salt), (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "Not found user with email " + req.body.email + " or maybe your hash has expired"
          });
        } else {
          res.status(500).send({
            message: "Error changing the password for user " + req.body.email
          });
        }
    } else res.send(data);
  });
};

// Change user email
exports.changeEmail = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.changeEmail(req.headers.authorization, req.body.userId, req.body.newEmail, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user with id ${req.body.userId}.`
          });
        } else {
          res.status(500).send({
            message: "Error changing the email for user id " + req.body.userId
          });
        }
    } else res.send(data);
  });
};

// Retrieve user X project details
exports.getProjectPreferences = (req, res) => {
  User.getProjectPreferences(req.headers.authorization, req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found related project with username " + req.params.projectUsername
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Project with id " + req.params.projectUsername
        });
      }
    } else res.send(data);
  });
};

// Check if user can admin the project page
exports.checkProjectAdmin = (req, res) => {
  User.checkProjectAdmin(req.headers.authorization, req.params.projectUsername, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(200).send({
          message: `Acesso negado a ${req.params.projectUsername}`,
          accessible: 0
        });
      } else {
        res.status(500).send({
          message: `Erro ao verificar acesso a ${req.params.projectUsername}`
        });
      }
    } else res.send(data);
  });
};

// Retrieve list of recently connected friends
exports.getLastConnectedFriends = (req, res) => {
  User.getLastConnectedFriends(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found any friend connected recently"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving recently connected friends"
        });
      }
    } else res.send(data);
  });
};

// Add new post
exports.newPost = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.newPost(req.headers.authorization, req.body.text, req.body.image, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "User not found."
          });
        } else {
          res.status(500).send({
            message: "Error submitting new post"
          });
        }
    } else res.send(data);
  });
};

// Delete user post
exports.deletePost = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  User.deletePost(req.headers.authorization, req.body.postId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found post item with id ${req.body.postId}.`
          });
        } else {
          res.status(500).send({
            message: `Error deleting post item with id ${req.body.postId}.`
          });
        }
    } else res.send(data);
  });
};