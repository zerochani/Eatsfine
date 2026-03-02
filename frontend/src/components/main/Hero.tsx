import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";

export default function Hero() {
  const nav = useNavigate();
  return (
    <section
      id="intro"
      className="relative h-screen flex items-center justify-center overflow-hidden bg-[#2196F3]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <iframe
          className="w-full h-full object-cover"
          src="https://www.youtube.com/embed/PrLJka0FtrY?autoplay=1&mute=1&loop=1&playlist=PrLJka0FtrY&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3&disablekb=1&fs=0"
          title="Hero Video"
          aria-hidden="true"
          tabIndex={-1}
          frameBorder={0}
          allow="autoplay; encrypted-media"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "56.25vw",
            minWidth: "177.78vh",
            minHeight: "100vh",
            transform: "translate(-50%, -50%) scale(1.5)",
            pointerEvents: "none",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black/30 z-10" />
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto ">
        <h1 className="text-white text-6xl font-bold mb-6 tracking-tight whitespace-nowrap">
          원하는 자리를 <br /> 원하는 분위기에서
        </h1>
        <p className="text-2xl text-white/90 mb-12 leading-relaxed">
          잇츠파인과 함께 새로운 식당 예약 경험을 시작하세요
        </p>
        <div className="relative z-10 flex gap-4 justify-center">
          <Button
            onClick={() => nav("/search")}
            className="bg-[#2196F3] hover:bg-[#1E88E5] text-white font-semibold rounded-full px-8 py-6 text-lg transition-colors cursor-pointer"
          >
            식당 예약
          </Button>
          <Button
            onClick={() => nav("/mypage/store")}
            variant="outline"
            className="border-white border-2 bg-white/10 text-white font-semibold hover:bg-white hover:text-[#2196F3] rounded-full px-8 py-6 text-lg backdrop-blur-sm transition-colors cursor-pointer"
          >
            내 가게 관리
          </Button>
        </div>
      </div>
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1.5 h-2 bg-white/50 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}
