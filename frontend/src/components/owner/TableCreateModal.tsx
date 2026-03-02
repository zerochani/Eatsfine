import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props { 
  onClose: () => void; 
  onConfirm: (cols: number, rows: number) => void; 
}

const TableCreateModal: React.FC<Props> = ({ onClose, onConfirm }) => {
  const [cols, setCols] = useState(4);
  const [rows, setRows] = useState(3);

  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    onClick={onClose}>
      <div className="bg-white w-[400px] rounded-3xl p-8 relative"
      onClick={(e)=> e.stopPropagation()}>
        <button onClick={onClose} className="absolute right-6 top-6 text-gray-400"><X /></button>
        <h3 className="text-xl font-bold mb-6">테이블 생성하기</h3>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">가로 줄 수 (Columns)</label>
            <input 
              type="number" 
              min={1}
              max={10}
              value={cols} 
              onChange={(e) => setCols(Number(e.target.value))} 
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">세로 줄 수 (Rows)</label>
            <input 
              type="number" 
              min={1}
              max={10}
              value={rows} 
              onChange={(e) => setRows(Number(e.target.value))} 
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 border rounded-xl font-bold text-gray-500 cursor-pointer">취소</button>
          <button 
            onClick={()=>{
              const colClamped = Math.min(Math.max(cols,1),10);
              const rowClamped = Math.min(Math.max(rows,1),10);
              onConfirm(colClamped, rowClamped);
            }}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold cursor-pointer"
          >
            생성하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableCreateModal;