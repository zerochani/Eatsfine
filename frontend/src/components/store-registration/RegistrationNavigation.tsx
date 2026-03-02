import { ChevronLeft, ChevronRight } from "lucide-react";

interface RegistrationNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrev: () => void;
  onNext: () => void;
  isNextDisabled: boolean;
}

export default function RegistrationNavigation({
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  isNextDisabled,
}: RegistrationNavigationProps) {
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="max-w-2xl mx-auto mb-5 px-2 sm:px-0 flex items-center justify-between">
      <button
        type="button"
        aria-label="이전 단계로 이동"
        onClick={onPrev}
        disabled={currentStep === 1}
        className="flex items-center gap-2 px-6 py-4 sm:py-3 text-gray-500 border border-gray-500 rounded-lg hover:text-gray-700 hover:border-gray-700 transition-colors disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft className="size-5" />
        이전
      </button>
      <button
        type="button"
        aria-label={isLastStep ? "등록 완료" : "다음 단계로 이동"}
        onClick={onNext}
        disabled={isNextDisabled}
        className="flex items-center gap-2 px-6 py-4 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
      >
        {isLastStep ? (
          <>등록 완료</>
        ) : (
          <>
            다음
            <ChevronRight className="size-5" />
          </>
        )}
      </button>
    </div>
  );
}
