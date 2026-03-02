import { Calendar, Clock, User, CreditCard, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { getBookings } from "@/api/bookings";
import { cancelBooking } from "@/api/bookings";

type ReservationStatus = "전체" | "예정된 예약" | "방문 완료" | "취소된 예약";

type Reservation = {
  id: number;
  shopName: string;
  status: "예약 확정" | "방문 완료" | "취소됨";
  address: string;
  date: string;
  time: string;
  people: string;
  payment: string;
  method: string;
  step: string;
};

export default function ReservationPage() {
  const [activeTab, setActiveTab] = useState<ReservationStatus>("전체");
const [reservations, setReservations] = useState<Reservation[]>([]);  
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

const fetchReservations = async () => {
    try {
      setLoading(true);

      let apiStatus: "CONFIRMED" | "COMPLETED" | "CANCELED" | undefined;
      switch (activeTab) {
      case "예정된 예약":
        apiStatus = "CONFIRMED";
        break;
      case "방문 완료":
        apiStatus = "COMPLETED";
        break;
      case "취소된 예약":
        apiStatus = "CANCELED";
        break;
      case "전체":
      default:
        apiStatus = undefined;
        break;
    }
      const data = await getBookings(apiStatus);

      const mapped: Reservation[] = (data.bookingList ?? []).map((b) => ({
        id: b.bookingId,
        shopName: b.storeName,
        address: b.storeAddress,
        date: b.bookingDate,
        time: b.bookingTime ?? "--:--", 
        people: b.partySize?.toString() ?? "0",
        payment: `${b.amount?.toLocaleString() ?? 0}원`,
        method: b.paymentMethod ?? "-",
        status:
          b.status === "CONFIRMED"
            ? "예약 확정"
            : b.status === "COMPLETED"
            ? "방문 완료"
            : "취소됨",
        step:
          b.status === "CONFIRMED"
            ? "예약 진행중"
            : b.status === "COMPLETED"
            ? "방문 완료"
            : "취소됨",
      }));


      setReservations(mapped);
    } catch (error) {
      console.error("예약 내역 조회 실패", error);
      setError("예약 내역을 불러오는 데 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [activeTab]);

  

  return (
    <section className="rounded-xl bg-white p-8 shadow-sm border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-medium">예약 현황</h2>
        <p className="mt-0.5 text-sm text-gray-600">
          내 예약 내역을 확인하고 관리하세요
        </p>
      </div>

      <div className="flex gap-6 border-b border-gray-100 mb-8">
        {["전체", "예정된 예약", "방문 완료", "취소된 예약"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as ReservationStatus)}
            className={cn(
              "cursor-pointer pb-4 font-medium transition-all relative",
              activeTab === tab ? "text-blue-600" : "hover:text-gray-700",
            )}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">로딩 중...</div>
       ) : error ? (
  <div className="py-20 text-center text-red-400 text-sm">{error}</div>
      ) : reservations.length > 0 ? (
        <div className="space-y-6">
          {reservations.map((res) => (
            <ReservationCard key={res.id} res={res} onCancel={fetchReservations} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-gray-400 text-sm">해당 내역이 없습니다.</div>
      )}
    </section>
  );
}

function ReservationCard({ res, onCancel }: { res: Reservation; onCancel: () => void }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm("정말 예약을 취소하시겠습니까?")) return;
    try {
      setLoading(true);
      await cancelBooking(res.id);
      alert("예약이 취소되었습니다.");
      onCancel();
    } catch (error) {
      console.error("예약 취소 실패", error);
      alert("예약 취소에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 p-6 transition-hover hover:shadow-md">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-0.5">
            <h3 className="text-xl font-medium">{res.shopName}</h3>
            <span
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                res.status === "예약 확정"
                  ? "bg-blue-50 text-blue-600"
                  : res.status === "방문 완료"
                  ? "bg-green-50 text-green-600"
                  : "bg-gray-100 text-gray-500",
              )}
            >
              {res.status}
            </span>
          </div>
          <p className="text-sm text-gray-400">{res.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-y-4 gap-x-8 pb-6">
        <InfoItem icon={<Calendar size={18} />} label="예약 날짜" value={res.date} />
        <InfoItem icon={<Clock size={18} />} label="예약 시간" value={res.time} />
        <InfoItem icon={<User size={18} />} label="인원" value={res.people} />
        <InfoItem
          icon={<CreditCard size={18} />}
          label="결제 정보"
          value={`${res.payment}\n${res.method}`}
          isMultiLine
        />
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("font-medium", res.status === "취소됨" ? "text-gray-400" : "text-green-600")}>
          {res.step}
        </span>
        <div className="flex gap-3">
          {res.status === "예약 확정" && (
              <button
                className={cn(
                  "cursor-pointer flex items-center gap-1 px-5 py-3 rounded-lg text-sm font-medium transition tracking-wide",
                  loading
                    ? "bg-gray-200 border-gray-200 text-gray-500 cursor-not-allowed"
                    : "border border-red-500 text-red-500 hover:bg-red-100"
                )}
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} /> 취소
              </button>
          )}
        </div>
      </div>
    </div>

      
  );
}

function InfoItem({ icon, label, value, isMultiLine = false }: { icon: React.ReactNode; label: string; value: string; isMultiLine?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-full bg-blue-100 text-blue-500">{icon}</div>
      <div>
        <p className="text-sm text-gray-400 mb-0.5">{label}</p>
        <p className={cn("", isMultiLine ? "whitespace-pre-line" : "")}>{value}</p>
      </div>
    </div>
  );
}
