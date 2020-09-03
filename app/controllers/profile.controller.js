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