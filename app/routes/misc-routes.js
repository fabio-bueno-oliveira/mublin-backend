module.exports = app => {
  const misc = require("../controllers/misc.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve cities by keyword
  app.get("/imagekit", misc.imagekit);

  // Retrieve all music genres
  app.get("/music/genres", misc.musicGenres);

  // Retrieve all roles
  app.get("/music/roles", misc.roles);

  // Retrieve all availability statuses
  app.get("/availabilityStatuses", misc.availabilityStatuses);

  // Retrieve all availability items
  app.get("/availabilityItems", misc.availabilityItems);

  // Retrieve all availability focuses
  app.get("/availabilityFocuses", misc.availabilityFocuses);

  // Retrieve product info
  app.get("/gear/product/:productId/productInfo", misc.productInfo);

  // Retrieve product info
  app.get("/gear/product/:productId/productOwners", misc.productOwners);

  // Retrieve all product Brands
  app.get("/gear/brands", misc.brands);

  // Retrieve all brand categories
  app.get("/gear/brand/:brandId/categories", misc.brandCategories);

  // Retrieve all products from a Brand/Category
  app.get("/gear/brand/:brandId/:categoryId/products", misc.brandProducts);

  // Submit a new product
  app.post("/gear/submitNewGearProduct", checkToken, misc.submitNewGearProduct);

  // Submit a new brand
  app.post("/gear/submitNewGearBrand", checkToken, misc.submitNewGearBrand);
};