"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TASK_ORDER, TASK_META } from "@/lib/types";

interface ThroughLineChartProps {
  perTaskScores: number[];
}

export default function ThroughLineChart({
  perTaskScores,
}: ThroughLineChartProps) {
  const data = TASK_ORDER.map((taskId, i) => ({
    name: `T${TASK_META[taskId].number}`,
    fullName: TASK_META[taskId].label,
    score: perTaskScores[i] || 3,
  }));

  return (
    <div className="flex flex-col gap-3">
      <span className="font-sans text-xs font-medium uppercase tracking-widest text-ash">
        Through-Line Graph
      </span>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
            />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B6880", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={{ fill: "#6B6880", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
              axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#141420",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                color: "#EDE8E0",
                fontSize: 12,
                fontFamily: "var(--font-outfit)",
              }}
              formatter={(value, _name, props) => [
                `${value ?? 0}/5`,
                (props as unknown as { payload: { fullName: string } }).payload.fullName,
              ]}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3FCFCF"
              strokeWidth={2}
              dot={{
                r: 5,
                fill: "#E8943A",
                stroke: "#E8943A",
                strokeWidth: 2,
              }}
              activeDot={{
                r: 7,
                fill: "#E8943A",
                stroke: "#3FCFCF",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center font-sans text-xs italic text-ash">
        A flat line near the top = coherent. A jagged drop under pressure =
        cracked.
      </p>
    </div>
  );
}
