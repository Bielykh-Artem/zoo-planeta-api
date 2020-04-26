require("./config/config.js");

const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require("koa-logger");
const mongoose = require("mongoose");
const cors = require("@koa/cors");
const BearerToken = require("koa-bearer-token");
const middleware = require("./middleware");

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

mongoose.connect(global.gConfig.db_url, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.Promise = global.Promise;

app
  .use(privateRouter.routes())
  .use(publicRouter.routes())
  .use(publicShopRouter.routes())
  .use(publicRouter.allowedMethods());

app.listen(global.gConfig.node_port, () => console.log(`Listening port ${global.gConfig.node_port}`));
