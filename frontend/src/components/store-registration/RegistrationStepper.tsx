import { Check } from "lucide-react";

interface RegistrationStepperProps {
  currentStep: 1 | 2 | 3;
}
export default function RegistrationStepper({
  currentStep,
}: RegistrationStepperProps) {
  const steps = [
    { number: 1, label: "사업자 인증" },
    { number: 2, label: "가게 정보" },
    { number: 3, label: "메뉴 등록" },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between max-w-2xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className={`flex items-start ${index !== steps.length - 1 ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    currentStep >= step.number
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="size-6" />
                  ) : (
                    <span className="font-medium">{step.number}</span>
                  )}
                </div>
                <span className="text-xs sm:text-sm text-gray-600 mt-2 break-keep text-center">{step.label}</span>
              </div>
              {index !== steps.length - 1 && (
                <div
                  className={`hidden sm:block flex-1 h-1 mx-8 mt-[24px] transition-colors ${
                    currentStep > step.number ? "bg-blue-500" : "bg-gray-200"
                  }`}
                  style={{ minWidth: "80px" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
