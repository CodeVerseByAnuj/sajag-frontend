'use client';

import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table';
import { useQuery } from '@tanstack/react-query';
import { getCustomers } from '@/services/customerService';
import { GetCustomerParams, GetCustomerResponse } from '@/interface/customerInterface';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { DataTable } from '../data-table/data-table';
import { DataTablePagination } from '../data-table/data-table-pagination';
import { DataTableViewOptions } from '../data-table/data-table-view-options';
import { customerColumns } from './childComponents/customerColumns';
import Link from 'next/link';

export default function GetCustomers() {
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [filters, setFilters] = useState({
    name: '',
    guardianName: '',
    address: '',
  });
  const [sorting, setSorting] = useState<{
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }>({
    sortBy: 'createdAt',
    sortOrder: 'asc',
  });

  const queryParams: GetCustomerParams = {
    ...pagination,
    ...filters,
    ...sorting,
  };

  const { data, isLoading, refetch } = useQuery<GetCustomerResponse>({
    queryKey: ['customers', queryParams],
    queryFn: () => getCustomers(queryParams),
  });

  const customers = data?.data?.customers || [];
  const total = data?.data?.total || 0;
  const limit = data?.data?.limit || 0;
  const totalPages = Math.ceil(total / limit);

  const table = useReactTable({
    data: customers,
    columns: customerColumns(refetch),
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
        ? updater({
          pageIndex: pagination.page - 1,
          pageSize: pagination.limit,
        })
        : updater;

      setPagination({
        page: next.pageIndex + 1, // convert back to 1-based
        limit: next.pageSize,
      });
    },

    onSortingChange: (updater) => {
      const nextSorting =
        typeof updater === 'function'
          ? updater([]) // or use table.getState().sorting if you want current state
          : updater;

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
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <section className='flex justify-between'>
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage and search your registered customers.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/add-customer">Add Customer</Link>
            </Button>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              name="name"
              placeholder="Search by Name"
              value={filters.name}
              onChange={handleInputChange}
            />
            <Input
              name="guardianName"
              placeholder="Search by Guardian Name"
              value={filters.guardianName}
              onChange={handleInputChange}
            />
            <Input
              name="address"
              placeholder="Search by Address"
              value={filters.address}
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
            <DataTable table={table} columns={customerColumns(refetch)} />
          </div>
          <DataTablePagination table={table} />
        </CardContent>
      </Card>
    </div>
  );
}
