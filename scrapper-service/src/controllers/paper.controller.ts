import { Request, Response, NextFunction } from "express";
import { PaperModel } from "../models/paper";

class PaperController {
  async getPapersByResearcherId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { researcherId } = req.params;

      const papers = await PaperModel.find({ researcher_id: researcherId });

      res.status(200).json(
        papers.map((paper) => ({
          title: paper.title,
          link: paper.link,
          authors: paper.authors,
          publication: paper.publication,
          publicationYear: paper.publicationYear,
          totalCitations: paper.totalCitations,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async getPapersByAdminId(req: Request, res: Response, next: NextFunction) {
    try {
      const { adminId } = req.params;

      const papers = await PaperModel.find({ admin_id: adminId });

      res.status(200).json(
        papers.map((paper) => ({
          title: paper.title,
          link: paper.link,
          authors: paper.authors,
          publication: paper.publication,
          publicationYear: paper.publicationYear,
          totalCitations: paper.totalCitations,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async getPapersByYearAndAdminId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId, year } = req.params;

      const papers = await PaperModel.find({
        admin_id: adminId,
        publicationYear: year,
      });

      res.status(200).json(
        papers.map((paper) => ({
          title: paper.title,
          link: paper.link,
          authors: paper.authors,
          publication: paper.publication,
          publicationYear: paper.publicationYear,
          totalCitations: paper.totalCitations,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async getPapersByYearAndResearcherId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { researcherId, year } = req.params;

      const papers = await PaperModel.find({
        researcher_id: researcherId,
        publicationYear: year,
      });

      res.status(200).json(
        papers.map((paper) => ({
          title: paper.title,
          link: paper.link,
          authors: paper.authors,
          publication: paper.publication,
          publicationYear: paper.publicationYear,
          totalCitations: paper.totalCitations,
        }))
      );
    } catch (error) {
      next(error);
    }
  }

  async getTotalCitationsByResearcherId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { researcherId } = req.params;
      const papers = await PaperModel.find({
        researcher_id: researcherId,
      });

      const totalCitations = papers.reduce(
        (acc, paper) => acc + paper.totalCitations,
        0
      );

      res.status(200).json({
        totalCitations,
      });
    } catch (error) {}
  }

  async getTotalCitationsByResearcherIdAndYear(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { researcherId, year } = req.params;
      const papers = await PaperModel.find({
        researcher_id: researcherId,
        publicationYear: year,
      });

      const totalCitations = papers.reduce(
        (acc, paper) => acc + paper.totalCitations,
        0
      );

      res.status(200).json({
        totalCitations,
      });
    } catch (error) {}
  }

  async getTotalCitationsByResearcherIdAndYearRange(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { researcherId, startYear, endYear } = req.params;
      const papers = await PaperModel.find({
        researcher_id: researcherId,
        publicationYear: {
          $gte: startYear,
          $lte: endYear,
        },
      });

      const totalCitations = papers.reduce(
        (acc, paper) => acc + paper.totalCitations,
        0
      );

      res.status(200).json({
        totalCitations,
      });
    } catch (error) {}
  }

  async getTotalCitationsByAdminId(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { adminId } = req.params;
      const papers = await PaperModel.find({
        admin_id: adminId,
      });

      const totalCitations = papers.reduce(
        (acc, paper) => acc + paper.totalCitations,
        0
      );

      return res.status(200).json({
        totalCitations,
      });
    } catch (error) {}
  }
}
