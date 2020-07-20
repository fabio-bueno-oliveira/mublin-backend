const Location = require("../models/location.model.js");

// Create and save a new city
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a CIty
  const city = new Location({
    id: req.body.email,
    name: req.body.name,
    region_id: req.body.active,
    country_id: req.body.active
  });

  // Save City in the database
  Location.create(city, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while adding the City."
      });
    else res.send(data);
  });
};

// Find cities by keyword
exports.findByKeyword = (req, res) => {
  Location.findAllCitiesByKeyword(req.params.keyword, (err, data) => {
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