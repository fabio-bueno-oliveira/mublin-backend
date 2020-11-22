module.exports = app => {
  const events = require("../controllers/event.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve event info
  app.get("/event/:eventId", events.findEventInfoById);

  // Delete a event by id
  app.delete("/event/deleteEvent", checkToken, events.deleteEventById);
};