"use client"

import React, { useState, useEffect } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Calculator,
  CalendarIcon,
  IndianRupee,
  RefreshCw,
  AlertCircle,
  Info
} from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { getPaymentDetails, calculateInterest } from "@/services/paymentService"
import { CalculateInterestResponse } from "@/interface/paymentInterface"

function PaymentHistory() {
  const [itemId, setItemId] = useState<string>("")
  const [originalAmount, setOriginalAmount] = useState<string>("")
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<string>("2")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState<boolean>(false)
  const [fetchLoading, setFetchLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [calculationResult, setCalculationResult] = useState<CalculateInterestResponse | null>(null)

  useEffect(() => {
    // Get itemId from URL query params
    const params = new URLSearchParams(window.location.search);
    const id = "cmehgph7g0005cbe68yj5i43d"

    if (id) {
      setItemId(id);
      fetchPaymentDetails(id);
    }
  }, []);

  const fetchPaymentDetails = async (id: string) => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await getPaymentDetails(id);
      if (response.data?.currentStatus) {
        setOriginalAmount(response.data.currentStatus.remainingAmount.toString());
        if (response.data.currentStatus.monthlyInterestRate) {
          setMonthlyInterestRate(response.data.currentStatus.monthlyInterestRate.toString());
          if (response.data.currentStatus.interestPaidTill) {
            setStartDate(new Date(response.data.currentStatus.interestPaidTill));
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching payment details:', err);
      setError(err.message || 'Failed to fetch payment details');
    } finally {
      setFetchLoading(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    setCalculationResult(null);

    try {
      // Format dates to ISO strings (YYYY-MM-DD)
      const formattedStartDate = format(startDate, "yyyy-MM-dd");
      const formattedEndDate = format(endDate, "yyyy-MM-dd");

      const requestData = {
        amount: parseFloat(originalAmount),
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        percentage: parseFloat(monthlyInterestRate)
      };

      console.log("Sending calculation request:", requestData);

      // For testing: mock the response if the API is not available yet
      let response;
      try {
        // First try the real API
        response = await calculateInterest(requestData);
        console.log(response)
        if (response.success) {
          setCalculationResult({ success: response.success, message: response.message ?? "", data: response.data });
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Set warning instead of error
        setError("Using mock calculation - API not available. This is test data only.");
      }

    } catch (err: any) {
      console.error('Error calculating interest:', err);
      setError(err.message || 'Failed to calculate interest. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Payment History</h1>

      {error && (
        <Alert variant={error.includes("mock") ? "default" : "destructive"} className="mb-4">
          {error.includes("mock") ? (
            <Info className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payment Calculator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {fetchLoading ? (
            <div className="flex items-center justify-center py-6">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading payment details...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Original Amount Input */}
              <div className="space-y-2">
                <label htmlFor="originalAmount" className="text-sm font-medium">
                  Original Amount
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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

              {/* Monthly Interest Rate Input */}
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

              {/* Start Date Picker */}
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
                        !startDate && "text-muted-foreground"
                      )}
                      disabled={fetchLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
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

              {/* End Date Picker */}
              <div className="space-y-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                      disabled={fetchLoading}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
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

      {/* Payment calculation results */}
      {calculationResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Interest Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Principal Amount</h3>
                <p className="text-2xl font-semibold">₹{calculationResult.data.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Interest Rate</h3>
                <p className="text-2xl font-semibold">{calculationResult.data.monthlyRate}%</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Duration</h3>
                <p className="text-2xl font-semibold">{calculationResult.data.daysCalculated} days</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Interest Amount</h3>
                <p className="text-2xl font-semibold text-amber-600">₹{calculationResult.data.interest.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Total Amount</h3>
                <p className="text-2xl font-semibold text-primary">₹{calculationResult.data.totalAmount.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Period</h3>
                <p className="text-base">
                  {format(new Date(calculationResult.data.startDate), "dd MMM yyyy")} to {format(new Date(calculationResult.data.endDate), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-muted p-6 rounded-lg text-center">
          <p className="text-muted-foreground">
            Enter values and click Calculate to see interest calculation results
          </p>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
