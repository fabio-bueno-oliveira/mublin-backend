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

module.exports = Message;
