import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const prevent = (e: React.MouseEvent<HTMLAnchorElement>) =>
    e.preventDefault();

  return (
    <footer className="py-16 px-6 text-white bg-black/95">
      <div className="mx-auto max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-10">
            <h3 className="text-2xl font-semibold">잇츠파인</h3>
            <p className="text-white/80">
              원하는 자리를 직접 선택하는 <br />
              새로운 예약 경험
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">서비스</h3>
            <ul className="space-y-3">
              <li className="text-white/60">
                <a
                  href="/search"
                  className="hover:text-white transition-colors"
                >
                  자리 예약
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="/search"
                  className="hover:text-white transition-colors"
                >
                  식당 검색
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="#"
                  onClick={prevent}
                  className="hover:text-white transition-colors"
                >
                  리뷰 보기
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="/mypage/store"
                  className="hover:text-white transition-colors"
                >
                  사장님 등록
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">회사</h3>
            <ul className="space-y-3">
              <li className="text-white/60">
                <a
                  href="#"
                  onClick={prevent}
                  className="hover:text-white transition-colors"
                >
                  회사 소개
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="#"
                  onClick={prevent}
                  className="hover:text-white transition-colors"
                >
                  채용
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="#"
                  onClick={prevent}
                  className="hover:text-white transition-colors"
                >
                  공지사항
                </a>
              </li>
              <li className="text-white/60">
                <a
                  href="#"
                  onClick={prevent}
                  className="hover:text-white transition-colors"
                >
                  문의하기
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">소셜</h3>
            <div className="flex gap-4">
              <a
                href="#"
                onClick={prevent}
                aria-label="Instagram"
                className="bg-white/10 p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                onClick={prevent}
                aria-label="Facebook"
                className="bg-white/10 p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/60">
            <p>© 2026 잇츠파인. All rights reserved.</p>
            <div className="flex gap-6">
              <a
                href="#"
                onClick={prevent}
                className="hover:text-white transition-colors"
              >
                이용약관
              </a>
              <a
                href="#"
                onClick={prevent}
                className="hover:text-white transition-colors"
              >
                개인정보처리방침
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
