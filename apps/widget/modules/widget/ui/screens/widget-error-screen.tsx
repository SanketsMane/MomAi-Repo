"use client";

import { useAtomValue } from "jotai";
import { AlertTriangleIcon } from "lucide-react";
import { errorMessageAtom } from "@/modules/widget/atoms/widget-atoms";
import { WidgetHeader } from "@/modules/widget/ui/components/widget-header";

export const WidgetErrorScreen = () => {
  const errorMessage = useAtomValue(errorMessageAtom);

  return (
    <>
      <WidgetHeader>
        <div className="flex flex-col justify-between gap-y-2 px-2 py-6 font-semibold">
          <p className="text-3xl">
            Hi there! 👋
          </p>
          <p className="text-lg">
            Let&apos;s get you started
          </p>
        </div>
      </WidgetHeader>
      <div className="flex flex-1 flex-col items-center justify-center gap-y-4 p-6 text-center">
        {errorMessage?.includes("Welcome") ? (
          <div className="flex flex-col items-center gap-4">
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-700">
                MOM AI Assistant
              </p>
              <p className="text-sm text-gray-500 max-w-xs">
                {errorMessage}
              </p>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700">
                To use this widget, add <code className="bg-blue-100 px-1 rounded">?organizationId=your-org-id</code> to the URL
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <AlertTriangleIcon className="text-red-400" size={48} />
            <p className="text-sm text-gray-600">
              {errorMessage || "Invalid configuration"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};
