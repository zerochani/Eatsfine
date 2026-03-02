import type { RestaurantSummary } from "@/types/store";
import RestaurantCard from "./RestaurantCard";

type Props = {
  restaurants: RestaurantSummary[];
  onSelect: (restaurant: RestaurantSummary) => void;
};

export default function RestaurantList({ restaurants, onSelect }: Props) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {restaurants.map((r, idx) => (
        <div key={r.id}>
          <RestaurantCard restaurant={r} onClick={() => onSelect(r)} />
          {idx !== restaurants.length - 1 ? (
            <div className="h-px bg-gray-100" />
          ) : null}
        </div>
      ))}
    </div>
  );
}
