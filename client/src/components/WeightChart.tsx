import { useCallback } from "react";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import type { Kitten, WeightRecord } from "../services/LitterService";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088FE",
  "#00C49F",
  "#FFBB28",
];

const WeightChart: React.FC<{
  kittens: Kitten[];
  weightRecords: { [kittenId: string]: WeightRecord[] };
}> = ({ kittens, weightRecords }) => {
  const processDataForChart = useCallback(() => {
    const dataMap: {
      [date: string]: { date: string; [kittenName: string]: number | string };
    } = {};
    Object.keys(weightRecords).forEach((kittenId) => {
      const kitten = kittens.find((k) => k.id === kittenId);
      if (!kitten) return;
      const records = weightRecords[kittenId];
      records.forEach((record) => {
        const dateStr = record.dateRecorded;
        if (!dataMap[dateStr]) {
          dataMap[dateStr] = { date: dateStr };
        }
        dataMap[dateStr][kitten.name] = record.weightInGrams;
      });
    });
    return Object.values(dataMap).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [kittens, weightRecords]);

  const chartData = processDataForChart();

  if (chartData.length === 0) {
    return (
      <div className="alert alert-info text-center">
        No weight records found for any kittens in this litter.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tickFormatter={(tick) => new Date(tick).toLocaleDateString()}
          />
          <YAxis
            label={{ value: "Weight (g)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            formatter={(value: number) => `${value} g`}
            labelFormatter={(label) => new Date(label).toLocaleDateString()}
          />
          <Legend />
          {kittens.map((kitten, index) => (
            <Line
              key={kitten.id}
              type="monotone"
              dataKey={kitten.name}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
