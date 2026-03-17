import { Router, Request, Response } from "express";

export const stylistRouter = Router();

stylistRouter.post("/chat", (_req: Request, res: Response) => {
  res.json({
    message: "Here is your outfit suggestion!",
    outfit: [],
  });
});
