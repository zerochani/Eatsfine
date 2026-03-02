import { categoryLabel, type RestaurantSummary } from "@/types/store";

type Props = {
  restaurant: RestaurantSummary;
  onClick: () => void;
};

export default function RestaurantCard({ restaurant, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {restaurant.name}
          </p>
          <p className="mt-1 text-sm text-gray-500 truncate">
            {categoryLabel[restaurant.category]} • {restaurant.address}
          </p>
        </div>
      </div>
    </button>
  );
}
