import { cn } from "@/lib/utils";
import type { SeatLayout, SeatTable, SeatType } from "@/types/restaurant";

type Props = {
  layout: SeatLayout;
  availableIds: Set<number>;
  selectedTableId: number | null;
  seatType: SeatType | null;
  onSelectTable: (tableId: number) => void;
  onSelectSeatType: (seatType: SeatType) => void;
};

export default function TableMap({
  layout,
  availableIds,
  selectedTableId,
  seatType,
  onSelectTable,
  onSelectSeatType,
}: Props) {
  const selectedTable = selectedTableId
    ? (layout.tables.find((t) => t.id === selectedTableId) ?? null)
    : null;

  const activeSeatType: SeatType | null =
    selectedTable?.seatType ?? seatType ?? null;

  const shouldDimOthers = activeSeatType !== null;

  return (
    <div className="border rounded-xl bg-gray-50 p-3">
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 border rounded bg-white" /> 선택 가능
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 border rounded bg-red-400" /> 예약 불가
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 border border-blue-400 rounded bg-blue-100" />{" "}
          선택됨
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-3 w-3 border rounded bg-gray-300" /> 다른 좌석유형
        </span>
      </div>
      <div
        className="w-full"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${layout.gridCols}, minmax(0,1fr))`,
          gridTemplateRows: `repeat(${layout.gridRows}, 56px)`,
          gap: 8,
        }}
      >
        {layout.tables.map((t: SeatTable) => {
          const isAvailable = availableIds.has(t.id);
          const isSelected = selectedTableId === t.id;
          const isActiveType = activeSeatType
            ? t.seatType === activeSeatType
            : true;
          const peopleText =
            t.minPeople === t.maxPeople
              ? `${t.minPeople}명`
              : `${t.minPeople}~${t.maxPeople}명`;
          return (
            <button
              key={t.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => {
                if (!isAvailable) return;
                onSelectTable(t.id);
                onSelectSeatType(t.seatType);
              }}
              className={cn(
                "border rounded-lg text-left px-2 py-2 transition-colors bg-white",
                shouldDimOthers && !isActiveType && "bg-gray-300",
                !isAvailable &&
                  "bg-red-100 text-red-700 border-red-200 cursor-not-allowed",
                isSelected && "bg-blue-100 border-blue-400 border-2",
                isAvailable && "hover:brightness-95 cursor-pointer",
              )}
              style={{
                gridColumnStart: t.gridX + 1,
                gridRowStart: t.gridY + 1,
              }}
            >
              <div className="text-center">
                <div className="text-sm">{t.tableNo}번</div>
                <div className="text-xs text-muted-foreground">
                  {peopleText}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
