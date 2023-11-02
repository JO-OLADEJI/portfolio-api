import express, { Request, Response, NextFunction } from "express";
import { dispatchMailToCDGR } from "./utils";

export const nullCheck = (req: Request, res: Response, next: NextFunction) => {
  if (JSON.stringify(req.body) === "{}")
    return res.status(400).send({ error: "bad request" });
  next();
};

export const dispatchMail = async (req: Request, res: Response) => {
  const through = await dispatchMailToCDGR(req.body);
  return through
    ? res.status(200).json({ success: true })
    : res.status(400).json({ error: "error occured sending mail" });
};
