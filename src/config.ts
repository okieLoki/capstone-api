import "dotenv/config";
import mongoose from "mongoose";

class Config {
  public readonly PORT: number;
  public readonly DATABASE_URL: string;
  public readonly SMTP_USER: string;
  public readonly SMTP_PASS: string;
  public readonly JWT_SECRET: string;
  public readonly BASE_URL: string;

  constructor() {
    this.PORT = Number(process.env.PORT) || 8080;
    this.DATABASE_URL = process.env.DATABASE_URL || "";
    this.SMTP_USER = process.env.SMTP_USER || "";
    this.SMTP_PASS = process.env.SMTP_PASS || "";
    this.JWT_SECRET = process.env.JWT_SECRET || "";
    this.BASE_URL = process.env.BASE_URL || `http://localhost:${this.PORT}`;
  }

  public verifyConfig(): void {
    const errors: string[] = [];

    const envVariables = [
      "DATABASE_URL",
      "SMTP_USER",
      "SMTP_PASS",
      "JWT_SECRET",
    ];

    envVariables.forEach((envVariable) => {
      if (!process.env[envVariable]) {
        errors.push(`Missing ${envVariable} in environment variables`);
      }
    });

    if (errors.length > 0) {
      throw new Error(errors.join("\n"));
    }
  }

  public databaseConnection(): void {
    mongoose.connect(this.DATABASE_URL);

    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => {
      console.log("Connected to database");
    });
  }
}

export const config: Config = new Config();
