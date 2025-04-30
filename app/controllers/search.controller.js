const Search = require("../models/search.model.js");
// const jwt = require("jsonwebtoken");

// Save user search query history
exports.saveSearch = (req, res) => {
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Search.saveSearch(req.headers.authorization, req.body.query, req.body.source, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: "User not found."
          });
        } else {
          res.status(500).send({
            message: "Error saving query."
          });
        }
    } else res.send(data);
  });
};

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
          message: "No projects found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find all gear with a keyword
exports.findGearByKeyword = (req, res) => {
  Search.findGearByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find all brands with a keyword
exports.findBrandsByKeyword = (req, res) => {
  Search.findBrandsByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No brand found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving brand with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find user last searches
exports.getUserLastSearches = (req, res) => {
  Search.getUserLastSearches(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No searches found from user"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving searches from user"
        });
      }
    } else res.send(data);
  });
};

// Find users for suggestion
exports.findUsersBySuggestion = (req, res) => {
  Search.findUsersBySuggestion(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No users found for suggestion"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users for suggestion"
        });
      }
    } else res.send(data);
  });
};

// Find random featured users
exports.getRandomFeaturedUsers = (req, res) => {
  Search.getRandomFeaturedUsers(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No random featured users found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving random featured users"
        });
      }
    } else res.send(data);
  });
};

// Find random featured projects
exports.getRandomFeaturedProjects = (req, res) => {
  Search.getRandomFeaturedProjects(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No random featured projects found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving random featured projects"
        });
      }
    } else res.send(data);
  });
};

// Find new recent signed users
exports.getNewRecentUsers = (req, res) => {
  Search.getNewRecentUsers(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No random new users found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving random new users"
        });
      }
    } else res.send(data);
  });
};

// Find home featured users
exports.getHomeFeaturedUsers = (req, res) => {
  Search.getHomeFeaturedUsers((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No home featured users found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving home featured users"
        });
      }
    } else res.send(data);
  });
};

// Find home featured brands
exports.getHomeFeaturedBrands = (req, res) => {
  Search.getHomeFeaturedBrands((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No home featured brands found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving home featured brands"
        });
      }
    } else res.send(data);
  });
};

// Find featured products
exports.getFeaturedProducts = (req, res) => {
  Search.getFeaturedProducts((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No featured products found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving featured products"
        });
      }
    } else res.send(data);
  });
};

// Find featured genres with projects underneath them
exports.getFeaturedGenres = (req, res) => {
  Search.getFeaturedGenres((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No featured genres found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving featured genres"
        });
      }
    } else res.send(data);
  });
};

// Find all projects with a keyword
exports.findProjectsByGenre = (req, res) => {
  Search.findProjectsByGenre(req.headers.authorization, req.params.genreId, req.body.userCity, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No projects found with genre " + req.params.genreId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving projects with genre " + req.params.genreId
        });
      }
    } else res.send(data);
  });
};

// Find job opportunities on projects
exports.getOpportunities = (req, res) => {
  Search.getOpportunities((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No opportunities found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving opportunities"
        });
      }
    } else res.send(data);
  });
};

// Get job details
exports.getJobInfo = (req, res) => {
  Search.getJobInfo(req.params.jobId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No job found with id ${req.params.jobId}`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving job details with id ${req.params.jobId}`
        });
      }
    } else res.send(data);
  });
};
