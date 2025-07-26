'use client';

import { ColumnDef } from '@tanstack/react-table';
import { customerInterface } from '@/interface/customerInterface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const customerColumns: ColumnDef<customerInterface>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'guardianName',
    header: 'Guardian Name',
  },
  {
    accessorKey: 'address',
    header: 'Address',
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Created At {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : ''}
      </button>
    ),
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => (
      <button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
        Updated At {column.getIsSorted() === 'asc' ? '↑' : column.getIsSorted() === 'desc' ? '↓' : ''}
      </button>
    ),
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <Link href={`/dashboard/add-customer?customerId=${row.original.id}`}>
        <Button variant="outline" size="sm">
          View Details
        </Button>
      </Link>
    ),
  }
];
