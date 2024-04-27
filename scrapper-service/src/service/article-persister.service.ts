import { articleScrapper } from "./scrapper/article-scrapper.service";
import type { ArticleQueueMessage } from "../types";
import { rabbitmq } from "../config/rabbitmq";
import { PaperModel } from "../models/paper";
import { l } from "../config/logger";
import mongoose from "mongoose";

class ArticlePersister {
  public async listenForEvents() {
    rabbitmq.consume("researcher-queue", async (message) => {
      if (message) {
        const profileToFetch: ArticleQueueMessage = JSON.parse(
          message.content.toString()
        );

        l.info(
          `[ARTICLE PERSISTER] Fetching data for ${profileToFetch.scholar_id} - admin: ${profileToFetch.admin_id} `
        );

        const articles = await articleScrapper.scrapeArticles(
          profileToFetch.scholar_id
        );

        l.info(
          `[ARTICLE PERSISTER] Found ${articles.length} articles for ${profileToFetch.scholar_id}`
        );

        for (let article of articles) {
          article.researcher_id  = new mongoose.Types.ObjectId(profileToFetch.researcher_id);
          article.admin_id = new mongoose.Types.ObjectId(profileToFetch.admin_id);
          const paper = new PaperModel(article);
          await paper.save();
        }

        l.info(
          `[ARTICLE PERSISTER] Saved ${articles.length} articles for ${profileToFetch.scholar_id}`
        );

        rabbitmq.ack(message);
      }
    });
  }
}

export const articlePersister = new ArticlePersister();
