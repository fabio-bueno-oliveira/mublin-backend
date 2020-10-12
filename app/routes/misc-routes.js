module.exports = app => {
  const misc = require("../controllers/misc.controller.js");

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
};