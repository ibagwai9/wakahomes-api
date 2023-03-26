const express = require("express");
const passport = require("passport");
const cors = require("cors");
const models = require("./models");
const cluster = require("cluster");
// const { profileStorage, uploadLetter, surveyor } = require("../config/multer";
// const db = require("./models";
// const cloudinary = require('cloudinary');
const { cloudRoute } = require("./util/Cloudinary");

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');


const app = express();

app.use(
  express.json({ limit: "500mb", extended: true, parameterLimit: 500000 })
);

let port = process.env.PORT || 8082; 

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + "/public"));

app.use(cors());

// force: true will drop the table if it already exits
// models.sequelize.sync({ force: true }).then(() => {
models.sequelize.sync().then(() => {
  console.log("Drop and Resync with {force: true}");
});

// passport middleware
app.use(passport.initialize());
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, { explorer: true }),
);
// const other routes
require("./routes/properties.js")(app);
require("./routes/user.js")(app);

// require("./routes/PostGIS.js")(app);
cloudRoute(app);

// passport config
require("./config/passport")(passport);
//create a server
if (cluster.isMaster) {
  var cpuCount = require("os").cpus().length;
  for (let i = 1; i < cpuCount; i++) {
    cluster.fork();
    console.log("Instance", i, " is running");
  }
  cluster.on("online", (worker) => {
    console.log("Online", worker.process.pid, " is online");
  });
  cluster.on("exit", (worker, code, signal) => {
    console.log("Exit", worker.process.pid, code + " is online", signal);
  });
} else {
  app.listen(port, function () {
    console.log(`App listening at http://localhost:${port}`);
  });
}
