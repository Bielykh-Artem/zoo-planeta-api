require("./config/config.js");

const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const mongoose = require("mongoose");
const cors = require("@koa/cors");
const BearerToken = require("koa-bearer-token");
const middleware = require("./middleware");
const fs = require("fs");
const tunnel = require("tunnel-ssh");

const app = new Koa();
const publicRouter = new Router({ prefix: "/api/v1" });
const privateRouter = new Router({ prefix: "/api/v1" });
const publicShopRouter = new Router({ prefix: "/api/v2" });

app.use(
  BodyParser({
    formLimit: "50mb",
    jsonLimit: "50mb",
    textLimit: "50mb",
  }),
);
app.use(BearerToken());
app.use(logger());
app.use(cors());

privateRouter.use(middleware.requireAuth);
privateRouter.use(middleware.errorHandler);

require("./routes/admin")(privateRouter, publicRouter);
require("./routes/shop")(publicShopRouter);

// --- Default connection ---

mongoose.connect(global.gConfig.db_url, { useNewUrlParser: true, useUnifiedTopology: true }, (err, db) => {
  if (err) {
    console.log("error: " + err);
  }
});
mongoose.Promise = global.Promise;

// --- Tunnel Connection ---
// const tunnelConfig = {
//   username: "ubuntu",
//   host: "ec2-13-58-97-251.us-east-2.compute.amazonaws.com",
//   agent: process.env.SSH_AUTH_SOCK,
//   privateKey: require("fs").readFileSync("/Users/artembielykh/Desktop/MyKeyPair.pem"),
//   port: 22,
//   dstPort: 27017,
// };

// const server = tunnel(tunnelConfig, function(error, server) {
//   if (error) {
//     console.log("SSH connection error: " + error);
//   }
//   console.log("database connection initalizing");
//   mongoose.connect("mongodb://localhost:27017/admin");

//   const db = mongoose.connection;

//   db.on("error", console.error.bind(console, "connection error:"));
//   db.once("open", function() {
//     console.log("database connection established");
//   });
// });

// --- End ---

app
  .use(privateRouter.routes())
  .use(publicRouter.routes())
  .use(publicShopRouter.routes())
  .use(publicRouter.allowedMethods());

app.listen(global.gConfig.node_port, () => console.log(`Listening port ${global.gConfig.node_port}`));
