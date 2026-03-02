import type { SeatType, TablePref } from "@/types/restaurant";

export function tablePrefLabel(v: TablePref) {
  return v === "split_ok"
    ? "테이블 떨어져도 상관없어요"
    : "한 테이블에서만 먹을거에요";
}

export function seatsTypeToSeatType(s: string): SeatType {
  switch (s) {
    case "GENERAL":
      return "일반석";
    case "WINDOW":
      return "창가석";
    case "ROOM":
      return "룸/프라이빗";
    case "BAR":
      return "바(Bar)석";
    case "OUTDOOR":
      return "야외석";
    default:
      return "일반석";
  }
}
