// customerColumns.tsx
"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Eye, PackagePlus } from "lucide-react";
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
import { customerInterface } from "@/interface/customerInterface";
import { deleteCustomer } from "@/services/customerService";

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

export const customerColumns = (refetch: () => void): ColumnDef<customerInterface>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="truncate" title={row.original.name}>
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "guardianName",
    header: "Guardian Name",
    cell: ({ row }) => (
      <div className="truncate" title={row.original.guardianName}>
        {row.original.guardianName}
      </div>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate" title={row.original.address}>
        {row.original.address}
      </div>
    ),
  },
  {
    accessorKey: "relation",
    header: "Relation",
    cell: ({ row }) => (
      <div className="truncate" title={row.original.relation}>
        {row.original.relation}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => <div className="text-muted-foreground text-sm">{formatDateShort(row.original.createdAt)}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    // Make actions a compact, centered cell
    cell: ({ row }) => {
      const handleDelete = async () => {
        try {
          await deleteCustomer(row.original.id);
          toast.success("Customer deleted successfully");
          refetch(); // ✅ Trigger refetch
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete customer");
        }
      };

      return (
        <div className="flex items-center justify-center gap-2">
          <Link href={`/dashboard/items?customerId=${row.original.id}`}>
            <Button className="cursor-pointer" variant="secondary" size="icon" title="Add Item">
              <PackagePlus className="h-4 w-4" />
            </Button>
          </Link>
          <Link href={`/dashboard/add-customer?customerId=${row.original.id}`}>
            <Button className="cursor-pointer" variant="outline" size="icon" title="View Customer">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="cursor-pointer" variant="destructive" size="icon" title="Delete Customer">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the customer from your database.
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
