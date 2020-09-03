const Profile = require("../models/profile.model.js");

// Find profile infos with the username
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

// Find profile roles with the username
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