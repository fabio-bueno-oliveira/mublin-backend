const Profile = require("../models/profile.model.js");

// Find profile infos
exports.infos = (req, res) => {
  Profile.infos(req.params.username, (err, data) => {
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

// Find profile projects
exports.projects = (req, res) => {
  Profile.projects(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No projects found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile roles
exports.roles = (req, res) => {
  Profile.roles(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No role found with username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving roles for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile followers
exports.followers = (req, res) => {
  Profile.followers(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No followers found for username ${req.params.username}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving followers for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile following
exports.following = (req, res) => {
  Profile.following(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `${req.params.username} is not following anyone`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving following users for " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Follow profile
exports.follow = (req, res) => {
  Profile.follow(req.headers.authorization, req.params.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found profile with id ${req.body.profileId}.`
          });
        } else {
          res.status(500).send({
            message: "Error following profile with id " + req.body.profileId
          });
        }
    } else res.send(data);
  });
};

// Unfollow profile
exports.unfollow = (req, res) => {
  Profile.unfollow(req.headers.authorization, req.params.profileId, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found followed user with id ${req.params.profileId}.`
          });
        } else {
          res.status(500).send({
            message: "Error unfollowing profile with id " + req.params.profileId
          });
        }
    } else res.send(data);
  });
};

// Check if logged user follows the profile based on username
exports.checkFollow = (req, res) => {
  Profile.checkFollow(req.headers.authorization, req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          following: false
        });
      } else {
        res.status(500).send({
          message: "Error checking if user follows " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile gear
exports.gear = (req, res) => {
  Profile.gear(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile availability items
exports.availabilityItems = (req, res) => {
  Profile.availabilityItems(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No availability items found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving availability items for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};

// Find profile testimonials
exports.testimonials = (req, res) => {
  Profile.testimonials(req.params.username, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No testimonials found with username " + req.params.username
        });
      } else {
        res.status(500).send({
          message: "Error retrieving testimonials for username " + req.params.username
        });
      }
    } else res.send(data);
  });
};