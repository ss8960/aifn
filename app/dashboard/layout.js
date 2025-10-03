import DashboardPage from "./page";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function Layout() {
  return (
    <div className="px-5">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-6xl font-bold tracking-tight gradient-title">
          Dashboard
        </h1>
      </div>
      <Suspense fallback={<div className="h-1 w-full bg-purple-200 animate-pulse mt-4" />}>
        <DashboardPage />
      </Suspense>
    </div>
  );
}


