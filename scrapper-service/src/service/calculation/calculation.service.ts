import { rabbitmq } from "../../config/rabbitmq";
import { queues } from "../../config/enum";
import { l } from "../../config/logger";
import { PaperModel } from "../../models/paper";
import { YearWiseDataModel } from "../../models/yearWise";
import axios from "axios";

class CalculationService {
  private articles: any;
  private researcherId: string;
  private adminId: string;

  public async listenForCalculationRequests() {
    try {
      rabbitmq.consume(queues.CALCULATION_QUEUE, async (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          this.researcherId = data.researcherId;
          this.adminId = data.adminId;

          l.info(
            `[CALCULATION SERVICE]: Received request for researcherId: ${this.researcherId} and adminId: ${this.adminId}`
          );

          this.articles = await PaperModel.find({
            admin_id: this.adminId,
            "researcher.researcher_id": this.researcherId,
          });

          await this.tagArticles();
          await this.getYearWiseData();

          l.info(
            `[CALCULATION SERVICE]: Calculation completed for researcherId: ${this.researcherId} and adminId: ${this.adminId}`
          );

          rabbitmq.ack(msg);
        }
      });
    } catch (error) {
      l.error(
        error,
        "[CALCULATION SERVICE]: Error in listenForCalculationRequests"
      );
    }
  }

  private async tagArticles() {
    try {
      for (const article of this.articles) {
        const response = await axios.post("http://localhost:5000/predict", {
          title: article.title,
          description: article.description,
        });

        article.tags = response.data.predicted_tags;
        await article.save();
      }
      l.info("[CALCULATION SERVICE]: Tagging completed");
    } catch (error) {
      l.error(error, "[CALCULATION SERVICE]: Error in tagArticles");
    }
  }

  private async getYearWiseData() {
    try {
      const yearWiseData: any = {};

      for (const article of this.articles) {
        const year = new Date(article.publicationDate).getFullYear();
        if (yearWiseData[year]) {
          yearWiseData[year].push(article);
        } else {
          yearWiseData[year] = [article];
        }
      }

      const yearWiseDataProcessed = {};
      Object.keys(yearWiseData).forEach((year) => {
        const data = yearWiseData[year];

        yearWiseDataProcessed[year] = {
          researcher_id: this.researcherId,
          admin_id: this.adminId,
          totalCitations: data.reduce(
            (acc, article) => acc + article.totalCitations,
            0
          ),
          totalArticles: data.length,
          tags: data.reduce((acc, article) => {
            acc.push(...article.tags);
            return acc;
          }, []),
        };
      });

      console.log(yearWiseDataProcessed);

      await YearWiseDataModel.create(yearWiseDataProcessed);
      l.info("[CALCULATION SERVICE]: Year wise data saved to database");
    } catch (error) {
      l.error(error, "[CALCULATION SERVICE]: Error in getYearWiseData");
    }
  }

  private calculateHIndex(citations: number[]) {
    citations.sort((a, b) => b - a);
    let hIndex = 0;
    for (let i = 0; i < citations.length; i++) {
      if (citations[i] >= i + 1) {
        hIndex = i + 1;
      }
    }
    return hIndex;
  }

    private calculateIIndex(citations: number[]) {
        return citations.filter((citation) => citation >= 10).length;
    }
}

export const calculationService = new CalculationService();
