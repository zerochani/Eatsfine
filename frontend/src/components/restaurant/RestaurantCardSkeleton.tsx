export default function RestaurantCardSkeleton() {
  return (
    <div className="w-full px-5 py-4" aria-hidden="true">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-5 w-2/3 rounded bg-gray-200 animate-pulse" />
          <div className="mt-2 h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
