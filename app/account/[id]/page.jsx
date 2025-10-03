import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/accounts";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }) {
  const { id } = await params;
  let accountData = null;

  try {
    accountData = await getAccountWithTransactions(id);
  } catch (error) {
    console.error("Error loading account:", error);
    return (
      <div className="space-y-8 px-5">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-500 mb-2">
            Error loading account
          </h3>
          <p className="text-sm text-muted-foreground">
            There was an error loading this account. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className="text-xl sm:text-2xl font-bold">
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense fallback={<div className="h-1 w-full bg-purple-200 animate-pulse mt-4" />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <Suspense fallback={<div className="h-1 w-full bg-purple-200 animate-pulse mt-4" />}>
        <TransactionTable transactions={transactions} />
      </Suspense>
    </div>
  );
}
