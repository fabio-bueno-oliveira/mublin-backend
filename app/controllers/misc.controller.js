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

// Get product info
exports.productInfo = (req, res) => {
  Misc.getProductInfo(req.params.productId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No product found with id " + req.params.productId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving product info for id " + req.params.productId
        });
      }
    } else res.send(data);
  });
};

// Get product owners
exports.productOwners = (req, res) => {
  Misc.getProductOwners(req.params.productId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No product owners found for product id " + req.params.productId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving product owners for id " + req.params.productId
        });
      }
    } else res.send(data);
  });
};

// Get product owners
exports.brands = (req, res) => {
  Misc.getBrands((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No Brands found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Brands"
        });
      }
    } else res.send(data);
  });
};

// Get brand products
exports.brandProducts = (req, res) => {
  Misc.getBrandProducts(req.params.brandId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No products found for the Brand id " + req.params.brandId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving products for Brand id " + req.params.brandId
        });
      }
    } else res.send(data);
  });
};