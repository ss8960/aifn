import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transactions";

export const dynamic = "force-dynamic";

export default async function AddTransactionPage({ searchParams }) {
  let accounts = [];
  let initialData = null;
  let editId = null;

  try {
    accounts = await getUserAccounts().catch(() => []);
    const { edit } = await searchParams;
    editId = edit;

    if (editId) {
      try {
        const transaction = await getTransaction(editId);
        initialData = transaction;
      } catch (error) {
        console.error("Error loading transaction for edit:", error);
        // Continue without initial data
      }
    }
  } catch (error) {
    console.error("Error loading transaction page:", error);
    // Fallback to empty data
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
}