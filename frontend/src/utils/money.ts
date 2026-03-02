export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR").format(value);
}
