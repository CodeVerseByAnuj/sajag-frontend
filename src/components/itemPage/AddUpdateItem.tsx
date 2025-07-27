'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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

// Services & Interfaces
import { addOrUpdateItem, getItemById } from '@/services/itemService'; // implement accordingly
import { AddItemInput, AddItemResponse } from '@/interface/itemImterface';

// Zod Schema
const itemSchema = z.object({
    itemId: z.string().optional(),
    customerId: z.string().min(1, 'Customer ID is required'),
    name: z.string().min(1, 'Item name is required'),
    itemWeight: z.string().min(1, 'Item weight is required'),
    category: z.enum(['gold', 'silver'], { required_error: 'Category is required' }),
    percentage: z.number().min(1, 'Percentage is required'),
    amount: z
        .string()
        .min(1, 'Amount is required')
        .transform((val) => Number(val))
        .refine((val) => !isNaN(val) && val > 0, {
            message: 'Must be a valid amount',
        }),
    description: z.string().optional(),
    orderId: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function AddOrUpdateItemForm() {
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');
    const customerId = searchParams.get('customerId') || '';

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            itemId: '',
            customerId: customerId,
            name: '',
            itemWeight: '',
            category: 'gold',
            percentage: 91.6,
            amount: 0,
            description: '',
            orderId: '',
        },
    });

    const getItem = async () => {
        if (!itemId) return;
        try {
            const res = await getItemById(itemId);
            //   if (res) {
            //     form.reset({
            //       itemId: res.itemId,
            //       customerId: res.customerId,
            //       name: res.name,
            //       itemWeight: res.itemWeight,
            //       category: res.category,
            //       percentage: res.percentage,
            //       amount: res.amount,
            //       description: res.description || '',
            //       orderId: res.orderId || '',
            //     });
            //   } else {
            //     toast.error('Item not found');
            //   }
        } catch (error: any) {
            toast.error('Failed to load item', { description: error.message });
        }
    };

    useEffect(() => {
        if (itemId) getItem();
    }, [itemId]);

    const onSubmit = async (data: ItemFormValues) => {
        try {
            const payload: AddItemInput = {
                ...data,
                itemId: itemId || '',
            };
            const response: AddItemResponse = await addOrUpdateItem(payload);

            if (response.success) {
                toast.success(response.message, {
                    description: `Item ID: ${response.data.itemId}`,
                });
                form.reset();
            }
        } catch (error: any) {
            toast.error('Failed to submit', { description: error.message });
        }
    };

    return (
        <Card className="p-6 max-w-3xl mx-auto shadow-lg">
            <h2 className="text-xl font-semibold mb-6 text-center">
                {itemId ? 'Update Item' : 'Add New Item'}
            </h2>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g. Gold 33 Necklace" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="itemWeight"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Item Weight (g)</FormLabel>
                                <FormControl>
                                    <Input type="text" placeholder="e.g. 15.2" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="gold">Gold</SelectItem>
                                        <SelectItem value="silver">Silver</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="percentage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Purity (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" step="0.1" placeholder="e.g. 91.6" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount (INR)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="e.g. 75000" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="col-span-full">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="e.g. 22K traditional necklace" {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="orderId"
                        render={({ field }) => (
                            <FormItem className="col-span-full">
                                <FormLabel>Order ID</FormLabel>
                                <FormControl>
                                    <Input placeholder="Leave blank to auto-create new order" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="col-span-full">
                        <Button type="submit" className="w-full">
                            {itemId ? 'Update Item' : 'Add Item'}
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}

export default AddOrUpdateItemForm;
