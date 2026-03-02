import type { DepositRate } from "@/types/store";

const DEPOSIT_RATE_MAP: Record<DepositRate, number> = {
  TEN: 0.1,
  TWENTY: 0.2,
  THIRTY: 0.3,
  FORTY: 0.4,
  FIFTY: 0.5,
};

export function calcDeposit(totalPrice: number, rate: DepositRate) {
  return Math.round(totalPrice * DEPOSIT_RATE_MAP[rate]);
}
