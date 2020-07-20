const User = require("../models/user.model.js");
const md5 = require("md5");
const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// Create and Save a new Project
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a User
  const project = new User({
    email: req.body.email,
    name: req.body.name,
    active: req.body.active
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
        message: 'Invalid email or passwords'
      });
    }
    if (md5(body.password) === results.password) {
      results.password = undefined;
      const jsontoken = sign({ result: results }, "mb2020HIT", {
        expiresIn: "3h" 
      });
      return res.json({
        success: 1,
        id: results.id,
        message: "login successfully",
        token: jsontoken
      });
    } else {
      return res.status(401).send({
        message: 'Invalid email or passwords'
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
  jwt.verify(token, "mb2020HIT", (err, decoded) => {
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
  jwt.verify(token, "mb2020HIT", (err, decoded) => {
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