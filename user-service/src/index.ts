import express, { Application } from "express";
import { config } from "./config";
import morgan from "morgan";
import { adminRouter } from "./routes/adminRoutes";
import { errorHandler } from "./middleware/errorHandler";
import { databaseConnection } from "./config/mongodb";
import { rabbitmq } from "./config/rabbitmq";

const app: Application = express();

config.verifyConfig();
databaseConnection();
rabbitmq.rabbitmqConnect();

app.use(express.json());
app.use(morgan("dev"));

app.use("/admin", adminRouter.routes());

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
