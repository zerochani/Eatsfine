export function useConfirmClose(onClose: () => void) {
  return () => {
    const ok = window.confirm(
      "예약이 확정되지 않았습니다.\n예약화면을 벗어나시겠습니까?",
    );
    if (ok) onClose();
  };
}
