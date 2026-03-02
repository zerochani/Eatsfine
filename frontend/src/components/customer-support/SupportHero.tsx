import { MessageCircle } from "lucide-react";
import { useState } from "react";
import SupportModal from "./SupportModal";
import SupportCompleteModal from "./SupportCompleteModal";

export default function SupportHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-[1920px] mx-auto p-8 md:p-16 text-center">
          <h2 className="text-white mb-4">무엇을 도와드릴까요?</h2>
          <p className="text-blue-100 max-w-2xl mx-auto mb-6 break-keep">
            자주 묻는 질문을 확인하시거나, 1:1 문의를 통해 더 자세한 도움을
            받으실 수 있습니다.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
          >
            <MessageCircle className="size-5" aria-hidden="true" />
            1:1 문의하기
          </button>
        </div>

        <SupportModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onComplete={() => {
            setIsModalOpen(false);
            setIsCompleteOpen(true);
          }}
        />

        <SupportCompleteModal
          isOpen={isCompleteOpen}
          onClose={() => setIsCompleteOpen(false)}
          autoCloseMs={4000}
        />
      </section>
    </>
  );
}
