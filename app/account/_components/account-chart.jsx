"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

export function AccountChart({ transactions }) {
  const [timeRange, setTimeRange] = useState("30");

  const { filteredData, totals } = useMemo(() => {
    const now = new Date();
    const days = parseInt(timeRange);
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const filtered = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return transactionDate >= startDate;
    });

    // Group by date and calculate daily totals
    const dailyData = {};
    filtered.forEach((transaction) => {
      const date = new Date(transaction.date).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, income: 0, expenses: 0 };
      }
      if (transaction.type === "INCOME") {
        dailyData[date].income += transaction.amount;
      } else {
        dailyData[date].expenses += transaction.amount;
      }
    });

    const chartData = Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));

    const totals = filtered.reduce(
      (acc, transaction) => {
        if (transaction.type === "INCOME") {
          acc.income += transaction.amount;
        } else {
          acc.expenses += transaction.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0 }
    );

    return { filteredData: chartData, totals };
  }, [transactions, timeRange]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-base font-normal">Account Activity</CardTitle>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2" />
            <span className="text-sm text-muted-foreground">Income: ${totals.income.toFixed(2)}</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2" />
            <span className="text-sm text-muted-foreground">Expenses: ${totals.expenses.toFixed(2)}</span>
          </div>
        </div>
        <div className="h-[300px]">
          {filteredData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data for selected range.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  formatter={(value, name) => [`$${value.toFixed(2)}`, name === "income" ? "Income" : "Expenses"]}
                />
                <Bar dataKey="income" fill="#22c55e" name="income" />
                <Bar dataKey="expenses" fill="#ef4444" name="expenses" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
