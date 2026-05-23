"use client";

import {
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";

/**
 * HabitAdherenceChart
 *
 * Bar chart showing weekly adherence for a single habit.
 * Amber bars. Taller = higher adherence. No red/green.
 */

interface Props {
  habitLabel: string;
  data: { week: string; rate: number }[];
}

function formatWeekShort(weekStr: string) {
  const d = new Date(weekStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getBarColor(rate: number): string {
  if (rate >= 80) return "#fbbf24"; // amber-400
  if (rate >= 50) return "#fde68a"; // amber-200
  return "#e7e5e4"; // stone-200
}

export default function HabitAdherenceChart({ habitLabel, data }: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: formatWeekShort(d.week),
  }));

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <h4 className="text-xs font-semibold text-stone-500 mb-3 truncate">
        {habitLabel}
      </h4>
      <div style={{ width: "100%", height: 100 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e7e5e4"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#a8a29e" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#1c1917",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                color: "white",
              }}
              formatter={(value) => [`${value}%`, "Adherence"]}
              labelFormatter={(label) => `Week of ${String(label)}`}
            />
            <Bar dataKey="rate" radius={[3, 3, 0, 0]} maxBarSize={24}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={getBarColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
