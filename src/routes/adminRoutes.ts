import { Router } from "express";
import { AdminController } from "../controllers/adminController";

class AdminRouter {
  public router: Router;

  constructor() {
    this.router = Router();
  }

  routes() {
    this.router.post("/signin", AdminController.prototype.createAdminAccount);
    this.router.get("/email/verify", AdminController.prototype.verifyAdminAccount);

    this.router.post("/login", AdminController.prototype.loginAdminAccount);

    return this.router;
  }
}

export const adminRouter = new AdminRouter();
