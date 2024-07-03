import { articleScrapper } from "./scrapper/article-scrapper.service";
import type { ArticleQueueMessage } from "../types";
import { rabbitmq } from "../config/rabbitmq";
import { PaperModel } from "../models/paper";
import { l } from "../config/logger";
import mongoose from "mongoose";
import { queues } from "../config/enum";

class ArticlePersister {
  public async listenForEvents() {
    try {
      rabbitmq.consume(queues.RESEARCHER_QUEUE, async (message) => {
        if (message) {
          const profileToFetch: ArticleQueueMessage = JSON.parse(
            message.content.toString()
          );

          l.info(
            `[ARTICLE PERSISTER] Fetching data for ${profileToFetch.researcher.scholar_id} - admin: ${profileToFetch.admin_id} `
          );

          const articles = await articleScrapper.scrapeArticles(
            profileToFetch.researcher.scholar_id
          );

          l.info(
            `[ARTICLE PERSISTER] Found ${articles.length} articles for ${profileToFetch.researcher.scholar_id}`
          );

          for (let article of articles) {
            article.researcher = {
              researcher_id: new mongoose.Types.ObjectId(
                profileToFetch.researcher.researcher_id
              ),
              name: profileToFetch.researcher.name,
              scholar_id: profileToFetch.researcher.scholar_id,
            };
            article.admin_id = new mongoose.Types.ObjectId(
              profileToFetch.admin_id
            );

            article.publicationDate = new Date(article.publicationDate);

            const paper = new PaperModel(article);
            await paper.save();
          }

          await rabbitmq.publish(
            queues.CALCULATION_QUEUE,
            JSON.stringify({
              researcherId: profileToFetch.researcher.researcher_id,
              adminId: profileToFetch.admin_id,
            })
          );

          l.info(
            `[ARTICLE PERSISTER] Saved ${articles.length} articles for ${profileToFetch.researcher.scholar_id}`
          );

          rabbitmq.ack(message);
        }
      });
    } catch (err) {
      l.error(err, "[ARTICLE PERSISTER] Error in listening for events");
      throw err;
    }
  }
}

export const articlePersister = new ArticlePersister();
