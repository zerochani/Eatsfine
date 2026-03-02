export default function SupportContact() {
  return (
    <section className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-16 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 이메일 문의 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-blue-500 font-medium mb-2">이메일 문의</h3>
            <p className="text-gray-500 mb-2">support@eatsfine.com</p>
            <p className="text-gray-500">24시간 이내 답변</p>
          </div>
          {/* 카카오톡 문의 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-blue-500 font-medium mb-2">카카오톡 채널</h3>
            <a
              href="#" //추후 링크 추가
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-blue-500 hover:underline cursor-pointer"
            >
              @Eatsfine
            </a>
            <p className="text-gray-500 mt-2">평일 09:00 - 18:00</p>
          </div>
          {/* 운영 시간 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-blue-500 font-medium mb-2">운영 시간</h3>
            <p className="text-gray-500 mb-2">평일 09:00 - 18:00</p>
            <p className="text-gray-500">주말 및 공휴일 휴무</p>
          </div>
        </div>
      </div>
    </section>
  );
}
