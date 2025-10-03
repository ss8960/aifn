import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { AccountCard } from "@/app/dashboard/_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  try {
    const accounts = await getUserAccounts();

    return (
      <div className="space-y-8 px-5">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title">
            Accounts
          </h1>
        </div>

        {/* Accounts Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
          {accounts && accounts.length > 0 &&
            accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>

        {(!accounts || accounts.length === 0) && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No accounts found
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first account to start tracking your finances.
            </p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error loading accounts:", error);
    return (
      <div className="space-y-8 px-5">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title">
            Accounts
          </h1>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-500 mb-2">
            Error loading accounts
          </h3>
          <p className="text-sm text-muted-foreground">
            There was an error loading your accounts. Please try again later.
          </p>
        </div>
      </div>
    );
  }
}
