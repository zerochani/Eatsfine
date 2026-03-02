import type { BusinessHour, Day, RequestStoreCreateDto } from "@/types/store";
import type { StoreInfoFormValues } from "./StoreInfo.schema";

export const formatSido = (sido: string): string => {
  const mapping: Record<string, string> = {
    서울: "서울특별시",
    부산: "부산광역시",
    대구: "대구광역시",
    인천: "인천광역시",
    광주: "광주광역시",
    대전: "대전광역시",
    울산: "울산광역시",
    세종: "세종특별자치시",
    경기: "경기도",
    강원: "강원특별자치도",
    충북: "충청북도",
    충남: "충청남도",
    전북: "전북특별자치도",
    전남: "전라남도",
    경북: "경상북도",
    경남: "경상남도",
    제주: "제주특별자치도",
  };
  return mapping[sido] || sido;
};

export const formatTimeToBackend = (timeStr: string | undefined): string => {
  if (!timeStr) {
    throw new Error("영업 시간은 필수입니다.");
  }
  return timeStr;
};

const formatCoordinate = (
  value: number | string | undefined,
  name: string,
): number => {
  if (value == null || value === undefined || value === "") {
    throw new Error(`${name} 정보가 누락되었습니다. 주소를 다시 검색해주세요.`);
  }
  const num = Number(value);
  if (Number.isNaN(num)) throw new Error(`${name} 형식이 올바르지 않습니다.`);
  return num;
};

export const transformToRegister = (
  step1Data: { name: string; businessNumber: string; startDate: string },
  step2Data: StoreInfoFormValues,
): RequestStoreCreateDto => {
  const {
    address,
    detailAddress,
    sido,
    openTime,
    closeTime,
    holidays = [],
    latitude,
    longitude,
  } = step2Data;

  const fullAddress =
    detailAddress && address ? `${address} ${detailAddress}` : address || "";

  const weekDays: Day[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
    "SUNDAY",
  ];

  const businessHours: BusinessHour[] = weekDays.map((day) => {
    const isClosed = holidays.includes(day);
    return {
      day,
      openTime: isClosed ? null : formatTimeToBackend(openTime),
      closeTime: isClosed ? null : formatTimeToBackend(closeTime),
      isClosed,
    };
  });

  return {
    storeName: step2Data.storeName,
    businessNumberDto: {
      name: step1Data.name,
      businessNumber: step1Data.businessNumber,
      startDate: step1Data.startDate,
    },
    description: step2Data.description,
    sido: formatSido(sido),
    sigungu: step2Data.sigungu,
    bname: step2Data.bname,
    address: fullAddress,
    latitude: formatCoordinate(latitude, "위도"),
    longitude: formatCoordinate(longitude, "경도"),
    phoneNumber: step2Data.phoneNumber,
    category: step2Data.category,
    depositRate: step2Data.depositRate,
    bookingIntervalMinutes: step2Data.bookingIntervalMinutes || 0,
    businessHours,
  };
};
