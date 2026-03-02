import React, { useState } from "react";
import StoreSettings from "../components/owner/StoreSettings";
import MenuManagement from "../components/owner/MenuManagement";
import { useParams } from "react-router-dom";
import TableDashboard from "@/components/owner/tableDashboard";

type TabType = "dashboard" | "settings" | "menu";

const OwnerPage: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <nav className="flex gap-5 px-5">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-4 px-2 text-md transition-all relative ${
                activeTab === "dashboard"
                  ? "text-blue-600"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              <div className="cursor-pointer flex items-center gap-2">
                대시보드
              </div>
              {activeTab === "dashboard" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`pb-4 px-2 text-md transition-all relative ${
                activeTab === "settings"
                  ? "text-blue-600"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              <div className="cursor-pointer flex items-center gap-2">
                가게 설정
              </div>
              {activeTab === "settings" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("menu")}
              className={`pb-4 px-2 text-md transition-all relative ${
                activeTab === "menu"
                  ? "text-blue-600"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              <div className="cursor-pointer flex items-center gap-2">
                메뉴 관리
              </div>
              {activeTab === "menu" && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          </nav>
        </div>
      </header>

      <main>
        {activeTab === "dashboard" && storeId && (
          <TableDashboard storeId={Number(storeId)} storeName="내 가게" />
        )}
        {activeTab === "dashboard" && !storeId && (
          <div className="max-w-7xl mx-auto py-20 text-center text-gray-500">
            가게 정보를 찾을 수 없습니다. 다시 시도해 주세요.
          </div>
        )}
        {activeTab === "settings" && (
          <div className="max-w-7xl mx-auto text-gray-500">
            {activeTab === "settings" && <StoreSettings storeId={storeId} />}
          </div>
        )}
        {activeTab === "menu" && (
          <div className="max-w-7xl mx-auto text-gray-500">
            {activeTab === "menu" && <MenuManagement storeId={storeId} />}
          </div>
        )}
      </main>
    </div>
  );
};

export default OwnerPage;
