'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

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
import { useRouter } from 'next/navigation';

import { addOrUpdateItem, getItemById } from '@/services/itemService';
import { AddItemInput, AddItemResponse } from '@/interface/itemImterface';

const itemSchema = z.object({
    itemId: z.string().optional(),
    customerId: z.string().min(1, 'Customer ID is required'),
    name: z.string().min(1, 'Item name is required'),
    itemWeight: z.string().min(1, 'Item weight is required'),
    category: z.enum(['gold', 'silver'], { required_error: 'Category is required' }),
    percentage: z
        .number({ invalid_type_error: 'Purity must be a number' })
        .min(0.1, 'Must be greater than 0'),
    amount: z
        .number({ invalid_type_error: 'Amount must be a number' })
        .min(1, 'Must be greater than 0'),
    description: z.string().optional(),
    orderId: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function AddOrUpdateItemForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const itemId = searchParams.get('itemId');
    const customerId = searchParams.get('customerId') || '';

    const form = useForm<ItemFormValues>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            itemId: itemId || '',
            customerId: customerId,
            name: '',
            itemWeight: '',
            category: 'gold',
            percentage: 2,
            amount: 0,
            description: '',
            orderId: '',
        },
    });

    const getItem = async () => {
        if (!itemId) return;
        try {
            const res = await getItemById(itemId);
            if (res) {
                form.reset({
                    itemId: itemId || '',
                    customerId: customerId || '',
                    name: res.name || '',
                    itemWeight: res.itemWeight || '',
                    category: res.category === 'gold' || res.category === 'silver' ? res.category : 'gold',
                    percentage: Number(res.percentage) || 0,
                    amount: Number(res.amount) || 0,
                    description: res.description || '',
                });
            } else {
                toast.error('Item not found');
            }
        } catch (error: any) {
            toast.error('Failed to load item', { description: error.message });
        }
    };

    useEffect(() => {
        getItem();
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
                router.push(`/dashboard/items?customerId=${customerId}`);
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
                                <FormLabel>Item Name <span className="text-red-500">*</span></FormLabel>
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
                                <FormLabel>Item Weight (g) <span className="text-red-500">*</span></FormLabel>
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
                                <FormLabel>Category <span className="text-red-500">*</span></FormLabel>
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
                                <FormLabel>Percentage (%) <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min={0.1}
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
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
                                <FormLabel>Amount <span className="text-red-500">*</span></FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={field.value}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
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

                    {/* <FormField
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
                    /> */}

                    <div className="col-span-full flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/items?customerId=${customerId}`)}>
                            Back
                        </Button>
                        <Button type="submit" >
                            {itemId ? 'Update Item' : 'Add Item'}
                        </Button>
                    </div>
                </form>
            </Form>
        </Card>
    );
}

export default AddOrUpdateItemForm;
