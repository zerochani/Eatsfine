import type { DepositRate } from "@/types/payment";

export function toDepositRate(rate: number): DepositRate {
  switch (rate) {
    case 10:
      return "TEN";
    case 20:
      return "TWENTY";
    case 30:
      return "THIRTY";
    case 40:
      return "FORTY";
    case 50:
      return "FIFTY";
    default:
      return "TEN";
  }
}
