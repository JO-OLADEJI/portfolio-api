import {
  CanvasContact,
  FormContact,
  MeetingContact,
  TerminalContact,
} from "./types";
import Joi from "joi";

export const formSchema = Joi.object<FormContact>({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  message: Joi.string().min(5).max(300).required(),
  src: Joi.string().valid("form").required(),
});

export const terminalSchema = Joi.object<TerminalContact>({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  message: Joi.string().min(5).max(300).required(),
  src: Joi.string().valid("terminal").required(),
}).unknown(true);

export const meetingSchema = Joi.object<MeetingContact>({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  brand: Joi.string().min(2).required(),
  memorandum: Joi.string().min(5).max(300).required(),
  meetingTimestamp: Joi.number().min(new Date().valueOf()).required(),
  dateLiteral: Joi.string().required(),
  src: Joi.string().valid("meeting").required(),
});

export const canvasSchema = Joi.object<CanvasContact>({
  imageData: Joi.string()
    .regex(/^data:image\/png;base64,/)
    .required(),
  src: Joi.string().valid("canvas").required(),
});
