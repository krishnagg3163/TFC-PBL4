import { Router, Request, Response } from "express";

export const finderRouter = Router();

finderRouter.post("/identify", (_req: Request, res: Response) => {
  res.json({
    items: [
      {
        name: "White T-Shirt",
        category: "tops",
        brand: "Unknown",
      },
    ],
  });
});
