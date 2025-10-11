'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Download, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { getItems } from '@/services/itemService';
import { GetItemResponse, GetItemParams } from '@/interface/itemImterface';
import { itemColumns } from './childComponent/ItemColumns';
import { DataTable } from '../data-table/data-table';
import { DataTablePagination } from '../data-table/data-table-pagination';
import { DataTableViewOptions } from '../data-table/data-table-view-options';
import { useSearchParams } from 'next/navigation';

export default function GetItems() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId') || '';
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [filters, setFilters] = useState({ name: '', category: '' });
  const [sorting, setSorting] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const queryParams: GetItemParams = {
    customerId,
    ...pagination,
    ...filters,
    ...sorting,
  };

  const { data, isLoading, refetch } = useQuery<GetItemResponse>({
    queryKey: ['items', queryParams],
    queryFn: () => getItems(queryParams),
  });

  const items = data?.data || [];
  const total = data?.total || 0;
  const limit = data?.limit || 5;
  const totalPages = Math.ceil(total / limit);

  const table = useReactTable({
    data: items,
    columns: itemColumns(refetch, customerId),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: totalPages,
    manualSorting: true,
    state: {
      pagination: {
        pageIndex: pagination.page - 1,
        pageSize: pagination.limit,
      },
      sorting: [
        {
          id: sorting.sortBy,
          desc: sorting.sortOrder === 'desc',
        },
      ],
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function'
        ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
        : updater;

      setPagination({ page: next.pageIndex + 1, limit: next.pageSize });
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === 'function' ? updater([]) : updater;
      if (nextSorting.length > 0) {
        setSorting({
          sortBy: nextSorting[0].id,
          sortOrder: nextSorting[0].desc ? 'desc' : 'asc',
        });
      }
    },
  });

  useEffect(() => {
    refetch();
  }, [pagination, filters, sorting, refetch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  console.log('Items:', items);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <section className='flex justify-between'>
            <div>
              <CardTitle>Items</CardTitle>
              <CardDescription>Manage and search your inventory items.</CardDescription>
            </div>
            <Button asChild>
              <Link href={`/dashboard/add-item?customerId=${customerId}`}>
                <Plus className="h-4 w-4" />
                Add Item
              </Link>
            </Button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Input
              name="name"
              placeholder="Search by Item Name"
              value={filters.name}
              onChange={handleInputChange}
            />
            <Input
              name="category"
              placeholder="Search by Category"
              value={filters.category}
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-4 flex items-center gap-2">
            <DataTableViewOptions table={table} />
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden lg:inline">Export</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-md border">
            <DataTable table={table} columns={itemColumns(refetch, customerId)} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
      <div className="mt-4 flex justify-end">
        <Button onClick={() => router.back()}>Back</Button>
      </div>
    </div>
  );
}
