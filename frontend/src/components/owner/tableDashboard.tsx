import React, { useEffect, useMemo, useState } from "react";
import { Store, Plus, Clock, Pencil, Check, X, Lightbulb } from "lucide-react";
import TableCreateModal from "./TableCreateModal";
import BreakTimeModal, { type BreakTime } from "./BreakTimeModal";
import AddTableModal from "./AddTableModal";
import {
  createLayout,
  createTable,
  deleteTable,
  getActiveLayout,
  type CreateTableRequest,
  type LayoutTable,
} from "@/api/owner/storeLayout";
import { patchTableInfo, type UpdatedTable } from "@/api/owner/table";
import { patchBreakTime } from "@/api/owner/reservation";
import type { SeatsType } from "@/types/table";
import TableDetailModal from "./tableDetailModal";

interface TableDashboardProps {
  storeId: number;
  storeName?: string;
}

export interface TableInfo {
  tableId: number;
  numValue: number;
  minCapacity: number;
  maxCapacity: number;
  isEditingCapacity: boolean;
  isEditingNum: boolean;
  isSaved?: boolean;
  originalMinCapacity?: number;
  originalMaxCapacity?: number;
  tableImageUrl?: string | null;
  seatsType: SeatsType;
}

interface PlacedTable {
  gridX: number;
  gridY: number;
  tableInfo: TableInfo;
}

const mapTablesFromApi = (
  tables: LayoutTable[],
  columns: number,
  prevTableData: Record<number, TableInfo> = {},
): Record<number, TableInfo> => {
  const result: Record<number, TableInfo> = {};

  tables.forEach((t) => {
    const slotId = t.gridY * columns + t.gridX + 1;
    const displayNum = extractLeadingNumber(t.tableNumber) ?? slotId;
    const imageUrl =
      t.tableImageUrl ?? prevTableData?.[slotId]?.tableImageUrl ?? null;

    result[slotId] = {
      tableId: t.tableId,
      numValue: displayNum,
      minCapacity: t.minSeatCount,
      maxCapacity: t.maxSeatCount,
      isEditingCapacity: false,
      isEditingNum: false,
      isSaved: true,
      originalMinCapacity: t.minSeatCount,
      originalMaxCapacity: t.maxSeatCount,
      tableImageUrl: imageUrl,
      seatsType: t.seatsType ?? "GENERAL",
    };
  });

  return result;
};

const extractLeadingNumber = (s?: string | null): number | null => {
  if (!s) return null;
  const m = s.match(/(-?\d+)/);
  return m ? Number(m[1]) : null;
};

const TableDashboard: React.FC<TableDashboardProps> = ({
  storeId,
  storeName,
}) => {
  const SETTINGS_STORAGE_KEY = storeId
    ? `store-settings-${storeId}`
    : "store-settings-temp";
  const STORAGE_KEY = storeId
    ? `table-dashboard-state-${storeId}`
    : "table-dashboard-state-temp";

  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("로컬스토리지 파싱 실패", e);
      return null;
    }
  };

  const initialData = useMemo(() => getSavedData(), []);

  const [config, setConfig] = useState<{ columns: number; rows: number }>(
    initialData?.config ?? { columns: 0, rows: 0 },
  );
  const [tableData, setTableData] = useState<Record<number, TableInfo>>(
    initialData?.tableData ?? {},
  );
  const [breakTimes, setBreakTimes] = useState<BreakTime[]>(
    initialData?.breakTimes ?? [],
  );
  const [closedDays, setClosedDays] = useState<string[]>(
    initialData?.closedDays ?? [],
  );

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [isAddTableModalOpen, setAddTableModalOpen] = useState(false);
  const [existingTables, setExistingTables] = useState<
    { gridX: number; gridY: number; tableId?: number }[]
  >([]);
  const [_placedTables, setPlacedTables] = useState<PlacedTable[]>([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const settingsData = JSON.parse(savedSettings);
        if (settingsData?.closedDays) setClosedDays(settingsData.closedDays);
      } catch (e) {
        console.error("설정 데이터 파싱 실패", e);
      }
    }
  }, [SETTINGS_STORAGE_KEY]);

  useEffect(() => {
    const data = { config, tableData, breakTimes, closedDays };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("로컬스토리지 저장 실패", e);
    }
  }, [STORAGE_KEY, config, tableData, breakTimes, closedDays]);

  const hasTables = config.columns > 0 && config.rows > 0;

  const getDefaultTableData = (id: number): TableInfo => ({
    tableId: -1,
    numValue: id,
    minCapacity: 2,
    maxCapacity: 4,
    isEditingCapacity: false,
    isEditingNum: false,
    isSaved: false,
    tableImageUrl: null,
    seatsType: "GENERAL",
  });

  const getTableData = (id: number) => tableData[id] ?? getDefaultTableData(id);

  const updateTable = (id: number, updates: Partial<TableInfo>) => {
    setTableData((prev) => {
      const current = prev[id] ?? getDefaultTableData(id);
      const next = { ...current, ...updates };

      if (
        updates.minCapacity !== undefined &&
        next.minCapacity >= next.maxCapacity
      ) {
        next.minCapacity = Math.max(1, next.maxCapacity - 1);
      }
      if (
        updates.maxCapacity !== undefined &&
        next.maxCapacity <= next.minCapacity
      ) {
        next.maxCapacity = next.minCapacity + 1;
      }

      return { ...prev, [id]: next };
    });
  };

  const getTableStyle = (capacity: number) => {
    if (capacity <= 4)
      return {
        border: "border-yellow-300",
        bg: "bg-yellow-100",
        badge: "bg-yellow-500",
        hover: "hover:bg-yellow-200",
      };
    if (capacity <= 8)
      return {
        border: "border-blue-300",
        bg: "bg-blue-100",
        badge: "bg-blue-500",
        hover: "hover:bg-blue-200",
      };
    return {
      border: "border-purple-300",
      bg: "bg-purple-100",
      badge: "bg-purple-500",
      hover: "hover:bg-purple-200",
    };
  };

  const startEditingCapacity = (id: number) => {
    const table = getTableData(id);
    updateTable(id, {
      isEditingCapacity: true,
      originalMinCapacity: table.minCapacity,
      originalMaxCapacity: table.maxCapacity,
    });
  };

  useEffect(() => {
    if (!storeId) return;

    const fetchLayout = async () => {
      try {
        const layout = await getActiveLayout(storeId);
        if (layout) {
          setConfig({
            columns: layout.gridInfo.gridCol,
            rows: layout.gridInfo.gridRow,
          });

          setPlacedTables(
            layout.tables.map((t) => ({
              gridX: t.gridX,
              gridY: t.gridY,
              tableInfo: {
                tableId: t.tableId,
                numValue:
                  extractLeadingNumber(t.tableNumber) ??
                  t.gridY * layout.gridInfo.gridCol + t.gridX + 1,
                minCapacity: t.minSeatCount,
                maxCapacity: t.maxSeatCount,
                isEditingCapacity: false,
                isEditingNum: false,
                isSaved: true,
                tableImageUrl:
                  (t as any).tableImageUrl ??
                  tableData[t.gridY * layout.gridInfo.gridCol + t.gridX + 1]
                    ?.tableImageUrl ??
                  null,
                seatsType: t.seatsType ?? "GENERAL",
              },
            })),
          );

          setExistingTables(
            layout.tables.map((t) => ({
              gridX: t.gridX + 1,
              gridY: t.gridY + 1,
              tableId: t.tableId,
            })),
          );

          setTableData(
            mapTablesFromApi(layout.tables, layout.gridInfo.gridCol, tableData),
          );
          setCreateModalOpen(false);
        } else {
          setCreateModalOpen(true);
        }
      } catch (e) {
        console.error("레이아웃 로드 실패", e);
        setCreateModalOpen(true);
      }
    };

    fetchLayout();
  }, [storeId]);

  const handleCreateLayout = async (columns: number, rows: number) => {
    if (!storeId) return;
    try {
      const newLayout = await createLayout(storeId, columns, rows);
      if (!newLayout) throw new Error("레이아웃 생성 후 응답이 없습니다.");
      setConfig({
        columns: newLayout.gridInfo.gridCol,
        rows: newLayout.gridInfo.gridRow,
      });
      setTableData(
        mapTablesFromApi(newLayout.tables, newLayout.gridInfo.gridCol),
      );
      setCreateModalOpen(false);
    } catch (e) {
      console.error("배치도 생성 실패", e);
      alert("배치도 생성에 실패했습니다.");
    }
  };

  const handleAddTable = async (data: CreateTableRequest) => {
    if (!storeId) return;
    try {
      const payload: CreateTableRequest = {
        ...data,
        gridX: data.gridX - 1,
        gridY: data.gridY - 1,
      };
      const newTable = await createTable(storeId, payload);
      if (!newTable)
        throw new Error("서버에서 테이블 정보를 반환하지 않았습니다.");

      setExistingTables((prev) => [
        ...prev,
        { gridX: data.gridX, gridY: data.gridY, tableId: newTable.tableId },
      ]);

      const slotId = (data.gridY - 1) * config.columns + data.gridX;
      const extractedNum =
        extractLeadingNumber((newTable as any).tableNumber) ?? slotId;

      setTableData((prev) => ({
        ...prev,
        [slotId]: {
          tableId: newTable.tableId ?? -1,
          numValue: extractedNum,
          minCapacity: newTable.minSeatCount ?? 2,
          maxCapacity: newTable.maxSeatCount ?? 4,
          isEditingCapacity: false,
          isEditingNum: false,
          isSaved: true,
          tableImageUrl: newTable.tableImageUrl ?? null,
          seatsType: (newTable.seatsType ?? "GENERAL") as SeatsType,
        },
      }));

      setAddTableModalOpen(false);
      alert("테이블 생성 완료");
    } catch (e) {
      console.error("테이블 추가 실패", e);
      alert("테이블 생성 실패");
    }
  };

  const handleDeleteTable = async (tableId?: number, slotId?: number) => {
    if (!storeId) return;
    if (tableId == null || slotId == null) {
      alert(
        "삭제할 테이블 정보를 찾을 수 없습니다. 새로고침 후 다시 시도하세요.",
      );
      return;
    }

    if (
      !confirm(
        "정말 이 테이블을 삭제하시겠습니까? (삭제는 soft-delete로 기록됩니다)",
      )
    )
      return;

    try {
      await deleteTable(storeId, tableId);

      setTableData((prev) => {
        const next = { ...prev };
        delete next[slotId];
        return next;
      });

      const slotGridX = ((slotId - 1) % config.columns) + 1;
      const slotGridY = Math.floor((slotId - 1) / config.columns) + 1;
      setExistingTables((prev) =>
        prev.filter((t) => !(t.gridX === slotGridX && t.gridY === slotGridY)),
      );

      setSelectedTable(null);
      alert("테이블이 삭제되었습니다.");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400) {
        alert("미래 예약이 있어 삭제할 수 없습니다. 예약을 먼저 취소해주세요.");
      } else if (status === 404) {
        alert(
          "가게 또는 테이블을 찾을 수 없습니다. 새로고침 후 다시 시도하세요.",
        );
      } else {
        console.error(e);
        alert("테이블 삭제 중 오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    }
  };

  const buildPatchPayload = (opts: {
    tableNumber?: number | null;
    min?: number | null;
    max?: number | null;
    seatsType?: string | null;
  }) => {
    const body: any = {};
    if (opts.tableNumber !== null && opts.tableNumber !== undefined)
      body.tableNumber = String(opts.tableNumber);
    if (opts.min !== null && opts.min !== undefined)
      body.minSeatCount = opts.min;
    if (opts.max !== null && opts.max !== undefined)
      body.maxSeatCount = opts.max;
    if (opts.seatsType) body.seatsType = opts.seatsType;
    if (Object.keys(body).length === 0)
      throw new Error("수정할 필드를 하나 이상 지정하세요.");
    if (
      body.minSeatCount !== undefined &&
      body.maxSeatCount !== undefined &&
      body.minSeatCount > body.maxSeatCount
    ) {
      throw new Error("최소 인원은 최대 인원보다 클 수 없습니다.");
    }
    return body;
  };

  const handlePatchTableInfo = async (
    tableId: number,
    changes: {
      tableNumber?: number;
      min?: number;
      max?: number;
      seatsType?: string;
    },
  ) => {
    if (!storeId) {
      alert("storeId가 없습니다.");
      return;
    }

    let payload;
    try {
      payload = buildPatchPayload({
        tableNumber: changes.tableNumber ?? null,
        min: changes.min ?? null,
        max: changes.max ?? null,
        seatsType: changes.seatsType ?? null,
      });
    } catch (err: any) {
      alert(err.message);
      return;
    }

    try {
      const res = await patchTableInfo(storeId, tableId, payload);

      const updatedTables: UpdatedTable[] =
        res.data?.result?.updatedTables ?? [];

      setTableData((prev) => {
        const next = { ...prev };
        updatedTables.forEach((ut) => {
          const slotKeyStr = Object.keys(next).find(
            (k) => next[Number(k)]?.tableId === ut.tableId,
          );
          const slotKey = slotKeyStr ? Number(slotKeyStr) : undefined;
          const displayNum = extractLeadingNumber(ut.tableNumber) ?? slotKey;

          if (slotKey && next[slotKey]) {
            next[slotKey] = {
              ...next[slotKey],
              tableId: ut.tableId,
              minCapacity: ut.minSeatCount ?? next[slotKey].minCapacity,
              maxCapacity: ut.maxSeatCount ?? next[slotKey].maxCapacity,
              numValue: displayNum ?? next[slotKey].numValue,
              isSaved: true,
            };
          } else {
            console.warn("로컬 슬롯을 찾을 수 없음 (업데이트된 테이블):", ut);
          }
        });
        return next;
      });

      setPlacedTables((prev) =>
        prev.map((pt) => {
          const match = updatedTables.find(
            (ut) => ut.tableId === pt.tableInfo.tableId,
          );
          if (match) {
            return {
              ...pt,
              tableInfo: {
                ...pt.tableInfo,
                minCapacity:
                  (match as any).minSeatCount ?? pt.tableInfo.minCapacity,
                maxCapacity:
                  (match as any).maxSeatCount ?? pt.tableInfo.maxCapacity,
                numValue:
                  extractLeadingNumber(match.tableNumber) ??
                  pt.tableInfo.numValue,
              },
            };
          }
          return pt;
        }),
      );

      alert("테이블 정보가 업데이트 되었습니다.");
    } catch (e: any) {
      const status = e?.response?.status;
      if (status === 400) {
        alert("잘못된 요청입니다. (좌석 범위 오류 또는 수정 필드 없음)");
      } else if (status === 404) {
        alert("가게 또는 테이블을 찾을 수 없습니다.");
      } else {
        console.error(e);
        alert("테이블 수정 중 오류가 발생했습니다. 콘솔을 확인하세요.");
      }
    }
  };

  const handleSetBreakTime = async (bt: BreakTime) => {
    if (!storeId) {
      alert("storeId가 없습니다.");
      return;
    }

    const payload = {
      breakStartTime: bt.start,
      breakEndTime: bt.end,
    };

    try {
      const res = await patchBreakTime(storeId, payload);

      setBreakTimes([
        {
          start: res.data.result.breakStartTime,
          end: res.data.result.breakEndTime,
        },
      ]);

      try {
        const prevSettingsRaw = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const prevSettings = prevSettingsRaw ? JSON.parse(prevSettingsRaw) : {};
        const newSettings = {
          ...prevSettings,
          breakTimes: [
            {
              start: res.data.result.breakStartTime,
              end: res.data.result.breakEndTime,
            },
          ],
        };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      } catch (err) {
        console.warn("설정 로컬스토리지 저장 실패", err);
      }

      alert("브레이크 타임이 설정되었습니다.");
    } catch (err: any) {
      console.error("브레이크타임 설정 실패", err?.response?.data ?? err);
      const status = err?.response?.status;
      if (status === 400) {
        alert(
          err?.response?.data?.message ?? "잘못된 브레이크타임 요청입니다.",
        );
      } else if (status === 404) {
        alert("가게를 찾을 수 없습니다.");
      } else {
        alert(
          err?.response?.data?.message ??
            "브레이크타임 설정에 실패했습니다. 콘솔을 확인하세요.",
        );
      }
    }
  };

  const SEATS_TYPE_LABEL: Record<SeatsType, string> = {
    GENERAL: "일반석",
    WINDOW: "창가석",
    ROOM: "룸",
    BAR: "바 좌석",
    OUTDOOR: "야외석",
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <main className="max-w-7xl mx-auto px-8 py-10">
        <div className="flex flex-col gap-4 mb-10 sm:flex-row sm:justify-between sm:items-end">
          <div>
            <h2 className="text-xl text-gray-900 mb-1">
              테이블 관리
              {storeName && (
                <span className="text-sm text-gray-500 font-normal">
                  · {storeName}
                </span>
              )}
            </h2>
            <p className="text-gray-500 text-base">
              {hasTables
                ? `총 ${config.columns * config.rows}개의 테이블이 관리되고 있습니다`
                : "등록된 식당을 관리하고 대시보드로 이동하세요"}
            </p>
          </div>
          <div className="flex gap-3">
            {hasTables && (
              <button
                onClick={() => setIsBreakModalOpen(true)}
                className="cursor-pointer flex items-center gap-2 border border-gray-200 px-5 py-2.5 rounded-lg bg-white text-gray-700 text-base hover:bg-gray-50 transition-all"
              >
                <Clock size={18} className="text-gray-400" />
                브레이크 타임 설정
              </button>
            )}
            {hasTables && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-base hover:bg-blue-700 transition-all"
              >
                <Plus size={18} /> 테이블 재생성
              </button>
            )}
          </div>
        </div>

        {breakTimes.length > 0 && (
          <div className="mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                브레이크 타임 목록
              </div>

              <div className="flex flex-wrap gap-3">
                {breakTimes.map((bt, idx) => (
                  <div
                    key={`${bt.start}-${bt.end}-${idx}`}
                    className="w-full bg-orange-50 flex items-center gap-2 border border-orange-200 px-4 py-4 rounded-lg"
                  >
                    <Clock size={18} color="orange" />
                    <span className="text-base text-orange-900">
                      {bt.start} ~ {bt.end}
                    </span>
                    <button
                      onClick={() =>
                        setBreakTimes((prev) =>
                          prev.filter((_, i) => i !== idx),
                        )
                      }
                      className="ml-auto text-orange-400 hover:text-red-500 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {hasTables && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in duration-500">
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-base">
                <Store size={20} color="blue" /> 총 가게 수
              </div>
              <p className="text-md">1개</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-base">
                📅 총 테이블 수
              </div>
              <p className="text-lg">{config.columns * config.rows}개</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm relative overflow-hidden">
          {hasTables ? (
            <div className="p-6">
              <div className="flex justify-between items-center mb-12">
                <h3 className="text-xl text-gray-900">테이블 배치도</h3>
                <span className="text-gray-900 text-sm tracking-widest uppercase">
                  {config.columns} X {config.rows} 그리드
                </span>
                {hasTables && (
                  <button
                    onClick={() => setAddTableModalOpen(true)}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 text-base hover:bg-blue-700 transition-all"
                  >
                    <Plus size={18} /> 테이블 추가
                  </button>
                )}
              </div>
              <div className="overflow-x-auto pb-4">
                <div
                  className="grid gap-6 mx-auto w-fit"
                  style={{
                    gridTemplateColumns: `repeat(${config.columns}, minmax(150px, 1fr))`,
                  }}
                >
                  {Array.from({ length: config.columns * config.rows }).map(
                    (_: any, i: number) => {
                      const id = i + 1;
                      const table = getTableData(id);
                      const style = getTableStyle(table.maxCapacity);

                      const extraStyle = table.isSaved
                        ? ""
                        : "opacity-50 border-dashed";

                      return (
                        <div
                          key={id}
                          onClick={() => {
                            if (!table.isSaved) return;
                            if (!table.isEditingCapacity) {
                              setSelectedTable(id);
                            }
                          }}
                          className={`border-2 ${style.border} ${extraStyle} rounded-lg p-4 ${style.bg} flex flex-col items-center cursor-pointer ${style.hover} transition-all relative group aspect-square justify-center w-36 md:w-40`}
                        >
                          <div className="flex items-center gap-1.5 mb-3 text-gray-800 text-sm h-6">
                            {table.isEditingCapacity ? (
                              <span className="text-[#4A5568]">인원 설정</span>
                            ) : table.isEditingNum ? (
                              <div
                                className="flex items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  autoFocus
                                  type="number"
                                  className="bg-white/60 border-b border-orange-400 outline-none text-center w-8 font-bold"
                                  value={table.numValue}
                                  onChange={(e) =>
                                    updateTable(id, {
                                      numValue: Number(e.target.value),
                                    })
                                  }
                                  onBlur={() => {
                                    updateTable(id, { isEditingNum: false });
                                    const tableId = getTableData(id).tableId;
                                    if (tableId > 0) {
                                      handlePatchTableInfo(tableId, {
                                        tableNumber: table.numValue,
                                      });
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      updateTable(id, { isEditingNum: false });
                                      const tableId = getTableData(id).tableId;
                                      if (tableId > 0) {
                                        handlePatchTableInfo(tableId, {
                                          tableNumber: table.numValue,
                                        });
                                      }
                                    }
                                  }}
                                />
                                <span className="ml-1">번</span>
                              </div>
                            ) : (
                              <>
                                {table.numValue}번 테이블
                                <Pencil
                                  size={12}
                                  className="text-orange-400 fill-orange-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateTable(id, { isEditingNum: true });
                                  }}
                                  aria-label="테이블 번호 수정"
                                  role="button"
                                  tabIndex={0}
                                />
                              </>
                            )}
                          </div>

                          <div className="relative w-full flex flex-col items-center">
                            {table.isEditingCapacity ? (
                              <div
                                className="flex flex-col items-center"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center gap-1 mb-2">
                                  <div className="bg-white rounded-md border border-blue-200 p-1 flex items-center shadow-sm">
                                    <span className="text-xs px-1">
                                      {table.minCapacity}
                                    </span>
                                    <div className="flex flex-col border-l pl-0.5 text-[6px]">
                                      <button
                                        aria-label="최소 인원 증가"
                                        onClick={() =>
                                          updateTable(id, {
                                            minCapacity: table.minCapacity + 1,
                                          })
                                        }
                                        className="hover:text-blue-500"
                                      >
                                        ▲
                                      </button>
                                      <button
                                        aria-label="최소 인원 감소"
                                        onClick={() =>
                                          updateTable(id, {
                                            minCapacity: Math.max(
                                              1,
                                              table.minCapacity - 1,
                                            ),
                                          })
                                        }
                                        className="hover:text-blue-500"
                                      >
                                        ▼
                                      </button>
                                    </div>
                                  </div>
                                  <span className="text-xs text-gray-400">
                                    ~
                                  </span>
                                  <div className="bg-white rounded-md border border-blue-200 p-1 w-8 text-center shadow-sm">
                                    <input
                                      type="number"
                                      className="w-full text-xs outline-none text-center bg-transparent"
                                      value={table.maxCapacity}
                                      onChange={(e) =>
                                        updateTable(id, {
                                          maxCapacity: Number(e.target.value),
                                        })
                                      }
                                      onBlur={(e) => {
                                        const val = Number(e.target.value);
                                        if (val <= table.minCapacity) {
                                          updateTable(id, {
                                            maxCapacity: table.minCapacity + 1,
                                          });
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() =>
                                      updateTable(id, {
                                        isEditingCapacity: false,
                                      })
                                    }
                                    className="bg-[#6BCB77] p-1 rounded-sm text-white active:scale-90 shadow-sm"
                                  >
                                    <Check size={12} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      updateTable(id, {
                                        isEditingCapacity: false,
                                        minCapacity:
                                          tableData[id]?.originalMinCapacity ??
                                          table.minCapacity,
                                        maxCapacity:
                                          tableData[id]?.originalMaxCapacity ??
                                          table.maxCapacity,
                                      })
                                    }
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startEditingCapacity(id);
                                  }}
                                  className={`${style.badge} text-white px-2 py-2 rounded-sm text-xs shadow-md min-w-[60px] text-center transition-transform active:scale-95`}
                                >
                                  {table.minCapacity}~{table.maxCapacity}인
                                </div>
                                <div className="mt-3 text-[11px] text-gray-600">
                                  {SEATS_TYPE_LABEL[table.seatsType]}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-[28px] p-7 mt-8">
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-5">
                  <Lightbulb
                    size={20}
                    className="text-yellow-400 fill-yellow-400"
                  />
                  <span>
                    Tip: 테이블을 클릭하면 상세 정보를 확인하고 예약 시간대를
                    관리할 수 있습니다.
                  </span>
                </div>
                <div className="flex flex-wrap gap-10 text-sm text-gray-600 pl-8 uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-sm bg-[#D4A017]" /> 소형
                    (4인 이하)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-sm bg-blue-500" /> 중형
                    (5~8인)
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-5 h-5 rounded-sm bg-purple-500" /> 단체석
                    (9인 이상)
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-15 px-6 text-center">
              <div className="p-6 rounded-2xl mb-6">
                <Store size={64} className="text-gray-300" />
              </div>
              <h3 className="text-xl text-gray-900 mb-2">
                등록된 테이블이 없습니다
              </h3>
              <p className="text-gray-500 mb-8">
                테이블을 생성하여 가게 관리를 시작하세요
              </p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl flex items-center gap-2 text-lg font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <Plus size={20} /> 테이블 생성하기
              </button>
            </div>
          )}
        </div>
      </main>

      {isCreateModalOpen && (
        <TableCreateModal
          onClose={() => setCreateModalOpen(false)}
          onConfirm={handleCreateLayout}
        />
      )}
      {selectedTable != null && (
        <TableDetailModal
          storeId={storeId}
          tableNumber={getTableData(selectedTable).numValue}
          tableInfo={getTableData(selectedTable)}
          tableId={getTableData(selectedTable).tableId}
          slotId={selectedTable}
          onUpdateCapacity={(min, max) => {
            const tableId = getTableData(selectedTable).tableId;
            if (!tableId) {
              updateTable(selectedTable, {
                minCapacity: min,
                maxCapacity: max,
              });
              return;
            }
            handlePatchTableInfo(tableId, { min, max });
          }}
          onDelete={(tableId, slotId) => handleDeleteTable(tableId, slotId)}
          onClose={() => setSelectedTable(null)}
          breakTimes={breakTimes}
          closedDays={closedDays}
          onImageUpload={(tableId, url) => {
            setTableData((prev) => {
              const next = { ...prev };
              const slotIdStr = Object.keys(prev).find(
                (k) => prev[Number(k)]?.tableId === tableId,
              );
              if (slotIdStr) {
                const key = Number(slotIdStr);
                next[key] = { ...next[key], tableImageUrl: url || null };
              }
              return next;
            });
          }}
        />
      )}

      {isBreakModalOpen && (
        <BreakTimeModal
          openTime="11:00"
          closeTime="22:00"
          onClose={() => setIsBreakModalOpen(false)}
          onConfirm={(bt) => {
            handleSetBreakTime(bt);
          }}
        />
      )}

      {isAddTableModalOpen && (
        <AddTableModal
          onClose={() => setAddTableModalOpen(false)}
          onConfirm={handleAddTable}
          gridCols={config.columns}
          gridRows={config.rows}
          existingTables={existingTables}
        />
      )}
    </div>
  );
};

export default TableDashboard;
