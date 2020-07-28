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
    if (results.status === 0) {
      return res.status(401).send({
        message: 'Usuário inativo.'
      });
    }
    if (!results) {
      return res.status(401).send({
        message: 'Invalid email or passwords'
      });
    }

    const result = compareSync(body.password, results.password);
    if (result) {
      results.password = undefined;
      const jsontoken = sign({ result: results }, process.env.JWT_SECRET, {
        expiresIn: "3h" 
      });
      return res.json({
        success: 1,
        id: results.id,
        firstAccess: results.first_access,
        message: "login successfully",
        token: jsontoken
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