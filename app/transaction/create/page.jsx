"use client";

import { useState, useEffect } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transactions";

export default function AddTransactionPage({ searchParams }) {
  const [accounts, setAccounts] = useState([]);
  const [initialData, setInitialData] = useState(null);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load accounts
        const accountsData = await getUserAccounts().catch(() => []);
        setAccounts(accountsData || []);

        // Handle edit mode
        const { edit } = await searchParams;
        setEditId(edit);

        if (edit) {
          try {
            const transaction = await getTransaction(edit);
            setInitialData(transaction);
          } catch (error) {
            console.error("Error loading transaction for edit:", error);
            setInitialData(null);
          }
        }
      } catch (error) {
        console.error("Error loading transaction page:", error);
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  // Listen for account creation events to refresh accounts
  useEffect(() => {
    const handleAccountCreated = async () => {
      try {
        const accountsData = await getUserAccounts().catch(() => []);
        setAccounts(accountsData || []);
      } catch (error) {
        console.error("Error refreshing accounts:", error);
      }
    };

    window.addEventListener('accountCreated', handleAccountCreated);
    
    return () => {
      window.removeEventListener('accountCreated', handleAccountCreated);
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-5">
        <div className="flex justify-center md:justify-normal mb-8">
          <h1 className="text-5xl gradient-title ">Add Transaction</h1>
        </div>
        <div className="animate-pulse">
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
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