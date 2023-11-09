import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  arrayUnion,
} from "firebase/firestore/lite";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import express, { Request, Response, NextFunction } from "express";
import {
  formSchema,
  meetingSchema,
  terminalSchema,
  canvasSchema,
} from "./schema";
import { nullCheck, dispatchMail } from "./middlewares";

dotenv.config();
const firebaseConfig = {
  apiKey: process.env.FB_API_KEY,
  authDomain: process.env.FB_AUTH_DOMAIN,
  projectId: process.env.FB_PROJECT_ID,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  messagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  appId: process.env.FB_APP_ID,
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const port = 8000;
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

app.get("/", async (_: Request, res: Response) => {
  res.send("api.thecodeographer.com");
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
    try {
      const contactCol = collection(db, "contact");
      const meetingSnapshot = await getDocs(contactCol);
      const timestampDoc = meetingSnapshot.docs.map((doc) => doc.data())[0];
      const timestamps: number[] = timestampDoc.timestamps;
      return res.status(200).json({ scheduled: timestamps });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ scheduled: [] });
    }
  })
  .post(
    nullCheck,
    async (req: Request, res: Response, next: NextFunction) => {
      const { value, error } = meetingSchema.validate(req.body);
      if (error) return res.status(400).send(error.details[0].message);

      try {
        const meetingRef = doc(db, "contact", "meeting");
        await updateDoc(meetingRef, {
          timestamps: arrayUnion(value.meetingTimestamp),
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false });
      }

      req.body = value;
      next();
    },
    dispatchMail
  );

app.post(
  "/api/contact/canvas",
  nullCheck,
  (req: Request, res: Response, next: NextFunction) => {
    const { value, error } = canvasSchema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    req.body = value;
    next();
  },
  dispatchMail
);

app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});
