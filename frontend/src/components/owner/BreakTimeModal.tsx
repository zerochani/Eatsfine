import React, { useState } from 'react';
import { X, Clock } from 'lucide-react';

export interface BreakTime {
  start: string;
  end: string; 
}

interface Props {
  openTime: string;
  closeTime: string;
  onClose: () => void;
  onConfirm: (breakTime: BreakTime) => void;
}


const BreakTimeModal: React.FC<Props> = ({
  openTime,
  closeTime,
  onClose,
  onConfirm,
}) => {
  const [start, setStart] = useState('14:00');
  const [end, setEnd] = useState('15:00');

  const isInvalid =
  start >= end ||
  start < openTime ||
  end > closeTime;


  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white w-[420px] rounded-2xl p-6 relative"
      onClick={(e)=>e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-4 top-4 hover:text-gray-500 cursor-pointer">
          <X />
        </button>

        <div className="flex items-center gap-2 font-bold text-lg mb-4">
          <Clock className="text-orange-500" /> 브레이크 타임 설정
        </div>

        <div className="bg-orange-50 border border-orange-200 text-orange-700 text-sm p-3 rounded-lg mb-5">
          브레이크 타임 동안 모든 테이블의 예약이 자동으로 차단됩니다.
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-600">시작 시간</label>
            <input
              type="time"
              min={openTime}
              max={closeTime}
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full mt-1 border rounded-lg p-2 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-600">종료 시간</label>
            <input
              type="time"
              min={openTime}
              max={closeTime}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full mt-1 border rounded-lg p-2 cursor-pointer"
            />
          </div>

        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border rounded-lg py-2 font-bold hover:bg-gray-200 transition-all cursor-pointer"
          >
            취소
          </button>
          <button
            disabled={isInvalid}
            aria-disabled={isInvalid}
            onClick={() => {
              onConfirm({ start, end });
              onClose();
            }}
            className={`flex-1 rounded-lg py-2 font-bold ${
              isInvalid
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-300 text-white'
            }`}
          >
            브레이크 타임 추가
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakTimeModal;
