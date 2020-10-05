const Search = require("../models/search.model.js");
const jwt = require("jsonwebtoken");

// Find all users with a keyword
exports.findUsersByKeyword = (req, res) => {
  Search.findUsersByKeyword(req.params.keyword, req.body.userCity, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No users found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Retrieve users projects from the users result
exports.findUsersProjectsFromUserSearch = (req, res) => {
  Search.findUsersProjectsFromUserSearch(req.params.userId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No projects found for user with id " + req.params.userId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects to user filtered with id " + req.params.userId
        });
      }
    } else res.send(data);
  });
};

// Find all projects with a keyword
exports.findProjectsByKeyword = (req, res) => {
  Search.findProjectsByKeyword(req.headers.authorization, req.params.keyword, req.body.userCity, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No projects found with keyword" + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

