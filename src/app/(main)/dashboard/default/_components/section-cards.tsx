"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { getDashboardStats } from "@/services/dashboardServices";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching dashboard stats</div>;

  const stats: Record<string, any> = data?.data ?? {};

  const fields = [
    { key: "totalCustomers", label: "Total Customers" },
    { key: "totalAmount", label: "Total Amount" },
    { key: "totalInterest", label: "Total Interest" },
    { key: "totalPaidAmount", label: "Total Paid Amount" },
    { key: "totalRemainingAmount", label: "Total Remaining Amount" },
    { key: "totalItems", label: "Total Items" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
      {fields
        .filter((field) => stats[field.key] !== null && stats[field.key] !== undefined)
        .map((field) => {
          const value = stats[field.key];
          const change = stats?.[`${field.key}Change`];
          const hasChange = typeof change === "number" && !isNaN(change);

          const isUp = hasChange ? change >= 0 : null;
          const TrendIcon = isUp ? TrendingUp : TrendingDown;

          return (
            <Card key={field.key} className="@container/card">
              <CardHeader>
                <CardDescription>{field.label}</CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {value}
                </CardTitle>

                {hasChange && (
                  <CardAction>
                    <Badge variant={isUp ? "default" : "destructive"}>
                      <TrendIcon className="mr-1 h-4 w-4" />
                      {isUp ? `+${change}%` : `${change}%`}
                    </Badge>
                  </CardAction>
                )}
              </CardHeader>

              {hasChange && (
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                  <div className="line-clamp-1 flex gap-2 font-medium">
                    {isUp
                      ? `Trending up by ${change}% this month`
                      : `Down ${Math.abs(change)}% this period`}
                    <TrendIcon className="size-4" />
                  </div>
                  <div className="text-muted-foreground">
                    {isUp
                      ? "Growth is consistent and improving"
                      : "Needs review and optimization"}
                  </div>
                </CardFooter>
              )}
            </Card>
          );
        })}
    </div>
  );
}
