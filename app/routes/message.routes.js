module.exports = app => {
  const message = require("../controllers/message.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Retrieve conversations list grouped by userFrom and lastMessage
  app.get("/messages/conversations", checkToken, message.getAllConversations);

  // Retrieve all messages from a specific conversation
  app.get("/messages/:senderId/conversation", checkToken, message.getConversationBySenderId);

  // Submit a new message
  app.post("/messages/submitNewMessage", checkToken, message.submitNewMessage);

  // Retrieve profileId basic info
  app.get("/messages/:senderId/basicInfo", message.getSenderBasicInfo);

};