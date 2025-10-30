"use client";

import * as React from "react";

import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { getMontlyAggregates } from "@/services/dashboardServices";

export const description = "A stacked bar chart with a legend";
export const iframeHeight = "200px";
export const containerClassName = "[&>div]:w-full [&>div]:max-w-md flex items-center justify-center min-h-svh";

type ApiChartData = {
  date: string;
  totalPaid: number;
  interestPaid: number;
};

const chartConfig = {
  totalPaid: {
    label: "Total Amount",
    color: "var(--chart-1)",
  },
  interestPaid: {
    label: "Total Interest",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function ChartTooltipDefault() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["monthly-aggregates"],
    queryFn: getMontlyAggregates,
  });

  const chartData: ApiChartData[] = React.useMemo(() => {
    if (!data?.labels || !data?.datasets) return [];

    const labels = data.labels as string[];
    const totalPaidData = data.datasets.find((ds: any) => ds.label === "Total Paid")?.data ?? [];
    const interestPaidData = data.datasets.find((ds: any) => ds.label === "Interest Paid")?.data ?? [];

    return labels.map((date, idx) => ({
      date,
      totalPaid: totalPaidData[idx] ?? 0,
      interestPaid: interestPaidData[idx] ?? 0,
    }));
  }, [data]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Totals</CardTitle>
        <CardDescription>
          Monthly stacked totals for total amount and interest. Hover a bar to see details and the total.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-[240px] w-full items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        ) : isError ? (
          <div className="flex h-[240px] w-full items-center justify-center">
            <div className="text-destructive">Failed to load chart data. {String(error?.message ?? "")}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-[240px] w-full items-center justify-center">
            <div className="text-muted-foreground">No data available</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[240px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => {
                  return new Date(String(value)).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  });
                }}
              />
              <Bar dataKey="interestPaid" stackId="a" fill="var(--color-interestPaid)" radius={[0, 0, 4, 4]} />
              <Bar dataKey="totalPaid" stackId="a" fill="var(--color-totalPaid)" radius={[4, 4, 0, 0]} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={false} defaultIndex={1} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default ChartTooltipDefault;
