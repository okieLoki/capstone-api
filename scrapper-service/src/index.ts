import express from "express";
import { articlePersister } from "./service/article-persister.service";
import { calculationService } from "./service/calculation/calculation.service";
import { rabbitmq } from "./config/rabbitmq";
import { databaseConnection } from "./config/mongodb";

const initApp = async () => {
  const app = express();

  await rabbitmq.rabbitmqConnect();
  await databaseConnection();

  await articlePersister.listenForEvents();
  await calculationService.listenForCalculationRequests();

  app.listen(3000, async () => {
    console.log("Server is running on port 3000");
  });
};

initApp();
