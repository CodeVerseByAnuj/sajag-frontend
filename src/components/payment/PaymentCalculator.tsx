import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, IndianRupee, Calculator, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface PaymentCalculatorProps {
  originalAmount: string;
  setOriginalAmount: (val: string) => void;
  monthlyInterestRate: string;
  setMonthlyInterestRate: (val: string) => void;
  startDate: Date;
  setStartDate: (val: Date) => void;
  endDate: Date;
  setEndDate: (val: Date) => void;
  loading: boolean;
  fetchLoading: boolean;
  handleCalculate: () => void;
}

const PaymentCalculator: React.FC<PaymentCalculatorProps> = ({
  originalAmount,
  setOriginalAmount,
  monthlyInterestRate,
  setMonthlyInterestRate,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  loading,
  fetchLoading,
  handleCalculate,
}) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Payment Calculator</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {fetchLoading ? (
        <div className="flex items-center justify-center py-6">
          <RefreshCw className="text-primary h-6 w-6 animate-spin" />
          <span className="ml-2">Loading payment details...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label htmlFor="originalAmount" className="text-sm font-medium">
              Original Amount
            </label>
            <div className="relative">
              <IndianRupee className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <Input
                id="originalAmount"
                type="number"
                placeholder="Enter original amount"
                className="pl-9"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                disabled={fetchLoading}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="monthlyInterestRate" className="text-sm font-medium">
              Monthly Interest Rate (%)
            </label>
            <div className="relative">
              <Input
                id="monthlyInterestRate"
                type="number"
                placeholder="Enter interest rate"
                value={monthlyInterestRate}
                onChange={(e) => setMonthlyInterestRate(e.target.value)}
                disabled={fetchLoading}
                step="0.1"
                min="0"
                max="100"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Start Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground",
                  )}
                  disabled={fetchLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? `${format(startDate, "do MMM yyyy")}` : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              End Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  disabled={fetchLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? `${format(endDate, "do MMM yyyy")}` : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => date && setEndDate(date)}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </CardContent>
    <CardFooter>
      <Button
        onClick={handleCalculate}
        disabled={!originalAmount || !monthlyInterestRate || !startDate || !endDate || loading || fetchLoading}
        className="ml-auto"
      >
        {loading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Calculator className="mr-2 h-4 w-4" />
            Calculate
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
);

export default PaymentCalculator;
