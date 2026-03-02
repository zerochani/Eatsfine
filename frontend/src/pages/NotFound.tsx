import React from "react";
import { useNavigate } from "react-router-dom";
import { Search, Home, ArrowLeft } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="w-32 h-32 bg-blue-100 rounded-full"></div>
          </div>
          <div className="relative flex justify-center">
            <Search size={60} className="text-blue-600" />
          </div>
        </div>
        <h1 className="text-7xl font-bold text-blue-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          요청하신 페이지가 삭제되었거나 주소가 올바르지 않습니다.
          <br />
          입력하신 URL을 다시 한번 확인해 주세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleGoBack}
            className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
            이전으로
          </button>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <Home size={18} />
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
