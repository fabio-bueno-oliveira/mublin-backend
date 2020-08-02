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

module.exports = Misc;