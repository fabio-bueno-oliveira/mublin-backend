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

module.exports = Location;