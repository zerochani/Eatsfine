import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Home } from "lucide-react";

const LoginErrorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <div className="w-32 h-32 bg-red-100 rounded-full"></div>
          </div>
          <div className="relative flex justify-center">
            <AlertCircle size={60} className="text-red-600" />
          </div>
        </div>
        <h1 className="text-5xl font-bold text-red-600 mb-4">Error</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          로그인에 실패했습니다
        </h2>
        <p className="text-gray-500 mb-10 leading-relaxed">
          소셜 로그인 연결 중 문제가 발생했습니다.
          <br />
          네트워크 상태를 확인하거나 다시 시도해 주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="cursor-pointer flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 font-medium hover:bg-gray-50 transition-all active:scale-95"
          >
            <Home size={18} />
            홈으로 이동
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginErrorPage;
