import { ShieldCheck } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Placeholder } from "../../components/common/Placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/Card";
import { useHealth } from "../../hooks/useHealth";
import { PLACEHOLDER_MARKER } from "../../lib/placeholder";

const chartData = [
  { day: "Mon", value: 3 },
  { day: "Tue", value: 7 },
  { day: "Wed", value: 4 },
  { day: "Thu", value: 9 },
  { day: "Fri", value: 5 },
  { day: "Sat", value: 8 },
  { day: "Sun", value: 12 },
];

const stats = [
  { label: "Transactions scanned", value: "1,240", note: "placeholder data" },
  { label: "Suspicious findings", value: "12", note: "placeholder data" },
  { label: "Wallets monitored", value: "312", note: "placeholder data" },
  { label: "Signatures analyzed", value: "45,672", note: "placeholder data" },
];

export default function DashboardPage() {
  const { data: health } = useHealth();
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/60 p-3">
          <ShieldCheck className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted">
            Analyze. Investigate. Verify. — the analysis engine is under development.
          </p>
          {health?.status === "ok" && (
            <p className="mt-1 text-xs text-success">
              Backend responding: {health.service} {health.version}
            </p>
          )}
        </div>
      </div>

      <Placeholder title="Arqon dashboard data is a placeholder" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted">
                {stat.label}
              </CardTitle>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted">{stat.note}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity overview (placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 w-full" style={{ minWidth: 0 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} className="text-primary">
                <XAxis dataKey="day" className="text-muted" />
                <YAxis className="text-muted" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="currentColor"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  className="text-primary"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted">
            {PLACEHOLDER_MARKER.message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
