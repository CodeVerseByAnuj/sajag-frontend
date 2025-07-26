'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ItemInterface } from '@/interface/itemImterface';

export const itemColumns: ColumnDef<ItemInterface>[] = [
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
];
