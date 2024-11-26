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

// Retrieve all music genres from database
exports.musicGenresCategories = (req, res) => {
  Misc.getMusicGenresCategories((err, data) => {
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

// Get brand info
exports.brandInfo = (req, res) => {
  Misc.getBrandInfo(req.params.brandUrlName, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No brand found with URL name " + req.params.brandUrlName
        });
      } else {
        res.status(500).send({
          message: "Error retrieving brand info URL name " + req.params.brandUrlName
        });
      }
    } else res.send(data);
  });
};

// Get product Brands with products under it
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

// Get all product Brands
exports.allBrands = (req, res) => {
  Misc.getAllBrands((err, data) => {
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

// Get all categories by brandId (based on its products)
exports.brandCategories = (req, res) => {
  Misc.getBrandCategories(req.params.brandId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No categories found for the Brand id " + req.params.brandId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving categories for Brand id " + req.params.brandId
        });
      }
    } else res.send(data);
  });
};

// Get all macro categories
exports.gearMacroCategories = (req, res) => {
  Misc.getGearMacroCategories((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear macro categories found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear macro categories"
        });
      }
    } else res.send(data);
  });
};

// Get all categories
exports.gearCategories = (req, res) => {
  Misc.getGearCategories((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No gear categories found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear categories"
        });
      }
    } else res.send(data);
  });
};

// Get brand products
exports.brandProducts = (req, res) => {
  Misc.getBrandProducts(req.params.brandId, req.params.categoryId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No products found for the Brand id " + req.params.brandId + " with category id " + req.params.categoryId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving products for Brand id " + req.params.brandId + " with category id " + req.params.categoryId
        });
      }
    } else res.send(data);
  });
};

// Create and save a new Gear Product
exports.submitNewGearProduct = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Create a Gear
  const gearProduct = new Misc({
    name: req.body.name,
    id_brand: req.body.id_brand,
    id_category: req.body.id_category,
    year: req.body.year,
    color: req.body.color,
    picture: req.body.picture,
    id_user_creator: req.body.id_user_creator
  });

  // Save gear product in database
  Misc.submitNewGearProduct(gearProduct, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while submitting the product."
      });
    else res.send(data);
  });
};

// Create and save a new Gear Brand
exports.submitNewGearBrand = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save gear brand in database
  Misc.submitNewGearBrand(req.body.name, req.body.logo, req.body.id_user_creator, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while submitting the brand."
      });
    else res.send(data);
  });
};

// Get all categories
exports.productColors = (req, res) => {
  Misc.getProductColors((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No product colors found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving gear product colors"
        });
      }
    } else res.send(data);
  });
};

// Get all strengths
exports.getAllStrengths = (req, res) => {
  Misc.getAllStrengths((err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No strengths found"
        });
      } else {
        res.status(500).send({
          message: "Error retrieving strengths list"
        });
      }
    } else res.send(data);
  });
};