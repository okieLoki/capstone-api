import express, { Application } from "express";
import { config } from "./config";
import { adminRouter } from "./routes/adminRoutes";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

config.verifyConfig();
config.databaseConnection();

app.use(express.json());

app.use("/admin", adminRouter.routes());

app.use(errorHandler);

app.listen(config.PORT, () => {
  console.log(`Server is running on port ${config.PORT}`);
});
