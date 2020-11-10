const sql = require("./db.js");
const jwt = require("jsonwebtoken");

// constructor
const Message = function(message) {
  this.message = project.message;
  this.id_to = project.id_to;
  this.id_from = project.id_from;
};

Message.getAllConversations = (loggedID, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT m1.created AS lastMessageCreated, UNIX_TIMESTAMP(m1.created) AS lastMessageCreatedFormatted, m1.id_user_from AS senderId, u1.name AS senderName, u1.lastname AS senderLastname, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u1.id,'/',u1.picture) AS senderPicture, m1.id AS lastMessageId, m1.id_user_to AS receiverId, m1.message AS lastMessage, m1.seen AS lastMessageSeen FROM messages AS m1 INNER JOIN users AS u1 ON m1.id_user_from = u1.id INNER JOIN (SELECT id_user_from, MAX(created) AS MaxDate FROM messages WHERE id_user_to = ${x.result.id} GROUP BY id_user_from) AS m2 ON m1.id_user_from = m2.id_user_from AND m1.created = m2.MaxDate ORDER BY m1.created DESC
  `, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found messages for logged user
    result({ kind: "not_found" }, null);
  });
};

Message.getConversationBySenderId = (loggedID, senderId, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT messages.id, messages.created, UNIX_TIMESTAMP(messages.created) AS createdFormatted, messages.id_user_from AS senderId, u1.status, u1.name AS senderName, u1.lastname AS senderLastname, u1.username AS senderUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u1.id,'/',u1.picture) AS senderPicture, messages.id_user_to AS receiverId, u2.name AS receiverName, u2.lastname AS receiverLastname, u2.username AS receiverUsername, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u2.id,'/',u2.picture) AS reveiverPicture, messages.message, messages.seen FROM messages LEFT JOIN users AS u1 ON messages.id_user_from = u1.id LEFT JOIN users AS u2 ON messages.id_user_to = u2.id WHERE messages.id_user_to = ${x.result.id} AND messages.id_user_from = ${senderId}  OR messages.id_user_from = ${x.result.id} AND messages.id_user_to = ${senderId} HAVING u1.status = 1 ORDER BY messages.created ASC
  `, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found messages from this userId
    result({ kind: "not_found" }, null);
  });
};

Message.getSenderBasicInfo = (senderId, result) => {
  sql.query(`SELECT id, name, lastname, username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',id,'/',picture) AS picture FROM users WHERE id = ${senderId} AND status = 1`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // not found profile with the id
    result({ kind: "not_found" }, null);
  });
};

module.exports = Message;
