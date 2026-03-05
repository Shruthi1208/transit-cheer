import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "default" | "stop" | "skip" | "crowded";
}

const StatCard = ({ title, value, subtitle, icon: Icon, variant = "default" }: StatCardProps) => {
  const variantStyles = {
    default: "border-border",
    stop: "border-transit-stop/30 bg-transit-stop/5",
    skip: "border-transit-skip/30 bg-transit-skip/5",
    crowded: "border-transit-crowded/30 bg-transit-crowded/5",
  };

  const iconStyles = {
    default: "text-primary bg-accent",
    stop: "text-transit-stop bg-transit-stop/10",
    skip: "text-transit-skip bg-transit-skip/10",
    crowded: "text-transit-crowded bg-transit-crowded/10",
  };

  return (
    <div className={`glass-card rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-display font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
