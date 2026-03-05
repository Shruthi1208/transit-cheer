interface StatusBadgeProps {
  status: "stop" | "skip" | "crowded" | "low" | "medium" | "high";
  label?: string;
}

const StatusBadge = ({ status, label }: StatusBadgeProps) => {
  const config = {
    stop: { bg: "status-stop", text: "STOP" },
    skip: { bg: "status-skip", text: "SKIP" },
    crowded: { bg: "status-crowded", text: "CROWDED" },
    low: { bg: "status-stop", text: "Low" },
    medium: { bg: "status-crowded", text: "Medium" },
    high: { bg: "status-skip", text: "High" },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg}`}>
      {label || c.text}
    </span>
  );
};

export default StatusBadge;
