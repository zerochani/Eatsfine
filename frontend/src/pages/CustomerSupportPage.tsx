import SupportContact from "@/components/customer-support/SupportContact";
import SupportFAQ from "@/components/customer-support/SupportFAQ";
import SupportHero from "@/components/customer-support/SupportHero";
import { ChevronLeft, CircleHelp } from "lucide-react";
import { Link } from "react-router-dom";

export default function CustomerSupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 py-6 flex items-center justify-center gap-3">
          <Link
            to="/"
            aria-label="메인으로 이동"
            className="absolute left-4 sm:left-8 lg:left-12 p-2 text-gray-400 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft className="size-8" />
          </Link>
          <CircleHelp className="size-8 text-blue-600" aria-hidden="true" />
          <h1 className="text-gray-900 text-lg">잇츠파인 고객센터</h1>
        </div>
      </header>

      <SupportHero />
      <SupportFAQ />
      <SupportContact />

      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 py-8">
          <p className="text-center break-keep">
            © 2026 Eatsfine. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
