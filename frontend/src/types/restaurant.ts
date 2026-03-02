import type { SelectedMenu } from "@/types/menus";
import type { DepositRate } from "@/types/payment";

export type Restaurant = {
  id: number;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  isApproved: boolean;
  operatingHours: {
    open: string;
    close: string;
    breakTime?: {
      start: string;
      end: string;
    };
  };
  totalSeats: number;
  address: string;
  location?: {
    lat: number;
    lng: number;
  };
  description: string;
  seatImages: Array<{
    url: string;
    alt: string;
  }>;
  markerPosition: {
    leftPct: number;
    topPct: number;
  };
  thumbnailUrl?: string;
  paymentPolicy?: PaymentPolicy;
};

export const SEATS = [
  "일반석",
  "창가석",
  "룸/프라이빗",
  "바(Bar)석",
  "야외석",
] as const;
export type SeatType = (typeof SEATS)[number];
export type TablePref = "split_ok" | "one_table";

export type ReservationDraft = {
  people: number;
  date: Date;
  time: string;
  seatType: SeatType;
  tablePref: TablePref;
  tableId: number;
  tableNo: number | null;
  selectedMenus: SelectedMenu[];
};

export type PaymentPolicy = {
  depositRate: DepositRate;
  notice?: string;
};

export type SeatTable = {
  id: number;
  tableNo: number;
  minPeople: number;
  maxPeople: number;
  seatType: SeatType;
  gridX: number;
  gridY: number;
  imageUrl?: string;
};

export type SeatLayout = {
  gridCols: number;
  gridRows: number;
  tables: SeatTable[];
};

export type Step = "form" | "confirm";
