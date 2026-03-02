import { Plus } from "lucide-react";
import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { MenuSchema, type MenuFormValues } from "./Menu.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import MenuItemInput from "./MenuItemInput";

interface StepMenuRegistrationProps {
  defaultValues?: MenuFormValues;
  onChange: (isValid: boolean, data: MenuFormValues) => void;
}

export default function StepMenuRegistration({
  defaultValues,
  onChange,
}: StepMenuRegistrationProps) {
  const {
    register,
    control,
    setValue,
    watch,
    trigger,
    getValues,
    formState: { errors, isValid },
  } = useForm<MenuFormValues>({
    resolver: zodResolver(MenuSchema),
    defaultValues: {
      menus: defaultValues?.menus || [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "menus",
  });

  useEffect(() => {
    const subscription = watch((value) => {
      onChange(isValid, value as MenuFormValues);
    });
    onChange(isValid, getValues());
    return () => subscription.unsubscribe();
  }, [watch, isValid, onChange, getValues]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-gray-900 mb-2">메뉴 등록</h3>
        <p className="text-gray-600 text-sm break-keep">
          대표 메뉴를 등록해주세요. <br className="block sm:hidden" />
          나중에 추가하거나 수정할 수 있습니다.
        </p>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <MenuItemInput
            key={field.id}
            index={index}
            onDelete={() => remove(index)}
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            trigger={trigger}
          />
        ))}
        <button
          onClick={() =>
            append({
              name: "",
              price: "",
              description: "",
              category: "MAIN",
              imageKey: undefined,
            })
          }
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="size-5" aria-hidden="true" />
          메뉴 추가
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm text-center sm:text-start break-keep">
          💡 메뉴 등록은 선택사항입니다. 관리자 페이지에서 언제든지 추가하거나
          수정할 수 있습니다.
        </p>
      </div>
    </div>
  );
}
