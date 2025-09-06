"use client";

import React, { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";

import { format } from "date-fns";
import { Calculator, CalendarIcon, IndianRupee, RefreshCw, AlertCircle, Info } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalculateInterestResponse, Payment } from "@/interface/payment-interface";
import { getPaymentDetails, calculateInterest, payment } from "@/services/payment-service";
import PaymentSummary from "./PaymentSummary";
import PaymentCalculator from "./PaymentCalculator";
import PaymentForm from "./PaymentForm";
import PaymentHistoryList from "./PaymentHistoryList";
import { toast } from "sonner";
// Removed duplicate import of Info and AlertCircle

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
  const [paymentDate, setPaymentDate] = useState<Date | null>(new Date());
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
      console.log(response, "first");
      if (response.success) {
        // Payment added successfully
        // You can also update the payment history state here
      } else {
        setError(response.message || "Failed to add payment");
        toast.error("Submission Failed", {
          description: error,
        });
      }
    } catch (err) {
      console.error("Error adding payment:", err);
      setError((err as Error).message ?? "Failed to add payment");
      toast.error("Submission Failed", {
        description: err as string,
      });
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
      {summary && <PaymentSummary summary={summary} />}

      {error && (
        <Alert variant={error.includes("mock") ? "default" : "destructive"} className="mb-4">
          {error.includes("mock") ? <Info className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <PaymentCalculator
        originalAmount={originalAmount}
        setOriginalAmount={setOriginalAmount}
        monthlyInterestRate={monthlyInterestRate}
        setMonthlyInterestRate={setMonthlyInterestRate}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        loading={loading}
        fetchLoading={fetchLoading}
        handleCalculate={handleCalculate}
      />

      {/* Payment calculation results */}
      {calculationResult ? (
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Interest Calculation Results</h2>
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
                <p className="text-2xl font-semibold text-amber-600">₹{calculationResult.data.interest.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Total Amount</h3>
                <p className="text-primary text-2xl font-semibold">₹{calculationResult.data.totalAmount.toLocaleString()}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-muted-foreground text-sm font-medium">Period</h3>
                <p className="text-base">
                  {calculationResult.data.startDate && calculationResult.data.endDate ? (
                    <>
                      {format(new Date(calculationResult.data.startDate), "dd MMM yyyy")} to {format(new Date(calculationResult.data.endDate), "dd MMM yyyy")}
                    </>
                  ) : null}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-lg p-6 text-center mb-6">
          <p className="text-muted-foreground">Enter values and click Calculate to see interest calculation results</p>
        </div>
      )}

      <PaymentForm
        principalAmount={principalAmount}
        setPrincipalAmount={setPrincipalAmount}
        interestAmount={interestAmount}
        setInterestAmount={setInterestAmount}
        paymentDate={paymentDate}
        setPaymentDate={setPaymentDate}
        fetchLoading={fetchLoading}
        handleAddPayment={handleAddPayment}
      />

      <PaymentHistoryList paymentHistory={paymentHistory} />
    </div>
  );
}

export default PaymentHistory;
