import { ChevronDown, Search, X } from "lucide-react";
import { useState } from "react";
import { faqData } from "./faqData";

export default function SupportFAQ() {
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["전체", "예약", "결제/환불", "식당 등록", "리뷰", "기타"];

  const filteredFaqs = faqData.filter((item) => {
    // 카테고리 매칭 여부
    const matchCategory =
      selectedCategory === "전체" || item.category === selectedCategory;

    // 검색어 매칭 여부
    const query = searchTerm.toLowerCase().trim();
    const matchSearch =
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query);

    // 둘다 매칭되는 항목만 반환
    return matchCategory && matchSearch;
  });

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <main className="max-w-[1920px] mx-auto py-6 px-4 md:p-8 lg:p-16">
      <div className="mb-8">
        <h2 className="text-gray-900 mb-6">자주 묻는 질문</h2>

        {/* 검색창 */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 size-5"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="궁금한 내용을 검색해보세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="검색어 지우기"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* 카테고리 탭 */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => {
                setSelectedCategory(category);
                setOpenFaqId(null);
              }}
              className={`px-6 py-3 transition-colors relative cursor-pointer ${
                selectedCategory === category
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {category}
              {selectedCategory === category && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 질문 리스트 */}
      <div className="space-y-3 min-h-[200px]">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden transition-all hover:border-blue-300"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full p-4 md:px-6 md:py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm shrink-0 ">
                    {faq.category}
                  </span>
                  <span
                    className={`text-gray-900 break-keep ${openFaqId === faq.id ? "font-bold" : ""}`}
                  >
                    {faq.question}
                  </span>
                </div>

                <ChevronDown
                  className={`size-5 text-gray-500 transition-transform shrink-0 ml-4 mt-1 ${
                    openFaqId === faq.id ? "rotate-180 text-blue-600" : ""
                  }`}
                />
              </button>

              {/* 답변 영역 */}
              {openFaqId === faq.id && (
                <div className="p-5 md:px-7 md:pb-5 border-t border-gray-100">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line break-keep">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-gray-500 space-y-3">
            <p>검색 결과가 없습니다.</p>
            <p className="text-gray-400 mt-2">다른 검색어로 검색해보세요.</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-center text-gray-600 break-keep">
        총 <span className="text-blue-600">{filteredFaqs.length}</span>개의
        질문이 있습니다.
      </div>
    </main>
  );
}
