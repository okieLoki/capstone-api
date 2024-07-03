import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import AdblockerPlugin from "puppeteer-extra-plugin-adblocker";
import { ArticleExtended } from "../../types";
import { load } from "cheerio";
import * as async from "async";

puppeteer.use(StealthPlugin());
puppeteer.use(
  AdblockerPlugin({
    blockTrackers: true,
  })
);

class ArticleScrapper {
  private async getIndividualArticleData(
    articleLink: string
  ): Promise<ArticleExtended> {
    const browser = await puppeteer.launch({
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });

    try {
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
    } finally {
      await browser.close();
    }
  }

  public async scrapeArticles(
    userId: string,
    articlePagination: boolean = true
  ): Promise<ArticleExtended[]> {
    let articles: ArticleExtended[] = [];
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

      $(".gsc_a_tr").each((_i, el) => {
        const articleLink = `https://scholar.google.com${$(el)
          .find(".gsc_a_at")
          .attr("href")}`;
        articleLinks.push(articleLink);
      });

      const articleDataArray = await async.mapLimit(
        articleLinks,
        20,
        async (link) => await this.getIndividualArticleData(link)
      );
      articles.push(...(articleDataArray as ArticleExtended[]));

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
  }
}

export const articleScrapper = new ArticleScrapper();
