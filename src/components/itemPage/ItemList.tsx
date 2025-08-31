"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table";
import { Download, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GetItemResponse, GetItemParams } from "@/interface/item-imterface";
import { getItems } from "@/services/item-service";

import { DataTable } from "../data-table/data-table";
import { DataTablePagination } from "../data-table/data-table-pagination";
import { DataTableViewOptions } from "../data-table/data-table-view-options";

import { itemColumns } from "./childComponent/ItemColumns";

export default function GetItems() {
  const searchParams = useSearchParams();
  const customerId = searchParams.get("customerId") || "";
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [filters, setFilters] = useState({ name: "", category: "" });
  const [sorting, setSorting] = useState<{ sortBy: string; sortOrder: "asc" | "desc" }>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const queryParams: GetItemParams = {
    customerId,
    ...pagination,
    ...filters,
    ...sorting,
  };

  const { data, isLoading, refetch } = useQuery<GetItemResponse>({
    queryKey: ["items", queryParams],
    queryFn: () => getItems(queryParams),
  });

  const items = data?.data ?? [];
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 5;
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
          desc: sorting.sortOrder === "desc",
        },
      ],
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex: pagination.page - 1, pageSize: pagination.limit })
          : updater;

      setPagination({ page: next.pageIndex + 1, limit: next.pageSize });
    },
    onSortingChange: (updater) => {
      const nextSorting = typeof updater === "function" ? updater([]) : updater;
      if (nextSorting.length > 0) {
        setSorting({
          sortBy: nextSorting[0].id,
          sortOrder: nextSorting[0].desc ? "desc" : "asc",
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

  console.log("Items:", items);

  return (
    <div>
      <Card>
        <CardHeader>
          <section className="flex justify-between">
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

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input name="name" placeholder="Search by Item Name" value={filters.name} onChange={handleInputChange} />
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
              <Download className="mr-2 h-4 w-4" />
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
    </div>
  );
}
