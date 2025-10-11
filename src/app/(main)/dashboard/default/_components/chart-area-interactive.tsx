"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { getDailyAggregates } from "@/services/dashboardServices";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/use-mobile";
import { useQuery } from "@tanstack/react-query";

export const description = "An interactive area chart with dynamic data";

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  totalPaid: {
    label: "Total Principal",
    color: "var(--chart-1)",
  },
  interestPaid: {
    label: "Total Interest",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

type ChartDataItem = {
  date: string;
  totalPaid: number;
  interestPaid: number;
};

export function ChartAreaInteractiveDynamic() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState("30d");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["daily-aggregates"],
    queryFn: getDailyAggregates,
  });

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d");
    }
  }, [isMobile]);

  // Transform API data to chart format
  const chartData = React.useMemo(() => {
    if (!data?.labels || !data?.datasets) return [];

    const labels = data.labels;
    const totalPaidData = data.datasets.find((ds: { label: string; data: number[] }) => ds.label === "Total Paid")?.data || [];
    const interestPaidData = data.datasets.find((ds: { label: string; data: number[] }) => ds.label === "Interest Paid")?.data || [];

    return labels.map((date: string, index: number) => ({
      date,
      totalPaid: totalPaidData[index] || 0,
      interestPaid: interestPaidData[index] || 0,
    }));
  }, [data]);

  // Filter data based on time range
  const filteredData = React.useMemo(() => {
    if (chartData.length === 0) return [];

    const now = new Date();
    let daysToSubtract = 30;
    
    if (timeRange === "15d") {
      daysToSubtract = 15;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - daysToSubtract);

    return chartData.filter((item: ChartDataItem) => {
      const date = new Date(item.date);
      return date >= startDate;
    });
  }, [chartData, timeRange]);

  // Compute totals for the current filtered data range
  const totals = React.useMemo(() => {
    const totalPaid = filteredData.reduce((sum: number, item: ChartDataItem) => sum + (item.totalPaid || 0), 0);
    const interestPaid = filteredData.reduce((sum: number, item: ChartDataItem) => sum + (item.interestPaid || 0), 0);
    return { totalPaid, interestPaid };
  }, [filteredData]);

  const formatCurrency = (value: number) => {
    try {
      return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(value);
    } catch {
      return `₹${value.toFixed(2)}`;
    }
  };

  if (isLoading) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Visitors</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-muted-foreground">Loading chart...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="@container/card">
        <CardHeader>
          <CardTitle>Total Visitors</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-destructive">
              Failed to load chart data. {error?.message || "Please try again."}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between w-full gap-2">
          <div>
            <CardTitle>Total Visitors</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:block">
                Total for the last {timeRange === "7d" ? "7 days" : timeRange === "15d" ? "15 days" : "30 days"}
              </span>
              <span className="@[540px]/card:hidden">
                Last {timeRange === "7d" ? "7d" : timeRange === "15d" ? "15d" : "30d"}
              </span>
            </CardDescription>
          </div>
        </div>
        <CardAction>
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="15d">Last 15 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger 
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden" 
              size="sm" 
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="15d" className="rounded-lg">
                Last 15 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {filteredData.length === 0 ? (
          <div className="flex h-[250px] w-full items-center justify-center">
            <div className="text-muted-foreground">No data available for the selected time range</div>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillTotalPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-totalPaid)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-totalPaid)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillInterestPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-interestPaid)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-interestPaid)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <ChartTooltip
                cursor={false}
                defaultIndex={isMobile ? -1 : 10}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area 
                dataKey="interestPaid" 
                type="natural" 
                fill="url(#fillInterestPaid)" 
                stroke="var(--color-interestPaid)" 
                stackId="a" 
              />
              <Area 
                dataKey="totalPaid" 
                type="natural" 
                fill="url(#fillTotalPaid)" 
                stroke="var(--color-totalPaid)" 
                stackId="a" 
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}