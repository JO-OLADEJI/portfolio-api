import cors from "cors";
import express, { Request, Response, NextFunction } from "express";
import { formSchema, meetingSchema, terminalSchema } from "./schema";
import { nullCheck, dispatchMail } from "./middlewares";
import { readLogFile, logMeetingSchedule, readMeetingSchedule } from "./utils";

const port = 8000;
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (_: Request, res: Response) => {
  res.send("api.thecodeographer.com");
});

app.get("/api/logs", async (_: Request, res: Response) => {
  const logs = await readLogFile();
  res.status(200).json({ logs });
});

app.post(
  "/api/contact/form",
  nullCheck,
  async (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = formSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    req.body = value;
    next();
  },
  dispatchMail
);

app.post(
  "/api/contact/terminal",
  nullCheck,
  (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = terminalSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    req.body = value;
    next();
  },
  dispatchMail
);

app
  .route("/api/contact/meeting")
  .get(async (req: Request, res: Response) => {
    const timestamps = await readMeetingSchedule();
    return res.status(200).json({ scheduled: timestamps });
  })
  .post(
    nullCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { value, error } = meetingSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);
      await logMeetingSchedule(value.meetingTimestamp);
      req.body = value;
      next();
    },
    dispatchMail
  );

// app.post("/api/contact/canvas", nullCheck, (req: Request, res: Response) => {});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
