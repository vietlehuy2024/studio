"use client";

import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { OmoCashflowData } from '@/types';
import { generateChartDescription } from '@/ai/flows/generate-chart-description';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb, Bot } from 'lucide-react';

interface DataChartProps {
  data: OmoCashflowData[];
}

const chartableKeys: (keyof OmoCashflowData)[] = [
  'OMO',
  'T-Repo',
  'T-Bill',
  'OMO+T-Repo',
  'OMO+T-Repo+T-Bill',
  'OMO-CUM',
  'T-Repo-CUM',
  'T-Bill-CUM',
  'OMO+T-Repo-CUM',
  'OMO+T-Repo+T-Bill-CUM',
];

export function DataChart({ data }: DataChartProps) {
  const [selectedKey, setSelectedKey] = useState<keyof OmoCashflowData>('OMO');
  const [aiDescription, setAiDescription] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      value: item[selectedKey]
    })).reverse(); // Reverse for chronological order if data is descending by date
  }, [data, selectedKey]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setAiDescription('');
    try {
      const result = await generateChartDescription({
        data: JSON.stringify(chartData.slice(0, 50)), // Limit data points for performance
        chartType: `Line chart showing ${selectedKey} over time`,
      });
      setAiDescription(result.description);
    } catch (error) {
      console.error('Failed to generate chart description:', error);
      setAiDescription('Sorry, I was unable to generate a description for this chart.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Metric:</span>
          <Select value={selectedKey} onValueChange={(value) => setSelectedKey(value as keyof OmoCashflowData)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a metric" />
            </SelectTrigger>
            <SelectContent>
              {chartableKeys.map(key => (
                <SelectItem key={key} value={key}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleGenerateDescription} disabled={isGenerating || data.length === 0}>
          {isGenerating ? "Analyzing..." : "Generate AI Analysis"}
          <Bot className="ml-2 h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(str) => {
              const date = new Date(str);
              if (isNaN(date.getTime())) return str;
              return format(date, "MMM yy");
            }}/>
            <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickFormatter={(value) => typeof value === 'number' ? value.toLocaleString() : value}/>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                borderColor: 'hsl(var(--border))',
                color: 'hsl(var(--card-foreground))'
              }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Line type="monotone" dataKey="value" name={selectedKey} stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {isGenerating && (
        <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
      )}
      
      {aiDescription && (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>AI Analysis</AlertTitle>
          <AlertDescription>
            {aiDescription}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
