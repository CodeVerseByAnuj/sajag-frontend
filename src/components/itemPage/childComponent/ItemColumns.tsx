// itemColumns.tsx
"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Eye, CreditCard } from "lucide-react";
import { toast } from "sonner";

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
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ItemInterface } from "@/interface/itemImterface";
import { deleteItem } from "@/services/itemService";

// Format ISO date to `10oct2025` (day + short month lowercase + year)
const formatDateShort = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.toLocaleString("en-US", { month: "short" }).toLowerCase();
  const year = d.getFullYear();
  return `${day}${month}${year}`;
};

export const itemColumns = (refetch: () => void, customerId: string): ColumnDef<ItemInterface>[] => [
  {
    accessorKey: "name",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => (
      <div className="truncate text-left" title={row.original.name}>
        {row.original.name}
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: () => <div className="text-left">Category</div>,
    cell: ({ row }) => (
      <div className="truncate text-left" title={row.original.category}>
        {row.original.category}
      </div>
    ),
  },
  {
    accessorKey: "percentage",
    header: () => <div className="text-right">Percentage (%)</div>,
    cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? "")}</div>,
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? "")}</div>,
  },
  {
    accessorKey: "itemWeight",
    header: () => <div className="text-right">Weight (g)</div>,
    cell: ({ getValue }) => <div className="text-right">{String(getValue() ?? "")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-center">Date</div>,
    cell: ({ getValue }) => (
      <div className="text-muted-foreground text-center text-sm">{formatDateShort(getValue() as string)}</div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => {
      const item = row.original;

      const handleDelete = async () => {
        try {
          await deleteItem(item.id);
          toast.success("Item deleted successfully");
          refetch();
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete item");
        }
      };

      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/dashboard/calculate?customerId=${customerId}&itemId=${item.id}`}>
            <Button className="cursor-pointer" variant="outline" size="icon" title="Payment">
              <CreditCard className="h-4 w-4" />
            </Button>
          </Link>

          <Link href={`/dashboard/add-item?customerId=${customerId}&itemId=${item.id}`}>
            <Button className="cursor-pointer" variant="outline" size="icon" title="View Item">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="cursor-pointer" variant="destructive" size="icon" title="Delete Item">
                <Trash2 className="h-4 w-4" />
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
