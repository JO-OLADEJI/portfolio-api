import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import {
  MeetingContact,
  FormContact,
  TerminalContact,
  CanvasContact,
} from "./types";
import dotenv from "dotenv";
dotenv.config();

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
    attachments:
      details.src === "canvas"
        ? [
            {
              filename: "image.png",
              path: `${details.imageData}`,
              cid: "unique@nodemailer.com",
            },
          ]
        : undefined,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
