const Payment = require("../models/payment.model.js");

// Save a transaction session id
exports.saveCheckoutSessionId = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  // Save the session id in database
  Payment.saveCheckoutSessionId(req.body.session_id, (err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while saving the session id."
      });
    else res.send(data);
  });
};
