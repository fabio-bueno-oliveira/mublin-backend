module.exports = app => {
  const payment = require("../controllers/payment.controller.js");

  // Submit a checkout sessionid after a transaction is completed and redirected to the success page
  app.post("/payment/saveCheckoutSessionId", payment.saveCheckoutSessionId);
};