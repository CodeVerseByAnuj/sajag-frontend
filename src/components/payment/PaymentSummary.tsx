import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PaymentSummaryProps {
  summary: { totalPayments: number; totalInterest: number; totalPrincipal: number };
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ summary }) => (
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
        <span>₹{summary.totalPayments + summary.totalInterest}</span>
      </div>
    </CardContent>
  </Card>
);

export default PaymentSummary;
