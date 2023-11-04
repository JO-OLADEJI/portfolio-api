import * as fs from "fs";
import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import {
  MeetingContact,
  FormContact,
  TerminalContact,
  CanvasContact,
} from "./types";
import dotenv from "dotenv";
dotenv.config();

const logFilePath = "error.log";
const scheduledFilePath = "meetings.log";

const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.CDGR_RESPONDER,
    pass: process.env.CDGR_RESPONDER_AUTH,
  },
});

export const dispatchMailToCDGR = async (
  details: MeetingContact | FormContact | TerminalContact | CanvasContact
): Promise<boolean> => {
  const fmtSource =
    details.src.charAt(0).toUpperCase() + details.src.slice(1).toLowerCase();

  const mailOptions: SendMailOptions = {
    from: `"theCodeographer 🥷" <${process.env.CDGR_RESPONDER}>`,
    to: `${process.env.CDGR_TARGET}`,
    subject: `New ${fmtSource} Message.`,
    html: `
    <div>
      <font face="monospace">
        <h3 style="font-size: 2rem; margin-bottom: 1rem;">thecodeographer&#174;</h3>
        ${
          details.src === "canvas"
            ? `<img src="cid:unique@nodemailer.com" width="500" alt="embedded canvas" />`
            : Object.keys(details).map(
                (key) =>
                  `<p style="font-size: 1rem; margin: 0;"><b>${key}:</b> ${
                    (details as any)[key]
                  }</p>`
              )
        }
      </font>
    </div>`,
    attachments: [
      {
        filename: "image.png",
        path: `${details.src === "canvas" && details.imageData}`,
        cid: "unique@nodemailer.com",
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logErrorToFile(error as Error);
    return false;
  }
};

export const logErrorToFile = async (error: Error): Promise<void> => {
  const timestamp = new Date().toLocaleString();
  const errorMessage = `\n${timestamp} - ${error.stack}\n`;
  try {
    await fs.promises.appendFile(logFilePath, errorMessage);
  } catch (error) {
    console.error("Error writing to the log file:", error);
  }
};

export const readLogFile = async (): Promise<string> => {
  try {
    const data = await fs.promises.readFile(logFilePath, "utf8");
    return data;
  } catch (error) {
    console.error("Error reading the log file:", error);
    return "";
  }
};

export const logMeetingSchedule = async (timestamp: number): Promise<void> => {
  try {
    const data = await fs.promises.readFile(scheduledFilePath, "utf8");
    await fs.promises.appendFile(
      scheduledFilePath,
      `${data ? "\n" : ""}${timestamp}`
    );
  } catch (error) {
    console.error("Error writing to the meetings log:", error);
  }
};

export const readMeetingSchedule = async (): Promise<number[]> => {
  try {
    const data = await fs.promises.readFile(scheduledFilePath, "utf8");
    const timestamps = data ? data.split("\n") : [];
    return timestamps.map((timestamp) => parseInt(timestamp));
  } catch (error) {
    console.error("Error reading the log file:", error);
    return [];
  }
};
