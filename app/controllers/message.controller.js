const Message = require("../models/message.model.js");

// Retrieve conversations list grouped by userFrom and lastMessage
exports.getAllConversations = (req, res) => {
  Message.getAllConversations(req.headers.authorization, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No conversations found."
        });
      } else {
        res.status(500).send({
          message: "Error retrieving conversations"
        });
      }
    } else res.send(data);
  });
};