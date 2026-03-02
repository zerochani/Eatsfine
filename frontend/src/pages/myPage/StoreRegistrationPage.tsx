import CompleteModal from "@/components/store-registration/CompleteModal";
import ConfirmModal from "@/components/store-registration/ConfirmModal";
import type { MenuFormValues } from "@/components/store-registration/Menu.schema";
import RegistrationNavigation from "@/components/store-registration/RegistrationNavigation";
import RegistrationStepper from "@/components/store-registration/RegistrationStepper";
import StepBusinessAuth from "@/components/store-registration/StepBusinessAuth";
import StepMenuRegistration from "@/components/store-registration/StepMenuRegistration";
import StepStoreInfo from "@/components/store-registration/StepStoreInfo";
import type { StoreInfoFormValues } from "@/components/store-registration/StoreInfo.schema";
import { transformToRegister } from "@/components/store-registration/StoreTransform.utils";
import { useMenuCreate, useMenuImage } from "@/hooks/queries/useMenu";
import { useMainImage, useRegisterStore } from "@/hooks/queries/useStore";
import type { ApiError } from "@/types/api";
import { getErrorMessage } from "@/utils/error";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

type Step1Data = {
  name: string;
  businessNumber: string;
  startDate: string;
  isVerified: boolean;
};

export default function StoreRegistrationPage() {
  const { mutateAsync: registerStore } = useRegisterStore();
  const { mutateAsync: uploadImage } = useMainImage();
  const { mutateAsync: uploadMenuImage } = useMenuImage();
  const { mutateAsync: createMenu } = useMenuCreate();

  const navigate = useNavigate();

  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [step1Data, setStep1Data] = useState<Step1Data>({
    name: "",
    businessNumber: "",
    startDate: "",
    isVerified: false,
  });

  const [step2Data, setStep2Data] = useState<Partial<StoreInfoFormValues>>({});

  const [step3Data, setStep3Data] = useState<MenuFormValues>({ menus: [] });

  //각 단계별 유효성(완료) 상태 관리
  const [isStep1Valid, setIsStep1Valid] = useState(false);
  const [isStep2Valid, setIsStep2Valid] = useState(false);
  const [isStep3Valid, setIsStep3Valid] = useState(true);

  const TOTAL_STEPS = 3;

  const handleStep2Change = useCallback(
    (isValid: boolean, data: StoreInfoFormValues) => {
      setStep2Data(data);
      setIsStep2Valid(isValid);
    },
    [],
  );

  const handleStep3Change = useCallback(
    (isValid: boolean, data: MenuFormValues) => {
      setStep3Data(data);
      setIsStep3Valid(isValid);
    },
    [],
  );

  const handleNext = async () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    } else {
      const finalPayload = transformToRegister(
        step1Data as Required<typeof step1Data>,
        step2Data as Required<typeof step2Data>,
      );

      try {
        const res = await registerStore(finalPayload);
        const createdStoreId = res.storeId;
        const promises = [];

        if (step2Data.mainImage && step2Data.mainImage instanceof File) {
          promises.push(
            uploadImage({
              storeId: createdStoreId,
              body: { mainImage: step2Data.mainImage },
            }),
          );
        }

        if (step3Data.menus.length > 0) {
          const processedMenus = await Promise.all(
            step3Data.menus.map(async (menu) => {
              let finalImageKey: string | undefined = undefined;

              if (menu.imageKey instanceof File) {
                try {
                  const uploadRes = await uploadMenuImage({
                    storeId: createdStoreId,
                    body: { image: menu.imageKey },
                  });
                  finalImageKey = uploadRes.imageKey;
                } catch (err) {
                  console.error("메뉴 이미지 업로드 실패:", err);
                }
              } else if (typeof menu.imageKey === "string") {
                finalImageKey = menu.imageKey;
              }
              return {
                name: menu.name,
                price: Number(menu.price),
                description: menu.description,
                category: menu.category,
                imageKey: finalImageKey,
              };
            }),
          );
          promises.push(
            createMenu({
              storeId: createdStoreId,
              body: { menus: processedMenus },
            }),
          );
        }

        await Promise.all(promises);

        setIsCompleteModalOpen(true);
      } catch (error: any) {
        console.error("가게 등록 실패:", error);
        const errorResponse = error.response?.data as ApiError;
        if (errorResponse?.code === "REGION404") {
          alert("현재 서울 지역만 등록 가능합니다.");
        } else {
          alert(getErrorMessage(error));
        }
      }
    }
  };

  const handleExit = () => {
    setIsCompleteModalOpen(false);
    navigate("/mypage/store", { replace: true });
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  const isNextDisabled =
    (currentStep === 1 && !isStep1Valid) ||
    (currentStep === 2 && !isStep2Valid) ||
    (currentStep === 3 && !isStep3Valid);

  return (
    <div className="min-h-screen bg-gray-50">
      <ConfirmModal
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleExit}
      />
      <CompleteModal
        isOpen={isCompleteModalOpen}
        onClose={handleExit}
        autoCloseMs={5000}
        data={step2Data}
      />
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg text-gray-900">새 가게 등록</h2>
              <p className="mt-1 text-sm text-gray-500 break-keep">
                잇츠파인에 가게를 <br className="block sm:hidden" />
                등록하고 예약을 받아보세요
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsExitModalOpen(true)}
              className="text-gray-500 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="size-6" />
            </button>
          </div>
        </div>
      </header>

      <RegistrationStepper currentStep={currentStep} />
      <main className="max-w-7xl mx-auto px-6 py-5 sm:px-8 sm:py-8">
        {currentStep === 1 && (
          <StepBusinessAuth
            defaultValues={step1Data}
            onComplete={(data) => {
              setStep1Data(data);
              setIsStep1Valid(data.isVerified);
            }}
          />
        )}
        {currentStep === 2 && (
          <StepStoreInfo
            defaultValues={step2Data}
            onChange={handleStep2Change}
          />
        )}
        {currentStep === 3 && (
          <StepMenuRegistration
            defaultValues={step3Data}
            onChange={handleStep3Change}
          />
        )}
      </main>

      <RegistrationNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        onPrev={handlePrev}
        onNext={handleNext}
        isNextDisabled={isNextDisabled}
      />
    </div>
  );
}
