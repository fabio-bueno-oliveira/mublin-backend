const Misc = require("../models/misc.model.js");

// Imagekit auth
exports.imagekit = (req, res) => {

  var ImageKit = require("imagekit");
  var fs = require('fs');

  var imagekit = new ImageKit({
    publicKey : "public_vFOVSJ4ZRbnv5fT4XZFbo82R2DE=",
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint : "https://ik.imagekit.io/mublin/"
  });

  var authenticationParameters = imagekit.getAuthenticationParameters();
  console.log(authenticationParameters);
  res.send(authenticationParameters)
};

// Retrieve all music genres from database
exports.musicGenres = (req, res) => {
  Misc.getMusicGenres((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving music genres."
      });
    else res.send(data);
  });
};

// Retrieve all roles from database
exports.roles = (req, res) => {
  Misc.getRoles((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving roles."
      });
    else res.send(data);
  });
};

// Retrieve all availability statuses
exports.availabilityStatuses = (req, res) => {
  Misc.getAvailabilityStatuses((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving availability statuses."
      });
    else res.send(data);
  });
};

// Retrieve all availability items
exports.availabilityItems = (req, res) => {
  Misc.getAvailabilityItems((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving availability items."
      });
    else res.send(data);
  });
};

// Retrieve all availability focuses
exports.availabilityFocuses = (req, res) => {
  Misc.getAvailabilityFocuses((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving availability focuses."
      });
    else res.send(data);
  });
};