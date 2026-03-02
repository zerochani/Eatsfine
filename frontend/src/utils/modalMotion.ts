export function backdropMotionClass(entered: boolean) {
  return [
    "absolute inset-0 bg-black/50",
    "transition-opacity duration-200 ease-out",
    entered ? "opacity-100" : "opacity-0",
  ].join(" ");
}

export function panelMotionClass(entered: boolean) {
  return [
    "transition-all duration-200 ease-out",
    "will-change-transform will-change-opacity",
    entered ? "opacity-100 scale-100" : "opacity-0 scale-[0.96]",
  ].join(" ");
}
