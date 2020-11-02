const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Event = function(event) {
  this.title = project.title;
  this.description = project.description;
};

Event.findEventInfoById = (eventId, result) => {
  sql.query(`SELECT events.id, events.title, events.description, IF(events.method=1,'Presencial', 'Online') AS method, events.price, DATE_FORMAT(events.date_opening,'%d/%m/%Y') AS dateOpening, TIME_FORMAT(events.hour_opening, '%k:%i') AS eventHourStart, DATE_FORMAT(events.date_end,'%d/%m/%Y') AS dateEnd, TIME_FORMAT(events.hour_end, '%k:%i') AS eventHourEnd, events.picture, CONCAT('https://ik.imagekit.io/mublin/events/tr:h-200,w-200,c-maintain_ratio/',events.picture) AS picture, users.name AS authorName, users.lastname AS authorLastname, users.username AS authorUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',events.id_author_fk,'/',users.picture) AS authorPicture, cities.name AS city, regions.uf AS region, events.id_event_type_fk AS typeId, events_types.title_ptbr AS type, places.id AS placeId, places.name AS placeName, events_purposes.name_ptbr AS purpose FROM events LEFT JOIN projects ON events.id_project_fk = projects.id LEFT JOIN users ON events.id_author_fk = users.id LEFT JOIN cities ON events.id_city_fk = cities.id LEFT JOIN regions ON events.id_region_fk = regions.id LEFT JOIN events_types ON events_types.id = events.id_event_type_fk LEFT JOIN places ON events.id_place_fk = places.id LEFT JOIN events_purposes ON events.id_event_purpose_fk = events_purposes.id WHERE events.id = ${eventId} LIMIT 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // no event found with the given id
    result({ kind: "not_found" }, null);
  });
};

module.exports = Event;