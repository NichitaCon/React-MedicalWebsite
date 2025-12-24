"use client";

import { TrendingUp } from "lucide-react";
import {
    CartesianGrid,
    Line,
    LineChart,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
} from "recharts";


export function ChartLineDefault({ appointments }) {
    // Helper functions
    // getLastNDates gets the last n days worth of appointments (e.g. n = 7)
    function getLastNDates(n) {
        const dates = [];
        for (let i = n - 1; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dates.push(d.toISOString().slice(0, 10));
        }
        return dates;
    }



    function buildAppointmentSeries(appointments) {
        const last14 = getLastNDates(14);
        const counts = {};

        for (const a of appointments) {
            const date = new Date(a.appointment_date * 1000)
                .toISOString()
                .slice(0, 10);

            if (last14.includes(date)) {
                counts[date] = (counts[date] || 0) + 1;
            }
        }

        return last14.map((date) => ({
            date,
            count: counts[date] || 0,
        }));
    }

    const chartData = buildAppointmentSeries(appointments || []);
    // console.log("chartData in chart", chartData);
    
    return (
        <div className="w-full h-full flex flex-col bg-card rounded-lg border p-4">
            <div className="mb-4">
                <h3 className="text-lg font-semibold">Past Appointments</h3>
                <p className="text-sm text-muted-foreground">
                    Over last 2 weeks
                </p>
            </div>

            <div className="flex-1 min-h-0 w-full pr-8">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                        />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                            tickFormatter={(value) => value.slice(5)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: "hsl(var(--popover))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "6px",
                            }}
                        />
                        <Line
                            dataKey="count"
                            type="linear"
                            stroke="#8884d8"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* <div className="mt-4 flex flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 leading-none font-medium">
                    Trending up by 5.2% this month{" "}
                    <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                    Showing total visitors for the last 6 months
                </div>
            </div> */}
        </div>
    );
}
