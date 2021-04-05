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

// Retrieve my conversation with a specific senderId
exports.getConversationBySenderId = (req, res) => {
  Message.getConversationBySenderId(req.headers.authorization, req.params.senderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No conversations found with senderId " + req.params.senderId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving conversations with senderId " + req.params.senderId
        });
      }
    } else res.send(data);
  });
};

// Submit new message
exports.submitNewMessage = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
  }

  Message.submitNewMessage(req.headers.authorization, req.body.receiverId, req.body.message, (err, data) => {
    if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            message: `Not found user id ${req.body.receiverId}.`
          });
        } else {
          res.status(500).send({
            message: `Error sending message to user id ${req.body.receiverId}.`
          });
        }
    } else res.send(data);
  });
};

// Retrieve profileId basic info
exports.getSenderBasicInfo = (req, res) => {
  Message.getSenderBasicInfo(req.params.senderId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "Not found profile with id " + req.params.senderId
        });
      } else {
        res.status(500).send({
          message: "Error retrieving profile with id " + req.params.senderId
        });
      }
    } else res.send(data);
  });
};