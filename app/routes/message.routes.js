module.exports = app => {
  const message = require("../controllers/message.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve conversations list grouped by userFrom and lastMessage
  app.get("/messages/conversations", checkToken, message.getAllConversations);

  // // Retrieve all messages from a conversation
  // app.get("/messages/:profileId/conversation", message.getConversation);

  // // Submit a new message
  // app.post("/messages/submitNewMessage", checkToken, message.submitNewMessage);
};