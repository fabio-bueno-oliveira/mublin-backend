const Event = require("../models/event.model.js");

// Find event details by id
exports.findEventInfoById = (req, res) => {
  Event.findEventInfoById(req.params.eventId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `No event found with id ${req.params.eventId}`
        });
      } else {
        res.status(500).send({
          message: `Error retrieving event details with id ${req.params.eventId}`
        });
      }
    } else res.send(data);
  });
};

// Create and save a new Event
exports.createEvent = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save Event in database
  Event.createEvent(req.headers.authorization, req.body.public, req.body.id_project_fk, req.body.id_event_type_fk, req.body.title, req.body.method, req.body.description, req.body.date_opening, req.body.hour_opening, req.body.date_end, req.body.hour_end, req.body.id_country_fk, req.body.id_region_fk, req.body.id_city_fk, req.body.id_place_fk, req.body.price, req.body.url_more_info, req.body.picture, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the event."
      });
    else res.send(data);
  });
};

// Delete a event with the specified eventId in the request
exports.deleteEventById = (req, res) => {
  Event.deleteEventById(req.headers.authorization, req.body.eventId, req.body.projectId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found event with id " + req.body.eventId
        });
      } else {
        res.status(500).send({
          message: "Could not delete event with id " + req.body.eventId
        });
      }
    } else res.send({ message: `Event was deleted successfully!` });
  });
};