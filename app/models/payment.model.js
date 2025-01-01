const sql = require("./db.js");

// constructor
const Payment = function(payment) {
  this.session_id = payment.session_id;
};

Payment.saveCheckoutSessionId = (session_id, result) => {
  sql.query(`INSERT INTO purchases_stripe (session_id) VALUES ('${session_id}')`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("New checkout saved: ", { session_id: session_id });
    result(null, { id: res.insertId, session_id: session_id, success: true });
  });
};

module.exports = Payment;