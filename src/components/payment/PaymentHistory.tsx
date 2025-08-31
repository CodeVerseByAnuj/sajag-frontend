"use client";

import React, { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { format } from "date-fns";
import { Calculator, CalendarIcon, IndianRupee, RefreshCw, AlertCircle, Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalculateInterestResponse, Payment } from "@/interface/payment-interface";
import { cn } from "@/lib/utils";
import { getPaymentDetails, calculateInterest, payment } from "@/services/payment-service";

function PaymentHistory() {
  const searchParams = useSearchParams();
  const itemId = searchParams.get("itemId");
  const [originalAmount, setOriginalAmount] = useState<string>("");
  const [monthlyInterestRate, setMonthlyInterestRate] = useState<string>("2");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [calculationResult, setCalculationResult] = useState<CalculateInterestResponse | null>(null);
  const [paymentDate, setPaymentDate] = useState<Date | null>(null);
  const [interestAmount, setInterestAmount] = useState<number | null>(null);
  const [principalAmount, setPrincipalAmount] = useState<number | null>(null);
  const [summary, setSummary] = useState<{ totalPayments: number; totalInterest: number; totalPrincipal: number }>({
    totalPayments: 0,
    totalInterest: 0,
    totalPrincipal: 0,
  });
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  console.log(paymentHistory, "paymentHistory");

  useEffect(() => {
    if (itemId) {
      fetchPaymentDetails(itemId);
    }
  }, [itemId]);

  const fetchPaymentDetails = async (id: string) => {
    setFetchLoading(true);
    setError(null);

    try {
      const response = await getPaymentDetails(id);
      if (response.data?.currentStatus) {
        setSummary({
          totalPayments: response.data.summary.totalAmountPaid ?? 0,
          totalInterest: response.data.summary.totalInterestPaid ?? 0,
          totalPrincipal: response.data.summary.totalPrincipalPaid ?? 0,
        });
        setOriginalAmount(response.data.currentStatus.remainingAmount.toString());
  setPaymentHistory(response.data.payments ?? []);
        if (response.data.currentStatus.monthlyInterestRate) {
          setMonthlyInterestRate(response.data.currentStatus.monthlyInterestRate.toString());
          if (response.data.currentStatus.interestPaidTill) {
            setStartDate(new Date(response.data.currentStatus.interestPaidTill));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching payment details:", err);
      setError((err as Error).message ?? "Failed to fetch payment details");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleAddPayment = async () => {
    setLoading(true);
    setError(null);
    console.log(paymentDate, "99");
    try {
      // Format paymentDate as 'YYYY-MM-DD' for API
      const formattedPaymentDate = paymentDate ? format(paymentDate, "yyyy-MM-dd") : "";
      const response = await payment({
        itemId: itemId ?? "",
        paymentDate: formattedPaymentDate,
        principalAmount,
        interestAmount,
        amount: principalAmount ?? 0,
        paymentType: "principal" // or another valid type as required by your API
      });

      if (response.success) {
        // Payment added successfully
        // You can also update the payment history state here
      } else {
        setError(response.message || "Failed to add payment");
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      setError((err as Error).message ?? "Failed to add payment");
    } finally {
      setLoading(false);
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
        percentage: parseFloat(monthlyInterestRate),
      };

      console.log("Sending calculation request:", requestData);

      // For testing: mock the response if the API is not available yet
      let response;
      try {
        // First try the real API
        response = await calculateInterest(requestData);
        console.log(response);
        if (response.success) {
          setCalculationResult({ success: response.success, message: response.message ?? "", data: response.data });
          setPrincipalAmount(response.data.amount);
          setInterestAmount(response.data.interest);
          // Remove setting paymentDate since paymentDate is not present in response.data
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        // Set warning instead of error
        setError("Using mock calculation - API not available. This is test data only.");
      }
    } catch (err) {
      console.error("Error calculating interest:", err);
      setError((err as Error).message ?? "Failed to calculate interest. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="mb-6 text-2xl font-bold">Payment History</h1>
      {/* Summary */}
      {summary && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Payment Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <span>Total Payments:</span>
              <span>₹{summary.totalPayments}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Interest:</span>
              <span>₹{summary.totalInterest}</span>
            </div>
            <div className="flex justify-between">
              <span>Overall Total:</span>
              <span>₹{summary.totalPayments + summary.totalInterest + summary.totalPrincipal}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant={error.includes("mock") ? "default" : "destructive"} className="mb-4">
          {error.includes("mock") ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
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
              <RefreshCw className="text-primary h-6 w-6 animate-spin" />
              <span className="ml-2">Loading payment details...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Original Amount Input */}
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

              {/* End Date Picker */}
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

      {/* Payment calculation results */}
      {calculationResult ? (
        <Card>
          <CardHeader>
            <CardTitle>Interest Calculation Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Principal Amount</h3>
                <p className="text-2xl font-semibold">₹{calculationResult.data.amount.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Interest Rate</h3>
                <p className="text-2xl font-semibold">{calculationResult.data.monthlyRate}%</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Duration</h3>
                <p className="text-2xl font-semibold">{calculationResult.data.daysCalculated} days</p>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Interest Amount</h3>
                <p className="text-2xl font-semibold text-amber-600">
                  ₹{calculationResult.data.interest.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Total Amount</h3>
                <p className="text-primary text-2xl font-semibold">
                  ₹{calculationResult.data.totalAmount.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Period</h3>
                <p className="text-base">
                  {format(new Date(calculationResult.data.startDate), "dd MMM yyyy")} to{" "}
                  {format(new Date(calculationResult.data.endDate), "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-muted rounded-lg p-6 text-center">
          <p className="text-muted-foreground">Enter values and click Calculate to see interest calculation results</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Original Amount Input */}
            <div className="space-y-2">
              <label htmlFor="originalAmount" className="text-sm font-medium">
                principal Amount
              </label>
              <div className="relative">
                <IndianRupee className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  id="principalAmount"
                  type="number"
                  placeholder="Enter principal amount"
                  className="pl-9"
                  value={principalAmount ?? ""}
                  onChange={(e) => setPrincipalAmount(e.target.value === "" ? null : Number(e.target.value))}
                  disabled={fetchLoading}
                />
              </div>
            </div>

            {/* Monthly Interest Rate Input */}
            <div className="space-y-2">
              <label htmlFor="monthlyInterestRate" className="text-sm font-medium">
                Interest Ammount
              </label>
              <div className="relative">
                <Input
                  id="interestAmount"
                  type="number"
                  placeholder="Enter interest amount"
                  value={interestAmount ?? ""}
                  onChange={(e) => setInterestAmount(e.target.value === "" ? null : Number(e.target.value))}
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
                payment Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                    disabled={fetchLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? `${format(startDate, "do MMM yyyy")}` : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={paymentDate ?? undefined}
                    onSelect={(date) => date && setPaymentDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleAddPayment} className="ml-auto" disabled={fetchLoading}>
            Add Payment
          </Button>
        </CardFooter>
      </Card>
      {/* Payment History */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paymentHistory.map((payment) => (
              <Card key={payment.id} className="border-primary/20 shadow-md">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-base font-semibold text-blue-700">
                      {payment.paymentDate ? format(new Date(payment.paymentDate), "dd MMM yyyy, hh:mm a") : ""}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Principal:</span>
                      <span className="text-sm font-semibold">₹{payment.principalAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Interest:</span>
                      <span className="text-sm font-semibold">₹{payment.interestAmount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="text-primary h-4 w-4" />
                      <span className="text-primary text-sm font-medium">Total Payment:</span>
                      <span className="text-base font-bold">₹{payment.amount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaymentHistory;
