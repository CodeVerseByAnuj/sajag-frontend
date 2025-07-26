'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Interfaces & Services
import { AddCustomerResponseInterface } from '@/interface/customerInterface';
import { addOrUpdateCustomer, getCustomerById } from '@/services/customerService';

// UI Components
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

// Zod Schema
const customerDataSchema = z.object({
  customerId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  guardianName: z.string().min(1, 'Guardian name is required'),
  relation: z.enum(['father', 'mother', 'wife', 'husband', 'son', 'daughter', 'other']),
  address: z.string().min(1, 'Address is required'),
  aadharNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: 'Aadhar number must be 12 digits',
    }),
  mobileNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Enter a valid 10-digit mobile number',
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
      customerId: customerId || '',
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
      const customerInput = {
        customerId: data.customerId ?? '',
        name: data.name,
        guardianName: data.guardianName,
        relation: data.relation,
        address: data.address,
        aadharNumber: data.aadharNumber,
        mobileNumber: data.mobileNumber,
      };

      const response: AddCustomerResponseInterface = await addOrUpdateCustomer(customerInput);

      if (response.success) {
          getCustomer();
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
        const values: CustomerFormValues = {
          customerId: customerId || '',
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

  useEffect(() => {
    if (customerId) getCustomer();
  }, [customerId, form]);

  return (
  <Card className="p-6 max-w-3xl mx-auto shadow-lg">
    <h2 className="text-xl font-semibold mb-6 text-center">
      {customerId ? 'Update Customer' : 'Add New Customer'}
    </h2>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Full Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Full Name</FormLabel>
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
              <FormLabel>Guardian Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter guardian name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Relation */}
        <FormField
          control={form.control}
          name="relation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Relation</FormLabel>
              <FormControl className="w-full">
                <Select  onValueChange={field.onChange} defaultValue={field.value}>
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

        {/* Address - Full width */}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="col-span-full">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Textarea placeholder="123 Main Street, City, State" rows={3} {...field} />
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
                <Input type="text" maxLength={12} placeholder="123456789012" {...field} />
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
                <Input type="tel" maxLength={10} placeholder="9876543210" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button - Full width */}
        <div className="col-span-full">
          <Button type="submit" className="w-full">
            {customerId ? 'Update Customer' : 'Add Customer'}
          </Button>
        </div>
      </form>
    </Form>
  </Card>


  );
}
