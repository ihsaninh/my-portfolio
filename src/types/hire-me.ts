export type Mode = "HR" | "TECH";

export type MessageSegment = {
  type: "text" | "bold" | "italic";
  content: string;
};

export type MessagePart = {
  type: string;
  text?: string;
};

export type ChatMessage = {
  id: string;
  role: string;
  parts: MessagePart[];
};
