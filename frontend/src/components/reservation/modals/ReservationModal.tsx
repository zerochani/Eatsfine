import {
  SEATS,
  type ReservationDraft,
  type SeatLayout,
  type SeatType,
  type TablePref,
} from "@/types/restaurant";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarIcon, Clock3, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Calendar } from "../../ui/calendar";
import { Button } from "../../ui/button";
import { startOfTodayInKst, toYmd } from "@/utils/date";
import TableMap from "../parts/TableMap";
import { useConfirmClose } from "@/hooks/common/useConfirmClose";
import { useDepositRate } from "@/hooks/reservation/useDepositRate";
import { useAvailableTimes } from "@/hooks/reservation/useAvailableTimes";
import { useAvailableTables } from "@/hooks/reservation/useAvailableTables";
import { seatsTypeToSeatType } from "@/utils/reservation";
import type { RestaurantDetail } from "@/types/store";
import { useModalPresence } from "@/hooks/common/useModalPresence";
import { backdropMotionClass, panelMotionClass } from "@/utils/modalMotion";

type Props = {
  open: boolean;
  restaurant: RestaurantDetail;
  initialDraft?: ReservationDraft;
  onClickConfirm: (draft: ReservationDraft) => void;
  onClose: () => void;
};

const PEOPLE = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ReservationModal({
  open,
  restaurant,
  initialDraft,
  onClickConfirm,
  onClose,
}: Props) {
  const [people, setPeople] = useState<number>(2);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("");
  const [seatType, setSeatType] = useState<SeatType | null>(null);
  const [tablePref, setTablePref] = useState<TablePref>("split_ok");
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  const storeId = restaurant.id;
  const dateYmd = date ? toYmd(date) : undefined;
  const isSplitAccepted = tablePref === "split_ok";
  const canQueryTables = !!dateYmd && !!time;

  const timesQuery = useAvailableTimes({
    storeId,
    date: dateYmd,
    partySize: people,
    isSplitAccepted,
  });
  const availableTablesQuery = useAvailableTables(
    canQueryTables
      ? {
          storeId,
          date: dateYmd!,
          time,
          partySize: people,
          isSplitAccepted,
        }
      : null,
  );
  const { rate: depositRate } = useDepositRate(restaurant.id);
  const { rendered, entered } = useModalPresence(open, 220);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (!open) {
      didInitRef.current = false;
      return;
    }
    if (didInitRef.current) return;
    didInitRef.current = true;
    if (initialDraft) {
      setPeople(initialDraft.people);
      setDate(initialDraft.date);
      setTime(initialDraft.time);
      setSeatType(initialDraft.seatType);
      setTablePref(initialDraft.tablePref);
      setSelectedTableId(initialDraft.tableId);
    } else {
      setPeople(2);
      setDate(undefined);
      setTime("");
      setSeatType(null);
      setTablePref("split_ok");
      setSelectedTableId(null);
    }
  }, [open]);

  const todayKst = startOfTodayInKst();

  const layout: SeatLayout | null = useMemo(() => {
    const data = availableTablesQuery.data;
    if (!data) return null;

    return {
      gridRows: data.rows,
      gridCols: data.cols,
      tables: data.tables.map((t) => ({
        id: t.tableId,
        tableNo:
          parseInt((t.tableNumber ?? "").replace(/\D/g, ""), 10) || t.tableId,
        seatType: seatsTypeToSeatType(t.seatsType),
        minPeople: 1,
        maxPeople: t.tableSeats,
        gridX: t.gridX,
        gridY: t.gridY,
        widthSpan: t.widthSpan || 1,
        heightSpan: t.heightSpan || 1,
      })),
    };
  }, [availableTablesQuery.data]);

  const availableIds = useMemo(() => {
    const data = availableTablesQuery.data;
    if (!data) return new Set<number>();
    return new Set<number>(data.tables.map((t) => t.tableId));
  }, [availableTablesQuery.data]);

  const canSubmit = !!date && !!time && !!selectedTableId && !!seatType;

  const seatTypeExists = useMemo(() => {
    if (!layout) return new Set<SeatType>();
    return new Set(layout.tables.map((t) => t.seatType));
  }, [layout]);

  const seatOptions = useMemo(() => {
    if (!layout) return SEATS;
    return SEATS.filter((s) => seatTypeExists.has(s));
  }, [layout, seatTypeExists]);

  const times = useMemo(() => {
    const raw = timesQuery.data ?? [];
    return raw.map((t) => t.slice(0, 5)).filter(Boolean);
  }, [timesQuery.data]);

  const timeUi = useMemo(() => {
    if (!dateYmd)
      return { msg: "날짜를 먼저 선택해주세요", times: [] as string[] };
    if (timesQuery.isLoading)
      return { msg: "예약 가능시간 기다리는중..", times: [] };
    if (timesQuery.isError)
      return { msg: "휴무일 입니다. 다른 날짜를 선택해주세요", times: [] };
    if (times.length === 0)
      return { msg: "예약 가능한 시간이 없어요", times: [] };
    return { msg: null as string | null, times };
  }, [dateYmd, timesQuery.isLoading, timesQuery.isError, times]);

  const noAvailableSeats =
    canQueryTables &&
    !availableTablesQuery.isLoading &&
    !availableTablesQuery.isError &&
    (availableTablesQuery.data?.tables?.length ?? 0) === 0;
  const handleRequestClose = useConfirmClose(onClose);

  useEffect(() => {
    setSeatType(null);
    setSelectedTableId(null);
  }, [people, date, time]);

  if (!rendered) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="식당 예약 모달"
    >
      <button
        type="button"
        className={cn(backdropMotionClass(entered), "z-0")}
        aria-label="모달 닫기"
        onClick={handleRequestClose}
      />

      <div
        className={cn(
          "relative z-10 w-[92vw] max-w-4xl rounded-2xl bg-white shadow-xl overflow-hidden max-h-[calc(100vh-96px)] flex flex-col",
          panelMotionClass(entered),
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
          <div className="min-w-0">
            <h2 className="text-xl truncate font-medium">{restaurant.name} </h2>
            <p className="text-sm text-muted-foreground truncate">
              {restaurant.address}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRequestClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="모달 닫기"
          >
            <X />
          </button>
        </div>
        <div className="overflow-y-auto px-6 py-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-md mb-3">
              <Users className="h-5 w-5" />
              인원
            </div>

            <div className="flex flex-wrap gap-2">
              {PEOPLE.map((n) => {
                const active = people === n;
                return (
                  <Button
                    key={n}
                    type="button"
                    variant="outline"
                    onClick={() => setPeople(n)}
                    className={cn(
                      "rounded-md py-5 px-4 text-md cursor-pointer border-2",
                      active &&
                        "border-blue-500 text-blue-500 bg-gray-100 hover:bg-gray-100 hover:text-blue-500",
                    )}
                  >
                    {n}명
                  </Button>
                );
              })}
            </div>
          </div>
          {/* 날짜 */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-md mb-3">
              <CalendarIcon className="h-5 w-5" />
              날짜
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-between rounded-md text-md p-5 border-2 cursor-pointer",
                    !date && "text-muted-foreground",
                  )}
                >
                  {date ? toYmd(date) : "연도-월-일"}
                  <CalendarIcon className="h-4 w-4 opacity-70" />
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-2 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d <= todayKst} //오늘미포함.
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="mt-5 space-y-2">
            <div className="flex items-center gap-2 text-md mb-3">
              <Clock3 className="h-5 w-5" />
              시간대
            </div>
            {timeUi.msg ? (
              <p className="text-muted-foreground">{timeUi.msg}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {timeUi.times.map((t) => {
                const active = time === t;
                return (
                  <Button
                    key={t}
                    type="button"
                    variant="outline"
                    onClick={() => setTime(t)}
                    className={cn(
                      "rounded-md py-5 px-4 w-24 text-md cursor-pointer border-2",
                      active &&
                        "border-blue-500 text-blue-500 bg-gray-100 hover:bg-gray-100 hover:text-blue-500",
                    )}
                  >
                    {t}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="text-md mb-3">좌석 유형</div>
            <div className="flex flex-wrap gap-2">
              {seatOptions.map((s) => {
                const active = seatType === s;
                const exists = !layout ? true : seatTypeExists.has(s);
                return (
                  <Button
                    key={s}
                    type="button"
                    variant="outline"
                    disabled={!exists}
                    onClick={() => {
                      setSeatType(s);
                      setSelectedTableId(null);
                    }}
                    className={cn(
                      "rounded-md p-6 w-40 text-md cursor-pointer border-2",
                      active &&
                        "border-blue-500 text-blue-500 bg-gray-100 hover:bg-gray-100 hover:text-blue-500",
                    )}
                  >
                    {s}
                  </Button>
                );
              })}
            </div>
            {noAvailableSeats ? (
              <p className="text-muted-foreground">
                예약 가능한 좌석이 없어요.{" "}
              </p>
            ) : null}
          </div>
          <div className="mt-6 space-y-2">
            <div className="mb-3">테이블 선택</div>
            {!layout && !canQueryTables && (
              <p className="text-sm text-muted-foreground">
                날짜와 시간대를 선택하면 테이블을 고를 수 있어요.
              </p>
            )}
            {!layout && canQueryTables && !availableTablesQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                테이블 배치 정보가 없어요.
              </p>
            )}
            {!layout && canQueryTables && availableTablesQuery.isLoading && (
              <p className="text-sm text-muted-foreground">
                테이블 정보를 불러오는중..
              </p>
            )}
            {layout && canQueryTables && !noAvailableSeats && (
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <TableMap
                    layout={layout}
                    availableIds={availableIds}
                    selectedTableId={selectedTableId}
                    seatType={seatType}
                    onSelectTable={setSelectedTableId}
                    onSelectSeatType={setSeatType}
                  />
                </div>
                {!selectedTableId && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    배치도에서 테이블을 선택해주세요
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-2">
            <div className="text-md mb-3">테이블 선호도</div>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setTablePref("split_ok")}
                className={cn(
                  "w-full rounded-lg border p-4 text-left cursor-pointer hover:bg-gray-50",
                  tablePref === "split_ok",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-4 inline-flex h-5 w-5 items-center justify-center rounded-full border">
                    {tablePref === "split_ok" ? (
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                    ) : null}
                  </span>
                  <div>
                    <div className="text-md font-medium">
                      테이블 떨어져도 상관없어요
                    </div>
                    <div className="text-sm text-muted-foreground">
                      인원이 많을 경우 여러 테이블로 나누어 앉을 수 있습니다
                    </div>
                  </div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setTablePref("one_table")}
                className={cn(
                  "w-full rounded-lg border p-4 text-left cursor-pointer hover:bg-gray-50",
                  tablePref === "one_table",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-4 inline-flex h-5 w-5 items-center justify-center rounded-full border">
                    {tablePref === "one_table" ? (
                      <span className="h-3 w-3 rounded-full bg-blue-500" />
                    ) : null}
                  </span>
                  <div>
                    <div className="text-md">한 테이블에서만 먹을거에요</div>
                    <div className="text-sm text-muted-foreground">
                      모든 인원이 같은 테이블에 앉습니다
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <div className="text-md">결제 유형</div>
            <div className="rounded-lg p-4 text-md border-2 border-blue-500 text-blue-500 bg-blue-50 space-y-1">
              <div className="flex items-center justify-between">
                <span>사전결제</span>
                <span className="font-semibold">
                  {Math.round(depositRate * 100)}% 정책
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                예약금은 <b>메뉴 선택 후</b> 메뉴 총액의{" "}
                <b>{Math.round(depositRate * 100)}%</b>로 계산됩니다.
              </p>
              <p className="text-xs text-muted-foreground">
                예약 확정을 위해 예약금 결제가 필요합니다.
              </p>
            </div>
          </div>

          <Button
            type="button"
            className="mt-5 text-md h-14 w-full cursor-pointer bg-blue-500 hover:bg-blue-600"
            disabled={!canSubmit}
            onClick={() => {
              if (!date || !time || !selectedTableId || !seatType) return;
              const selectedTableNo =
                layout?.tables.find((t) => t.id === selectedTableId)?.tableNo ??
                null;
              onClickConfirm({
                people,
                date,
                time,
                seatType,
                tablePref,
                tableId: selectedTableId,
                tableNo: selectedTableNo,
                selectedMenus: initialDraft?.selectedMenus ?? [],
              });
            }}
          >
            예약 진행
          </Button>
          {!canSubmit && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              날짜/시간대/테이블을 선택하면 예약할 수 있어요.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
