"use client";

import { useState, useEffect } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { GetCustomerParams, GetCustomerResponse } from "@/interface/customerInterface";
import { getCustomers } from "@/services/customerService";

import { DataTable } from "../data-table/data-table";
import { DataTablePagination } from "../data-table/data-table-pagination";
import { DataTableViewOptions } from "../data-table/data-table-view-options";

import { customerColumns } from "./childComponents/customerColumns";

// eslint-disable-next-line complexity
export default function GetCustomers() {
  const [pagination, setPagination] = useState({ page: 1, limit: 5 });
  const [filters, setFilters] = useState({
    name: "",
    guardianName: "",
    address: "",
  });
  const [sorting, setSorting] = useState<{
    sortBy: string;
    sortOrder: "asc" | "desc";
  }>({
    sortBy: "createdAt",
    sortOrder: "desc", // default to descending
  });

  const queryParams: GetCustomerParams = {
    ...pagination,
    ...filters,
    ...sorting,
  };

  const { data, isLoading, refetch } = useQuery<GetCustomerResponse>({
    queryKey: ["customers", queryParams],
    queryFn: () => getCustomers(queryParams),
  });

  const customers = data?.data?.customers ?? [];
  const total = data?.data?.total ?? 0;
  const limit = data?.data?.limit ?? 0;
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
          desc: sorting.sortOrder === "desc",
        },
      ],
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
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
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableData = customers.map((customer, index) => [
      index + 1,
      customer.name,
      customer.guardianName,
      customer.address,
      customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "",
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Guardian Name", "Address", "Created At"]],
      body: tableData,
    });

    doc.save("customers.pdf");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
          <p className="text-gray-600">Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <section className="flex justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage and search your registered customers.</CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/add-customer">Add Customer</Link>
            </Button>
          </section>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input name="name" placeholder="Search by Name" value={filters.name} onChange={handleInputChange} />
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
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <Download className="mr-2 h-4 w-4" />
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
