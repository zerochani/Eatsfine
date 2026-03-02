import type { ReactNode } from "react";

type Props = {
  title: string;
  desc: string;
  icon: ReactNode;
  iconBg: string;
  className?: string;
  style?: React.CSSProperties;
};

export default function FeatureCard({
  title,
  desc,
  icon,
  iconBg,
  className,
  style,
}: Props) {
  return (
    <div className={className} style={style}>
      <div className="border border-black rounded-3xl p-12 h-full items-center bg-white hover:shadow-2xl transition-shadow duration-300">
        <div
          className={`w-16 h-16 ${iconBg} flex items-center justify-center rounded-2xl mb-8`}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-3xl mb-4 tracking-tight">{title}</h3>
        <p className="font-extralight text-lg text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
