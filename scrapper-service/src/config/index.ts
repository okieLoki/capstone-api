import "dotenv/config";

class Config {
  public readonly PORT: number;
  public readonly DATABASE_URL: string;
  public readonly RABBITMQ_URL: string;
  public readonly LOG_LEVEL: string;

  constructor() {
    this.PORT = Number(process.env.PORT) || 3000;
    this.DATABASE_URL = process.env.DATABASE_URL || "";
    this.RABBITMQ_URL = process.env.RABBITMQ_URL || "";
    this.LOG_LEVEL = process.env.LOG_LEVEL || "info";
  }
  public verifyConfig() {
    const errors: string[] = [];

    const requiredConfig = ["DATABASE_URL", "RABBITMQ_URL"];

    requiredConfig.forEach((config) => {
      if (!this[config]) {
        errors.push(`Missing ${config} in config`);
      }
    });

    if (errors.length) {
      throw new Error(errors.join("\n"));
    }
  }
}

export const config = new Config();
