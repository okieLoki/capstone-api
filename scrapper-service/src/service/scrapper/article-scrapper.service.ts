import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import type { Article, ArticleExtended } from "../../types";
import { load } from "cheerio";

puppeteer.use(StealthPlugin());
puppeteer.use(
  AdblockerPlugin({
    blockTrackers: true,
  })
);

class ArticleScrapper {
  public async getIndividualArticleData(
    articleLink: string
  ): Promise<ArticleExtended> {
    try {
      const browser = await puppeteer.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });

      const page = await browser.newPage();
      await page.goto(articleLink, {
        waitUntil: "networkidle0",
      });

      const content = await page.content();
      const $ = load(content);

      const title = $("#gsc_oci_title").text().trim();
      const authors = $(".gsc_oci_value").first().text().trim();
      const publicationDate = $('.gsc_oci_field:contains("Publication date")')
        .next()
        .text()
        .trim();
      const journal = $('.gsc_oci_field:contains("Journal")')
        .next()
        .text()
        .trim();
      const volume = $('.gsc_oci_field:contains("Volume")')
        .next()
        .text()
        .trim();
      const issue = $('.gsc_oci_field:contains("Issue")').next().text().trim();
      const pages = $('.gsc_oci_field:contains("Pages")').next().text().trim();
      const publisher = $('.gsc_oci_field:contains("Publisher")')
        .next()
        .text()
        .trim();
      const description = $("#gsc_oci_descr .gsh_csp").text().trim();
      const totalCitationsText = $('.gsc_oci_value a[href*="cites"]')
        .first()
        .text()
        .trim();
      const totalCitations = totalCitationsText.match(/\d+/)
        ? parseInt(totalCitationsText.match(/\d+/)![0])
        : 0;
      const publicationLink = $('.gsc_oci_merged_snippet a[href*="cluster"]')
        .first()
        .attr("href");
      const pdfLink = $('.gsc_oci_title_ggi a[href*="pdf"]')
        .first()
        .attr("href");

      await browser.close();

      return {
        title,
        link: articleLink,
        authors: authors.split(", "),
        publicationDate,
        journal,
        volume,
        issue,
        pages,
        publisher,
        description,
        totalCitations,
        publicationLink: `https://scholar.google.com${publicationLink}`,
        pdfLink: pdfLink || "No PDF available",
      };
    } catch (error) {
      throw new Error(error as string);
    }
  }

  public async scrapeArticles(
    userId: string,
    articlePagination: boolean = true,
    detailed: boolean = false
  ) {
    try {
      let articles: (Article | ArticleExtended)[] = [];
      let pageNumber: number = 1;
      let hasNextPage: boolean = true;

      const browser = await puppeteer.launch({
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
      });

      const page = await browser.newPage();
      await page.goto(
        `https://scholar.google.com/citations?user=${userId}&hl=en&gl=us&pagesize=100`,
        {
          waitUntil: "networkidle0",
        }
      );

      while (hasNextPage) {
        const content = await page.content();
        const $ = load(content);
        const articleLinks: string[] = [];


        if (detailed) {
          $(".gsc_a_tr").each((_i, el) => {
            const articleLink = `https://scholar.google.com${$(el)
              .find(".gsc_a_at")
              .attr("href")}`;
            articleLinks.push(articleLink);
          });

          for (let link of articleLinks) {
            const articleData = await this.getIndividualArticleData(link);
            articles.push(articleData);
          }
        } else {
          $(".gsc_a_tr").each((_i, el) => {
            let articleTitle = $(el).find(".gsc_a_at").text();
            let articleLink = `https://scholar.google.com${$(el)
              .find(".gsc_a_at")
              .attr("href")}`;
            let articleAuthors = $(el).find(".gsc_a_at + .gs_gray").text();
            let articlePublication = $(el).find(".gs_gray + .gs_gray").text();
            let totalCitations = $(el).find(".gsc_a_ac").text();
            let publicationYear = $(el).find(".gsc_a_hc").text();

            articles.push({
              title: articleTitle,
              link: articleLink,
              authors: articleAuthors.split(", "),
              publication: articlePublication,
              publicationYear: publicationYear ? parseInt(publicationYear) : 0,
              totalCitations: totalCitations ? parseInt(totalCitations) : 0,
            });
          });
        }

        hasNextPage = articlePagination && $(".gsc_a_e").length > 0;
        if (hasNextPage) {
          pageNumber += 100;
          await page.goto(
            `https://scholar.google.com/citations?user=${userId}&hl=en&gl=us&cstart=${pageNumber}&pagesize=100`,
            {
              waitUntil: "networkidle0",
            }
          );
        }
      }

      await browser.close();

      return articles;
    } catch (error) {
      throw new Error(error as string);
    }
  }
}

export const articleScrapper = new ArticleScrapper();
