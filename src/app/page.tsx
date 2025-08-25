"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import type { OmoCashflowData } from "@/types";
import { DataTable } from "@/components/data-table";
import { DataChart } from "@/components/data-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Search, LineChart, AlertCircle, FileJson } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SortDirection = "ascending" | "descending";
type SortConfig = { key: keyof OmoCashflowData | null; direction: SortDirection };
type Filters = {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  query: string;
};

export default function DataViewerPage() {
  const [url, setUrl] = useState("https://report-flame.vercel.app/test.json");
  const [data, setData] = useState<OmoCashflowData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: "date", direction: "descending" });
  const [filters, setFilters] = useState<Filters>({ dateFrom: undefined, dateTo: undefined, query: "" });
  const [activeFilters, setActiveFilters] = useState<Filters>(filters);

  const { toast } = useToast();

  const fetchData = useCallback(async (fetchUrl: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      // Assuming the data is an array of objects
      if (Array.isArray(jsonData)) {
        setData(jsonData);
      } else {
        // Handle cases where data is nested, e.g. { "data": [...] }
        const dataKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
        if(dataKey) {
            setData(jsonData[dataKey]);
        } else {
            throw new Error("No array found in JSON data");
        }
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Failed to fetch data",
        description: errorMessage,
      });
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData(url);
  }, [fetchData, url]);

  const handleSort = (key: keyof OmoCashflowData) => {
    let direction: SortDirection = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };
  
  const handleApplyFilters = () => {
    setActiveFilters(filters);
  };

  const filteredAndSortedData = useMemo(() => {
    let processData = [...data];

    // Filtering logic
    if (activeFilters.dateFrom || activeFilters.dateTo || activeFilters.query) {
      processData = processData.filter((item) => {
        const itemDate = new Date(item.date);
        if (activeFilters.dateFrom && itemDate < activeFilters.dateFrom) return false;
        if (activeFilters.dateTo && itemDate > activeFilters.dateTo) return false;
        if (activeFilters.query) {
          const lowerCaseQuery = activeFilters.query.toLowerCase();
          return Object.values(item).some(val =>
            String(val).toLowerCase().includes(lowerCaseQuery)
          );
        }
        return true;
      });
    }

    // Sorting logic
    if (sortConfig.key) {
      processData.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return processData;
  }, [data, activeFilters, sortConfig]);

  return (
    <div className="bg-background min-h-screen font-body">
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary font-headline sm:text-5xl">JSON Data Viewer</h1>
          <p className="mt-3 text-lg text-muted-foreground sm:mt-4">
            Fetch, view, and analyze time-series JSON data with ease.
          </p>
        </header>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><FileJson className="text-primary"/>Data Source</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 items-end">
                <div className="flex-grow">
                  <Label htmlFor="data-url">JSON Data URL</Label>
                  <Input id="data-url" type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
                </div>
                <Button onClick={() => fetchData(url)} disabled={isLoading}>
                  {isLoading ? "Fetching..." : "Fetch Data"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Search className="text-primary"/>Advanced Search</CardTitle>
              <CardDescription>Filter data by date range and a global search query. Click 'Apply Filters' to see results.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date From</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? format(filters.dateFrom, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={filters.dateFrom} onSelect={(date) => setFilters(f => ({...f, dateFrom: date}))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date To</Label>
                   <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? format(filters.dateTo, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={filters.dateTo} onSelect={(date) => setFilters(f => ({...f, dateTo: date}))} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="query">Search Query</Label>
                  <Input id="query" placeholder="Search all fields..." value={filters.query} onChange={(e) => setFilters(f => ({...f, query: e.target.value}))}/>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
              </div>
            </CardContent>
          </Card>

          {error && (
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Data Table</CardTitle>
              <CardDescription>Showing {filteredAndSortedData.length} of {data.length} records. Click on column headers to sort.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <DataTable data={filteredAndSortedData} sortConfig={sortConfig} onSort={handleSort} />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><LineChart className="text-primary"/>Chart Generation</CardTitle>
              <CardDescription>Visualize your data and get AI-powered insights.</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="w-full h-96 flex items-center justify-center">
                  <Skeleton className="h-full w-full" />
                </div>
              ) : data.length > 0 ? (
                <DataChart data={filteredAndSortedData} />
              ) : (
                <div className="w-full h-96 flex items-center justify-center text-muted-foreground bg-muted/50 rounded-lg">
                  <p>No data available to display chart.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
