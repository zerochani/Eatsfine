import {
  getMemberInfo,
  patchMemberInfo,
  putProfileImage,
} from "@/api/endpoints/member";
import { Button } from "@/components/ui/button";
import { phoneNumber } from "@/utils/phoneNumber";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, Save } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

type Form = {
  email: string;
  nickname: string;
  phone: string;
};

export default function MyInfoPage() {
  const qc = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [originalImageFile, setOriginalImageFile] = useState<File | null>(null);
  const [draftImageFile, setDraftImageFile] = useState<File | null>(null);

  const shownFile = isEditing ? draftImageFile : originalImageFile;
  const [shownUrl, setShownUrl] = useState<string | null>(null);

  const [serverProfileUrl, setServerProfileUrl] = useState<string | null>(null);

  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!shownFile) {
      setShownUrl(null);
      return;
    }
    const url = URL.createObjectURL(shownFile);
    setShownUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [shownFile]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["memberInfo"],
    queryFn: getMemberInfo,
    refetchOnWindowFocus: false,
  });

  const [original, setOriginal] = useState<Form>({
    email: "",
    nickname: "",
    phone: "",
  });
  const [draft, setDraft] = useState<Form>(original);

  const toAbsolute = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    const apiBase =
      (import.meta.env.VITE_API_URL as string | undefined)?.replace(
        /\/api\/?$/,
        "",
      ) ?? "";
    return `${apiBase}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  useEffect(() => {
    if (!data) return;

    const nextOriginal: Form = {
      email: data.email ?? "",
      nickname: data.name ?? "",
      phone: phoneNumber(data.phoneNumber ?? ""),
    };
    setOriginal(nextOriginal);
    setDraft(nextOriginal);
    setServerProfileUrl(toAbsolute(data.profileImage ?? null));
  }, [data]);

  const { mutate: saveMutate, isPending: isSaving } = useMutation({
    mutationFn: patchMemberInfo,
    onSuccess: async () => {
      setOriginal(draft);
      setOriginalImageFile(draftImageFile);
      setIsEditing(false);
      await qc.invalidateQueries({ queryKey: ["memberInfo"] });
    },
    onError: () => {
      alert("저장에 실패했습니다. 다시 시도해주세요");
    },
  });

  const { mutate: uploadImage, isPending: isUploadingImage } = useMutation({
    mutationFn: putProfileImage,
    onSuccess: async () => {
      setImageUploadError(null);
      await qc.invalidateQueries({ queryKey: ["memberInfo"] });
    },
    onError: () => {
      setImageUploadError(
        "프로필 이미지 저장에 실패했습니다. 다시 시도해주세요",
      );
      setDraftImageFile(originalImageFile);
      alert("프로필 이미지 저장에 실패했습니다. 다시 시도해주세요");
    },
  });

  const handleEditStart = () => {
    setDraft(original);
    setDraftImageFile(originalImageFile);
    setIsEditing(true);
  };

  const handleChange = (key: keyof Form, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const okType = ["image/jpeg", "image/png"];
    if (!okType.includes(file.type)) {
      setImageUploadError("PNG/JPG 파일만 업로드할 수 있습니다");
      return;
    }
    setImageUploadError(null);
    setDraftImageFile(file);
    uploadImage(file);

  };

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || digits.length === 11;
  };

  const handleSave = () => {
    if (!isValidPhone(draft.phone)) {
      alert("전화번호를 올바르게 입력해주세요.");
      return;
    }
    saveMutate({
      name: draft.nickname,
      phoneNumber: draft.phone.replace(/\D/g, ""),
    });
  };

  const handleCancel = () => {
    setDraft(original);
    setDraftImageFile(originalImageFile);
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <section className="border-gray-100 rounded-xl p-8 shadow-sm">
        <p className="text-muted-foreground">내 정보 불러오는중..</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="border-red-300 rounded-xl p-8 shadow-sm">
        <p className="text-red-500">내 정보를 불러오지 못했습니다</p>
      </section>
    );
  }

  const displayProfileSrc = shownUrl ?? serverProfileUrl ?? null;

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-medium">내 정보</h2>
        {!isEditing ? (
          <Button
            onClick={handleEditStart}
            variant="ghost"
            className="cursor-pointer px-4 py-5 text-md text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          >
            수정하기
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              onClick={handleCancel}
              variant="outline"
              className="cursor-pointer hover:bg-gray-100"
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600"
              disabled={isSaving || isUploadingImage || !!imageUploadError}
            >
              <Save size={16} />
              <p className="px-1 ml-1">저장</p>
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-10">
        <div className="relative">
          <div className="flex h-30 w-30 items-center justify-center overflow-hidden rounded-full bg-gray-200">
            {displayProfileSrc ? (
              <img
                src={displayProfileSrc}
                alt="프로필 이미지"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl text-gray-500">
                {draft.nickname?.[0] ?? "맛"}
              </span>
            )}
          </div>

          {isEditing && (
            <>
              <button
                type="button"
                onClick={handleImageClick}
                disabled={isUploadingImage}
                className="cursor-pointer transition absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white shadow hover:bg-blue-700"
              >
                <Camera size={20} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </>
          )}
        </div>

        <div className="w-full space-y-5">
          <div>
            <label className="mb-1 block text-gray-600">이메일</label>
            <input
              disabled
              value={draft.email}
              className={
                "w-full rounded-lg border border-gray-200 bg-gray-50 text-gray-500 px-4 py-3"
              }
            />
            {isEditing ? (
              <p className="mt-1 text-sm text-muted-foreground ml-4">
                이메일은 변경할 수 없습니다
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="nickname" className="mb-1 block text-gray-600">
              닉네임
            </label>
            <input
              id="nickname"
              disabled={!isEditing || isSaving}
              value={draft.nickname}
              onChange={(e) => handleChange("nickname", e.target.value)}
              className={`w-full rounded-lg border px-4 py-3 ${
                isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
            />
          </div>

          <div>
            <label className="mb-1 block text-gray-600">전화번호</label>
            <input
              disabled={!isEditing || isSaving}
              value={draft.phone}
              onChange={(e) =>
                handleChange("phone", phoneNumber(e.target.value))
              }
              inputMode="numeric"
              autoComplete="tel"
              className={`w-full rounded-lg border px-4 py-3 ${
                isEditing
                  ? "border-gray-300 bg-white"
                  : "border-gray-200 bg-gray-50 text-gray-500"
              }`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
