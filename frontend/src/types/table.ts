export type SeatsType = "GENERAL" | "WINDOW" | "ROOM" | "BAR" | "OUTDOOR";

export const SEATS_TYPE_LABEL: Record<SeatsType, string> = {
  GENERAL: "일반석",
  WINDOW: "창가석",
  ROOM: "룸",
  BAR: "바 좌석",
  OUTDOOR: "야외석",
};
