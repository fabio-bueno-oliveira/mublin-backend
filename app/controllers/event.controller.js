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