const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

// parse requests of content-type - application/json
app.use(bodyParser.json());

// use cors for requests
app.use(cors());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://www.mublin.com');
//   res.header(
//     'Access-Control-Allow-Headers',
//     'Origin, X-Requested-With, Content-Type, Accept',
//   );
//   next();
// });

app.use(function(req, res, next) {
  var allowedOrigins = ['https://mublin.com', 'https://www.mublin.com'];
  var origin = req.headers.origin;
  if(allowedOrigins.indexOf(origin) > -1){
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Mublin API." });
});

require("./app/routes/project.routes.js")(app);
require("./app/routes/user.routes.js")(app);
require("./app/routes/message.routes.js")(app);
require("./app/routes/profile.routes.js")(app);
require("./app/routes/event.routes.js")(app);
require("./app/routes/search.routes.js")(app);
require("./app/routes/notification.routes.js")(app);
require("./app/routes/location.routes.js")(app);
require("./app/routes/misc-routes.js")(app)

// set port, listen for requests
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});