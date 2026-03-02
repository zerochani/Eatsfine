import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuthActions } from "@/stores/useAuthStore";

const OAuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthActions();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");

    if (accessToken) {
      login(accessToken);
      navigate("/", { replace: true });
    } else {
      navigate("/login/error", { replace: true });
    }
  }, [searchParams, navigate, login]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-10">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-blue-100 rounded-full"></div>
          </div>
          <div className="relative flex justify-center">
            <Loader2 size={60} className="text-blue-600 animate-spin" />
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          로그인 처리 중...
        </h2>
        <p className="text-gray-500 leading-relaxed">
          잠시만 기다려 주시면
          <br />
          메인 화면으로 이동합니다.
        </p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
