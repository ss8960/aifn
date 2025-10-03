import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transactions";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  try {
    const accounts = await getUserAccounts();
    const { edit } = await searchParams;
    const editId = edit;

    let initialData = null;
    if (editId) {
      try {
        const transaction = await getTransaction(editId);
        initialData = transaction;
      } catch (error) {
        console.error("Error loading transaction for edit:", error);
        // Continue without initial data
      }
    }

    return (
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title ">Add Transaction</h1>
        </div>
        <AddTransactionForm
          accounts={accounts || []}
          categories={defaultCategories || []}
          editMode={!!editId}
          initialData={initialData}
        />
      </div>
    );
  } catch (error) {
    console.error("Error loading transaction page:", error);
    return (
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title ">Add Transaction</h1>
        </div>
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-500 mb-2">
            Error loading page
          </h3>
          <p className="text-sm text-muted-foreground">
            {error.message}
          </p>
        </div>
      </div>
    );
  }
}