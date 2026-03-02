import RestaurantCardSkeleton from "./RestaurantCardSkeleton";

export default function RestaurantListSkeleton({
  count = 8,
}: {
  count?: number;
}) {
  return (
    <div
      className="border rounded-xl bg-white overflow-hidden"
      role="status"
      aria-label="검색 결과 로딩 중"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx}>
          <RestaurantCardSkeleton />
          {idx !== count - 1 ? <div className="h-px bg-gray-100" /> : null}
        </div>
      ))}
    </div>
  );
}
