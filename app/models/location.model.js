const sql = require("./db.js");

// constructor
const Location = function(city) {
  this.id = city.id;
  this.name = city.name;
  this.region_id = city.region_id;
  this.country_id = city.country_id
};

// find cities by keyword
Location.findAllCitiesByKeyword = (keyword, result) => {
  sql.query(`
    SELECT cities.id AS value, cities.name AS text FROM cities WHERE cities.name LIKE '%${keyword}%' AND cities.country_id = 27 ORDER BY name ASC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found cities with the keyword
    result({ kind: "not_found" }, null);
  });
};

// find cities by keyword and regionId
Location.findAllCitiesByKeywordAndRegionId = (keyword, regionId, result) => {
  sql.query(`
    SELECT cities.id AS id, cities.id AS value, cities.name AS text FROM cities WHERE cities.name LIKE '%${keyword}%' AND cities.region_id = ${regionId} ORDER BY name ASC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found cities with the keyword and regionId
    result({ kind: "not_found" }, null);
  });
};

// Find cities filtered by regionId
Location.getCitiesByRegion = (regionId, result) => {
  sql.query(`
    SELECT cities.id AS id, cities.id AS value, cities.name AS text FROM cities WHERE cities.region_id = ${regionId} ORDER BY cities.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("result: ", res);
      result(null, res);
      return;
    }
    // not found cities with the regionId
    result({ kind: "not_found" }, null);
  });
};

// find places by keyword
Location.findPlacesByKeyword = (keyword, result) => {
  sql.query(`
  SELECT places.id AS id, places.name, places.about, places.id_city_fk AS cityId, cities.name AS cityName, places.id_state_fk AS regionId, regions.name AS regionName, places.id_country_fk AS countryId, countries.name AS countryName FROM places LEFT JOIN countries ON places.id_country_fk = countries.id LEFT JOIN regions ON places.id_state_fk = regions.id LEFT JOIN cities ON places.id_city_fk = cities.id WHERE places.name LIKE '%${keyword}%' ORDER BY places.name ASC LIMIT 50`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found places with the keyword
    result({ kind: "not_found" }, null);
  });
};

module.exports = Location;