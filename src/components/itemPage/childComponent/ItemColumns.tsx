'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ItemInterface } from '@/interface/itemImterface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { deleteItem } from '@/services/itemService'; // ← make sure this exists
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

export const itemColumns = (refetch: () => void): ColumnDef<ItemInterface>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'percentage',
    header: 'Purity (%)',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
  {
    accessorKey: 'itemWeight',
    header: 'Weight (g)',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString();
    },
  },
  {
    id: 'actions',
    header: 'Actions',
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
        <div className="flex gap-2">
          <Link href={`/dashboard/add-item?itemId=${item.id}`}>
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
