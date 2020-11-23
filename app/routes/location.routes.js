module.exports = app => {
  const locations = require("../controllers/location.controller.js");

  // Retrieve cities by keyword
  app.get("/search/cities/:keyword", locations.findByKeyword);

  // Retrieve cities by keyword and region
  app.get("/search/cities/:keyword/:regionId", locations.findByKeywordFilteredByRegion);

  // Retrieve cities by regionId
  app.get("/search/getCitiesByRegion/:regionId", locations.getCitiesByRegion);

  // Retrieve places by keyword
  app.get("/search/places/:keyword", locations.findPlacesByKeyword);

  // Retrieve places by keyword
  app.get("/search/places/minimalResult/:keyword", locations.findPlacesByKeywordMinimal);
};
