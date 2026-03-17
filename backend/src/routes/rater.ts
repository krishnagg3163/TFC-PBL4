import { Router, Request, Response } from "express";

export const raterRouter = Router();

raterRouter.post("/rate", (_req: Request, res: Response) => {
  res.json({
    overall: 4.2,
    scores: {
      style: 4,
      color: 4,
      texture: 4.5,
      fit: 4.3,
    },
    feedback: "Great outfit!",
  });
});
