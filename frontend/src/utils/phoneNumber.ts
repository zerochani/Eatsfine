export function phoneNumber(value: string) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  // 서울 지역번호
  if (numbers.startsWith("02")) {
    const seoulNumbers = numbers.slice(0, 10);
    if (seoulNumbers.length <= 2) return seoulNumbers;
    if (seoulNumbers.length <= 6)
      return seoulNumbers.replace(/(\d{2})(\d+)/, "$1-$2");
    if (seoulNumbers.length <= 9)
      return seoulNumbers.replace(/(\d{2})(\d{3})(\d+)/, "$1-$2-$3");
    return seoulNumbers.replace(/(\d{2})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  // 기타 지역 / 휴대폰
  const otherNumbers = numbers.slice(0, 11);
  if (otherNumbers.length <= 3) return otherNumbers;
  if (otherNumbers.length <= 7)
    return otherNumbers.replace(/(\d{3})(\d+)/, "$1-$2");
  if (otherNumbers.length <= 10)
    return otherNumbers.replace(/(\d{3})(\d{3})(\d+)/, "$1-$2-$3");
  return otherNumbers.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
}
