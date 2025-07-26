'use client';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { AddCustomerResponseInterface } from '@/interface/customerInterface';
import { addOrUpdateCustomer, getCustomerById } from '@/services/customerService';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchParams } from 'next/navigation';

// ✅ Use updated schema
const customerDataSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  relation: z.enum(["father", "mother", "wife", "husband", "son", "daughter", "other"]),
  address: z.string().min(1, "Address is required"),
  aadharNumber: z
    .string()
    .optional()
    .refine(val => !val || /^\d{12}$/.test(val), {
      message: "Aadhar number must be 12 digits",
    }),
  mobileNumber: z
    .string()
    .optional()
    .refine(val => !val || /^[6-9]\d{9}$/.test(val), {
      message: "Enter a valid 10-digit mobile number",
    }),
});

type CustomerFormValues = z.infer<typeof customerDataSchema>;

type AddCustomersFormProps = {
  defaultValues?: Partial<CustomerFormValues>;
  onSubmit?: (data: CustomerFormValues) => void;
};

export function AddCustomersForm({ defaultValues, onSubmit }: AddCustomersFormProps) {
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerDataSchema),
    defaultValues: defaultValues || {
      customerId: '',
      name: '',
      guardianName: '',
      relation: 'father',
      address: '',
      aadharNumber: '',
      mobileNumber: '',
    },
  });

  const handleSubmit = async (data: CustomerFormValues) => {
    try {
      // Map customerId to id for CustomerInputInterface
      const customerInput = {
        id: data.customerId ?? '', // Provide empty string if undefined
        name: data.name,
        guardianName: data.guardianName,
        relation: data.relation,
        address: data.address,
        aadharNumber: data.aadharNumber,
        mobileNumber: data.mobileNumber,
      };
      const response: AddCustomerResponseInterface = await addOrUpdateCustomer(customerInput);
      if (response.success) {
        setTimeout(() => {
          getCustomer();
        }, 300); // Delay 300ms before fetching updated data

        toast.success(response.message, {
          description: `Customer ID: ${response.data.customerId}`,
        });
        form.reset();
      }
    } catch (error: any) {
      toast.error('Submission Failed', {
        description: error.message,
      });
    }
  };

  const getCustomer = async () => {
    if (!customerId) return;

    try {
      const res = await getCustomerById(customerId);
      if (res) {
        const values = {
          customerId: res?.id,
          name: res.name || '',
          guardianName: res.guardianName || '',
          relation: (res.relation as CustomerFormValues['relation']) || 'father',
          address: res.address || '',
          aadharNumber: res.aadharNumber || '',
          mobileNumber: res.mobileNumber || '',
        };
        form.reset(values);
        console.log('🚀 Form values after reset:', values);
      } else {
        toast.error('Customer not found');
      }
    } catch (error: any) {
      toast.error('Failed to load customer', {
        description: error.message,
      });
    }
  };

  // 🔽 Fetch & populate on mount if customerId exists
  useEffect(() => {
    if (customerId) {
      getCustomer()
    }
  }, [customerId, form]);


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 max-w-2xl mx-auto">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Full Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="guardianName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Guardian Name</FormLabel>
              <FormControl>
                <Input placeholder="Guardian Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="relation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relation</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relation" />
                  </SelectTrigger>
                  <SelectContent>
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

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main Street, Delhi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="aadharNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aadhar Number</FormLabel>
              <FormControl>
                <Input type="text" maxLength={12} placeholder="123456789012" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mobileNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mobile Number</FormLabel>
              <FormControl>
                <Input type="tel" maxLength={10} placeholder="7080708035" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {defaultValues ? 'Update Customer' : 'Add Customer'}
        </Button>
      </form>
    </Form>
  );
}
