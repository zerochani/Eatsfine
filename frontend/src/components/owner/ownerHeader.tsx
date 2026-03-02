type TabType = "dashboard" | "settings" | "menu";

interface Props {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const tabs: { key: TabType; label: string }[] = [
  { key: "dashboard", label: "대시보드" },
  { key: "settings", label: "가게 설정" },
  { key: "menu", label: "메뉴 관리" },
];

const OwnerHeader: React.FC<Props> = ({ activeTab, onChangeTab }) => {
  return (
    <header className="bg-white border-b border-gray-200 pt-3">
      <div className="max-w-7xl mx-auto">
        <nav className="flex gap-5 pt-4 px-5">
          {tabs.map((tab) => (
            <button
              type="button"
              aria-current={activeTab === tab.key ? "page" : undefined}
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`pb-4 px-2 text-md transition-all relative ${
                activeTab === tab.key
                  ? "text-blue-600"
                  : "text-gray-900 hover:text-gray-900"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default OwnerHeader;
