"use client";

import { useEffect } from "react";

import { useSearchParams, useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Interfaces & Services
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AddCustomerResponseInterface } from "@/interface/customer-interface";

// UI Components

// Zod Schema
const customerDataSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  relation: z.enum(["father", "mother", "wife", "husband", "son", "daughter", "other"]),
  address: z.string().min(1, "Address is required"),
  aadharNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: "Aadhar number must be 12 digits",
    }),
  mobileNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{0,10}$/.test(val), {
      message: "Enter up to 10 digits",
    }),
});
    import { addOrUpdateCustomer, getCustomerById } from "@/services/customer-service";
type CustomerFormValues = z.infer<typeof customerDataSchema>;

type AddCustomersFormProps = {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit?: (data: CustomerFormValues) => void;
};

export function AddCustomersForm({ defaultValues, onSubmit }: AddCustomersFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const customerId = searchParams.get("customerId");

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerDataSchema),
    defaultValues: defaultValues || {
      customerId: customerId || "",
      name: "",
      guardianName: "",
      relation: "father",
      address: "",
      aadharNumber: "",
      mobileNumber: "",
    },
  });

  // Submit Handler
  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      const customerInput = { ...data, customerId: data.customerId ?? "" };

      const response: AddCustomerResponseInterface = await addOrUpdateCustomer(customerInput);

      if (response.success) {
        getCustomer();
        toast.success(response.message, {
          description: `Customer ID: ${response.data.customerId}`,
        });
        router.push("/dashboard/customers");
        form.reset();
      }
    } catch (error: any) {
      toast.error("Submission Failed", {
        description: error.message,
      });
    }
  };

  // Fetch Customer by ID
  const getCustomer = async () => {
    if (!customerId) return;
    try {
      const res = await getCustomerById(customerId);
      if (res) {
        const values: CustomerFormValues = {
          customerId: customerId || "",
          name: res.name || "",
          guardianName: res.guardianName || "",
          relation: (res.relation as CustomerFormValues["relation"]) || "father",
          address: res.address || "",
          aadharNumber: res.aadharNumber || "",
          mobileNumber: res.mobileNumber || "",
        };
        form.reset(values);
        console.log("🚀 Form values after reset:", values);
      } else {
        toast.error("Customer not found");
      }
    } catch (error: any) {
      toast.error("Failed to load customer", {
        description: error.message,
      });
    }
  };

  useEffect(() => {
    if (customerId) getCustomer();
  }, [customerId]);

  return (
    <Card className="mx-auto max-w-3xl p-6 shadow-lg">
      <h2 className="mb-6 text-center text-xl font-semibold">{customerId ? "Update Customer" : "Add New Customer"}</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  Full Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Guardian Name */}
          <FormField
            control={form.control}
            name="guardianName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Guardian Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter guardian name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Relation */}
          <div>
            <FormField
              control={form.control}
              name="relation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Relation <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl className="w-full">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select relation" />
                      </SelectTrigger>
                      <SelectContent className="w-full">
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="wife">Wife</SelectItem>
                        <SelectItem value="husband">Husband</SelectItem>
                        <SelectItem value="son">Son</SelectItem>
                        <SelectItem value="daughter">Daughter</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Address */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Address  <span className="text-red-500">*</span> </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="123 Main Street, City, State"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Aadhar Number */}
          <FormField
            control={form.control}
            name="aadharNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aadhar Number</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    maxLength={12}
                    placeholder="123456789012"
                    {...field}
                    inputMode="numeric"
                    pattern="\d*"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/\D/g, "").slice(0, 12);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Mobile Number */}
          <FormField
            control={form.control}
            name="mobileNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="9876543210"
                    {...field}
                    name="mobileNumber"
                    inputMode="numeric"
                    pattern="\d*"
                    onInput={(e) => {
                      const input = e.target as HTMLInputElement;
                      input.value = input.value.replace(/\D/g, "").slice(0, 10);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Buttons */}
          <div className="col-span-full flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/customers')}
              disabled={form.formState.isSubmitting} // disable back button while submitting
            >
              Back
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting
                ? customerId
                  ? 'Updating...'
                  : 'Adding...'
                : customerId
                  ? 'Update Customer'
                  : 'Add Customer'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
