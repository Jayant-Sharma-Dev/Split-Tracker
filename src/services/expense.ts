import { supabase } from "../lib/supabase";

interface ExpenseData {
  group_id: number;
  title: string;
  amount: number;
  paid_by: string;
  category: string;
  expense_date: string;
  notes: string;
}

export const createExpense = async (expense: ExpenseData) => {
  const { data, error } = await supabase
    .from("expenses")
    .insert(expense)
    .select()
    .single();

  return { data, error };
};