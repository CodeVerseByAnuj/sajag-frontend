import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";

import { toast } from "sonner";

interface PaymentFormProps {
  principalAmount: number | null;
  setPrincipalAmount: (val: number | null) => void;
  interestAmount: number | null;
  setInterestAmount: (val: number | null) => void;
  paymentDate: Date | null;
  setPaymentDate: (val: Date | null) => void;
  fetchLoading: boolean;
  handleAddPayment: () => Promise<void> | void;
  loading?: boolean;
  error?: string | null;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  principalAmount,
  setPrincipalAmount,
  interestAmount,
  setInterestAmount,
  paymentDate,
  setPaymentDate,
  fetchLoading,
  handleAddPayment,
  loading: loadingProp = false,
  error = null,
}) => {
  const [localLoading, setLocalLoading] = React.useState(false);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const onAddPaymentClick = async () => {
    setLocalLoading(true);
    try {
      await handleAddPayment();
    } finally {
      setLocalLoading(false);
    }
  };

  const loading = loadingProp || localLoading;

  return (
  <Card>
    <CardHeader>
      <CardTitle>Payment History</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <label htmlFor="principalAmount" className="text-sm font-medium">
            Principal Amount
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
        <div className="space-y-2">
          <label htmlFor="interestAmount" className="text-sm font-medium">
            Interest Amount
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
        <div className="space-y-2">
          <label htmlFor="paymentDate" className="text-sm font-medium">
            Payment Date
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !paymentDate && "text-muted-foreground")}
                disabled={fetchLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {paymentDate ? `${format(paymentDate, "do MMM yyyy")}` : "Select date"}
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
      <Button
        onClick={onAddPaymentClick}
        className="ml-auto"
        disabled={
          fetchLoading ||
          loading ||
          principalAmount === null ||
          interestAmount === null ||
          paymentDate === null
        }
      >
        {loading ? (
          <span className="flex items-center">
           <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </span>
        ) : (
          "Add Payment"
        )}
      </Button>
    </CardFooter>
  </Card>
  );
};

export default PaymentForm;
