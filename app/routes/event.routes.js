module.exports = app => {
  const events = require("../controllers/event.controller.js");

  // Retrieve event info
  app.get("/event/:eventId", events.findEventInfoById);
};