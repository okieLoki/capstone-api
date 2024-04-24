import { NextFunction, Request, Response } from "express";
import { AdminModel } from "../models/admin";
import {
  addResearcherValidator,
  createAdminAccountValidator,
  loginAccountValidator,
} from "../lib/validators/adminValidators";
import { sendEmailVerificationMail } from "../lib/services/emailService";
import createError from "http-errors";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config";
import mongoose from "mongoose";
import { ResearcherModel } from "../models/researcher";
import { researcherScrapper } from "../lib/scrapper/researcherScapper";
import { ResearcherData } from "../types";
import { PaperModel } from "../models/papers";

export class AdminController {
  public async createAdminAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { institute_name, email, password, address } =
        createAdminAccountValidator.parse(req.body);

      const existingAdmin = await AdminModel.findOne({ email });

      if (!existingAdmin?.verified) await AdminModel.deleteOne({ email });

      if (existingAdmin) throw new createError.Conflict("User already exists");

      const hashedPassword = await bcrypt.hash(password, 12);
      const emailVerificationToken = crypto.randomBytes(16).toString("hex");

      await AdminModel.create({
        institute_name,
        email,
        password: hashedPassword,
        address,
        email_verification_token: emailVerificationToken,
        email_verification_token_expiry: new Date(Date.now() + 3600000),
      });

      await sendEmailVerificationMail(email, emailVerificationToken);

      return res.status(201).json({
        message: "Account created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public async verifyAdminAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const token = req.query.token;

      if (!token) throw new createError.BadRequest("Token is required");

      const admin = await AdminModel.findOne({
        email_verification_token: token,
      });

      if (!admin) throw new createError.NotFound("Invalid or expired token");

      admin.verified = true;
      admin.email_verification_token = undefined;
      admin.email_verification_token_expiry = undefined;

      await admin.save();

      return res.status(200).json({
        message: "Account verified successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  public async loginAdminAccount(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { email, password } = loginAccountValidator.parse(req.body);

      const admin = await AdminModel.findOne({ email });

      if (!admin) throw new createError.NotFound("User not found");

      if (!admin.verified)
        throw new createError.Unauthorized("User not verified");

      const isPasswordValid = await bcrypt.compare(password, admin.password);

      if (!isPasswordValid)
        throw new createError.Unauthorized("Invalid password");

      const token = await jwt.sign(
        { id: admin._id.toString() },
        config.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.setHeader("Authorization", `Bearer ${token}`);

      return res.status(200).json({
        token,
        user: {
          email: admin.email,
          institute_name: admin.institute_name,
          address: admin.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
  public async addReseacher(req: Request, res: Response, next: NextFunction) {
    try {
      const admin = req.admin;
      const { scholar_id, email } = addResearcherValidator.parse(req.body);

      const researcher = await ResearcherModel.findOne({ scholar_id });

      if (researcher) {
        if (researcher.admin_id!.toString() === admin.id.toString())
          throw new createError.BadRequest("Researcher already added");
        else
          throw new createError.BadRequest(
            "Researcher already added by another admin"
          );
      }

      const reseacherData: ResearcherData =
        await researcherScrapper.getResearcherData(scholar_id);

      // if (
      //   reseacherData.emailEnding !== email.split("@")[1] ||
      //   admin.email.split("@")[1] !== email.split("@")[1]
      // ) {
      //   throw new createError.BadRequest("Email domain doesn't match");
      // }

      const newResearcher = await ResearcherModel.create({
        scholar_id,
        email,
        admin_id: admin.id,
        citations: reseacherData.citations,
        h_index: reseacherData.hIndex,
        i_index: reseacherData.i10Index,
        name: reseacherData.name,
      });

      const papersData = await researcherScrapper.scrapeArticles(scholar_id);
      papersData.forEach((paper) => {
        paper.researcher_id = newResearcher._id;
      });
      
      await PaperModel.insertMany(papersData);

      return res.status(201).json({
        message: "Researcher added successfully",
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
