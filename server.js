const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// var corsOptions = {
//   rigin: 'http://localhost:3000',
//   optionsSuccessStatus: 200
// }

// use cors for requests
app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://fabiobueno.me');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept',
  );
  next();
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Mublin API." });
});

require("./app/routes/project.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/notification.routes.js")(app);
require("./app/routes/location.routes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});