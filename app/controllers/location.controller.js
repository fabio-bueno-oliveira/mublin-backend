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

// Find cities by keyword filtered by regionId
exports.findByKeywordFilteredByRegion = (req, res) => {
  Location.findAllCitiesByKeywordAndRegionId(req.params.keyword, req.params.regionId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No results found with keyword ${req.params.keyword} and region ${req.params.regionId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving results with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find cities filtered by regionId
exports.getCitiesByRegion = (req, res) => {
  Location.getCitiesByRegion(req.params.regionId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No cities found with region ${req.params.regionId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving cities with region " + req.params.regionId
        });
      }
    } else res.send(data);
  });
};

// Find places by keyword
exports.findPlacesByKeyword = (req, res) => {
  Location.findPlacesByKeyword(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No places found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving places with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find places by keyword (minimal result)
exports.findPlacesByKeywordMinimal = (req, res) => {
  Location.findPlacesByKeywordMinimal(req.params.keyword, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No places found with keyword " + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving places with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};