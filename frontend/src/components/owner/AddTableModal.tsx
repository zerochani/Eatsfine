import React, { useEffect, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import type { CreateTableRequest } from "@/api/owner/storeLayout";
import type { SeatsType } from "@/types/table";

interface AddTableModalProps {
  onClose: () => void;
  onConfirm: (data: CreateTableRequest) => void;
  gridCols: number;
  gridRows: number;
  existingTables?: { gridX: number; gridY: number }[];
}

const AddTableModal: React.FC<AddTableModalProps> = ({
  onClose,
  onConfirm,
  gridCols,
  gridRows,
  existingTables = [],
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);
  const [gridX, setGridX] = useState(1);
  const [gridY, setGridY] = useState(1);
  const [minSeatCount, setMinSeatCount] = useState(2);
  const [maxSeatCount, setMaxSeatCount] = useState(4);
  const [seatsType, setSeatsType] = useState<SeatsType>("GENERAL");
  const handleConfirm = () => {
    if (minSeatCount > maxSeatCount) {
      alert("최소 인원은 최대 인원보다 클 수 없습니다.");
      return;
    }

    if (gridX < 1 || gridX > gridCols || gridY < 1 || gridY > gridRows) {
      alert(
        `좌표가 배치도 범위를 벗어났습니다. (1~${gridCols}, 1~${gridRows})`,
      );
      return;
    }

    const isOccupied = existingTables.some(
      (t) => t.gridX === gridX && t.gridY === gridY,
    );
    if (isOccupied) {
      alert("해당 좌표에 이미 테이블이 있습니다.");
      return;
    }

    onConfirm({
      gridX,
      gridY,
      minSeatCount,
      maxSeatCount,
      seatsType,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white p-6 rounded-lg w-80 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2"
          onClick={onClose}
          aria-label="모달 닫기"
        >
          <X />
        </button>
        <h3 id="modal-title" className="text-lg mb-4">
          새 테이블 추가
        </h3>
        <div className="flex flex-col gap-2 mb-4">
          <label htmlFor="add-table-gridx">좌표 X (1~{gridCols})</label>
          <input
            id="add-table-gridx"
            type="number"
            className="border p-1 rounded w-full"
            value={gridX}
            onChange={(e) => setGridX(Number(e.target.value))}
          />
          <label htmlFor="add-table-gridy">좌표 Y (1~{gridRows})</label>
          <input
            id="add-table-gridy"
            type="number"
            className="border p-1 rounded w-full"
            value={gridY}
            onChange={(e) => setGridY(Number(e.target.value))}
          />
          <label htmlFor="add-table-min-seat">최소 인원</label>
          <input
            id="add-table-min-seat"
            type="number"
            className="border p-1 rounded w-full"
            value={minSeatCount}
            onChange={(e) => setMinSeatCount(Number(e.target.value))}
          />
          <label htmlFor="add-table-max-seat">최대 인원</label>
          <input
            id="add-table-max-seat"
            type="number"
            className="border p-1 rounded w-full"
            value={maxSeatCount}
            onChange={(e) => setMaxSeatCount(Number(e.target.value))}
          />
          <label htmlFor="add-table-seats-type">테이블 유형</label>
          <select
            id="add-table-seats-type"
            className="border p-1 rounded w-full"
            value={seatsType}
            onChange={(e) => setSeatsType(e.target.value as SeatsType)}
          >
            <option value="GENERAL">일반석</option>
            <option value="WINDOW">창가석</option>
            <option value="ROOM">룸</option>
            <option value="BAR">바 좌석</option>
            <option value="OUTDOOR">야외석</option>
          </select>
        </div>
        <button
          onClick={handleConfirm}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700 transition-all"
        >
          <Check size={16} /> 생성
        </button>
      </div>
    </div>
  );
};

export default AddTableModal;
