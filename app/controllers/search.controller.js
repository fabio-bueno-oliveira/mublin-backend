const Search = require("../models/search.model.js");
const jwt = require("jsonwebtoken");

// Find all users with a keyword
exports.findUsersByKeyword = (req, res) => {
  Search.findUsersByKeyword(req.params.keyword, req.body.userCity, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: "No users found with keyword" + req.params.keyword
        });
      } else {
        res.status(500).send({
          message: "Error retrieving users with keyword " + req.params.keyword
        });
      }
    } else res.send(data);
  });
};

// Find users and projects by keyword
// exports.findByKeyword = (req, res) => {
//   Search.findAllByKeyword(req.params.keyword, (err, data) => {
//     if (err) {
//       if (err.kind === "not_found") {
//         res.status(404).send({
//           message: `No results found with keyword ${req.params.keyword}.`
//         });
//       } else {
//         res.status(500).send({
//           message: "Error retrieving results with keyword " + req.params.keyword
//         });
//       }
//     } else res.send(data);
//   });
// };

