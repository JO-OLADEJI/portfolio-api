export interface Contact {
  email: string;
  src: "meeting" | "terminal" | "form";
}

export interface MeetingContact extends Contact {
  brand: string;
  memorandum: string;
  meetingTimestamp: number;
}

export interface FormContact extends Contact {
  name: string;
  message: string;
}

export interface TerminalContact extends FormContact {
  [key: string]: string;
}
