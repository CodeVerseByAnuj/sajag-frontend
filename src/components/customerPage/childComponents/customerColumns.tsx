// customerColumns.tsx
"use client";

import Link from "next/link";

import { ColumnDef } from "@tanstack/react-table";
import { Trash2, Eye } from "lucide-react";
import { PackagePlus } from "lucide-react";
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
import { customerInterface } from "@/interface/customer-interface";
import { deleteCustomer } from "@/services/customer-service";

export const customerColumns = (refetch: () => void): ColumnDef<customerInterface>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "guardianName",
    header: "Guardian Name",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Created At {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
      </button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Updated At {column.getIsSorted() === "asc" ? "↑" : column.getIsSorted() === "desc" ? "↓" : ""}
      </button>
    ),
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
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
        <div className="flex gap-2">
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
