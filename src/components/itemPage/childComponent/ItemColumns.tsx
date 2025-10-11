// itemColumns.tsx
'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ItemInterface } from '@/interface/itemImterface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { deleteItem } from '@/services/itemService';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

// Format ISO date to `10oct2025` (day + short month lowercase + year)
const formatDateShort = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();
  return `${day}${month}${year}`;
};

export const itemColumns = (
  refetch: () => void,
  customerId: string
): ColumnDef<ItemInterface>[] => [
  {
    accessorKey: 'name',
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => <div className="text-left truncate" title={row.original.name}>{row.original.name}</div>,
  },
  {
    accessorKey: 'category',
    header: () => <div className="text-left">Category</div>,
    cell: ({ row }) => <div className="text-left truncate" title={row.original.category}>{row.original.category}</div>,
  },
  {
    accessorKey: 'percentage',
    header: () => <div className="text-right">Percentage (%)</div>,
  cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? '')}</div>,
  },
  {
    accessorKey: 'amount',
    header: () => <div className="text-right">Amount</div>,
  cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? '')}</div>,
  },
  {
    accessorKey: 'itemWeight',
    header: () => <div className="text-right">Weight (g)</div>,
  cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? '')}</div>,
  },
  {
    accessorKey: 'createdAt',
    header: () => <div className="text-center">Date</div>,
    cell: ({ getValue }) => (
      <div className="text-center text-sm text-muted-foreground">{formatDateShort(getValue() as string)}</div>
    ),
  },
  {
    id: 'actions',
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      const handleDelete = async () => {
        try {
          await deleteItem(item.id);
          toast.success('Item deleted successfully');
          refetch();
        } catch (error) {
          console.error(error);
          toast.error('Failed to delete item');
        }
      };

      return (
        <div className="flex gap-2 items-center justify-center">
          <Link href={`/dashboard/calculate?customerId=${customerId}&itemId=${item.id}`}>
            <Button className="cursor-pointer" variant="outline" size="icon" title="Payment">
              <CreditCard className="w-4 h-4" />
            </Button>
          </Link>

          <Link href={`/dashboard/add-item?customerId=${customerId}&itemId=${item.id}`}>
            <Button className="cursor-pointer" variant="outline" size="icon" title="View Item">
              <Eye className="w-4 h-4" />
            </Button>
          </Link>

          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="cursor-pointer" variant="destructive" size="icon" title="Delete Item">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the item from your database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
];
