"use client";

import type { OmoCashflowData } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area"

type SortDirection = 'ascending' | 'descending';
type SortConfig = { key: keyof OmoCashflowData | null; direction: SortDirection };

interface DataTableProps {
  data: OmoCashflowData[];
  sortConfig: SortConfig;
  onSort: (key: keyof OmoCashflowData) => void;
}

export function DataTable({ data, sortConfig, onSort }: DataTableProps) {
  if (!data || data.length === 0) {
    return <div className="text-center text-muted-foreground p-8">No data to display.</div>;
  }

  const headers = Object.keys(data[0]) as (keyof OmoCashflowData)[];
  
  const formatValue = (value: any) => {
    if (typeof value === 'number') {
        return value.toLocaleString();
    }
    return String(value);
  }

  const renderSortArrow = (key: keyof OmoCashflowData) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'ascending' ? <ArrowUp className="inline-block ml-2 h-4 w-4" /> : <ArrowDown className="inline-block ml-2 h-4 w-4" />;
  };

  return (
    <ScrollArea className="h-[600px] w-full rounded-md border">
        <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
            {headers.map((key) => (
                <TableHead key={key} onClick={() => onSort(key)} className="cursor-pointer hover:bg-muted/50">
                {key}
                {renderSortArrow(key)}
                </TableHead>
            ))}
            </TableRow>
        </TableHeader>
        <TableBody>
            {data.map((row, index) => (
            <TableRow key={index}>
                {headers.map((key) => (
                <TableCell key={key} className="font-mono text-sm">
                    {formatValue(row[key])}
                </TableCell>
                ))}
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </ScrollArea>
  );
}
