module.exports = app => {
  const misc = require("../controllers/misc.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve cities by keyword
  app.get("/imagekit", misc.imagekit);

  // Retrieve all music genres
  app.get("/music/genres", misc.musicGenres);

  // Retrieve all music genres categories
  app.get("/music/genresCategories", misc.musicGenresCategories);

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
  app.get("/gear/product/:productId/productAvailableColors", misc.productAvailableColors);

  // Retrieve product info
  app.get("/gear/product/:productId/productOwners", misc.productOwners);

  // Retrieve instrument tunings
  app.get("/gear/tuning", misc.tuning);

  // Retrieve Brand info
  app.get("/gear/brand/:brandUrlName", misc.brandInfo);

  // Retrieve Brand partners
  app.get("/gear/brand/:brandUrlName/partners", misc.brandPartners);

  // Retrieve Brand owners
  app.get("/gear/brand/:brandUrlName/owners", misc.brandOwners);

  // Retrieve Brand Colors within Products
  app.get("/gear/brand/:brandUrlName/colors", misc.brandColors);

  // Retrieve product Brands with products under it
  app.get("/gear/brands", misc.brands);

  // Retrieve all Brands
  app.get("/gear/allBrands", misc.allBrands);

  // Retrieve all brand categories
  app.get("/gear/brand/:brandId/categories", misc.brandCategories);

  // Retrieve all macro categories
  app.get("/gear/macroCategories", misc.gearMacroCategories);

  // Retrieve all categories
  app.get("/gear/categories", misc.gearCategories);

  // Retrieve all products from a Brand
  app.get("/gear/:brandUrlName/products/", misc.brandAllProducts);

  // Retrieve all products from a Brand/Category
  app.get("/gear/brand/:brandId/:categoryId/products", misc.brandProducts);

  // Submit a new product
  app.post("/gear/submitNewGearProduct", checkToken, misc.submitNewGearProduct);

  // Submit a new brand
  app.post("/gear/submitNewGearBrand", checkToken, misc.submitNewGearBrand);

  // Retrieve all product colors
  app.get("/gear/product/colors", misc.productColors);

  // Retrieve all strengths
  app.get("/strengths/getAllStrengths", checkToken, misc.getAllStrengths);
};