import { FormContact, TerminalContact } from "./types";
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

export const meetingSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required(),
  brand: Joi.string().min(2).required(),
  memorandum: Joi.string().min(5).max(300).required(),
  meetingTimestamp: Joi.number().min(new Date().valueOf()).required(),
  src: Joi.string().valid("meeting").required(),
});
