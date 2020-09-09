const sql = require("./db.js");

// constructor
const Misc = function(misc) {
  this.id = misc.id;
  this.name = misc.name;
};

Misc.getMusicGenres = result => {
  sql.query("SELECT genres.id, genres.name FROM genres ORDER BY genres.name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("Music Genres: ", res);
    result(null, res);
  });
};

Misc.getRoles = result => {
  sql.query("SELECT roles.id, roles.name_ptbr AS name, roles.description_ptbr AS description, roles.instrumentalist FROM roles ORDER BY roles.id = 30 DESC, roles.id = 31 DESC, roles.id = 29 DESC, roles.id = 10 DESC, roles.id = 11 DESC, roles.id = 48 DESC, name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("Roles: ", res);
    result(null, res);
  });
};

Misc.getAvailabilityStatuses = result => {
  sql.query("SELECT availability_statuses.id, availability_statuses.title_ptbr AS title, availability_statuses.color FROM availability_statuses ORDER BY availability_statuses.id = 8 ASC", (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

module.exports = Misc;