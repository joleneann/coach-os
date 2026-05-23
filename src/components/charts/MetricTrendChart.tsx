"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/**
 * MetricTrendChart
 *
 * Small line chart for a single metric over time.
 * Stone/amber palette. Shows shape, not raw numbers.
 */

interface Props {
  title: string;
  unit?: string;
  data: { date: string; value: number }[];
  showAxis?: boolean; // DATA_HEAVY shows axes, STANDARD doesn't
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function MetricTrendChart({
  title,
  unit,
  data,
  showAxis = false,
}: Props) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: formatDateShort(d.date),
  }));

  return (
    <div className="bg-white rounded-lg border border-stone-200 p-4">
      <h4 className="text-xs font-semibold text-stone-500 mb-3">
        {title}
        {unit && (
          <span className="font-normal text-stone-400 ml-1">({unit})</span>
        )}
      </h4>
      <div style={{ width: "100%", height: 120 }}>
        <ResponsiveContainer>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e7e5e4"
              vertical={false}
            />
            {showAxis && (
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false}
                tickLine={false}
              />
            )}
            {showAxis && (
              <YAxis
                tick={{ fontSize: 10, fill: "#a8a29e" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
            )}
            <Tooltip
              contentStyle={{
                background: "#1c1917",
                border: "none",
                borderRadius: "8px",
                fontSize: "11px",
                color: "white",
              }}
              formatter={(value) => [
                `${value}${unit ? " " + unit : ""}`,
                title,
              ]}
              labelFormatter={(label) => String(label)}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#d97706"
              strokeWidth={2}
              dot={{ fill: "#fbbf24", r: 3, stroke: "#d97706", strokeWidth: 1 }}
              activeDot={{ r: 5, fill: "#d97706" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
