import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { Payment } from "@/interface/payment-interface";

interface PaymentHistoryListProps {
  paymentHistory: Payment[];
}

const PaymentHistoryList: React.FC<PaymentHistoryListProps> = ({ paymentHistory }) => (
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
);

export default PaymentHistoryList;
