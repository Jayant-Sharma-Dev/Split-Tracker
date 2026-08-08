import { supabase } from "../lib/supabase";

export const addExpenseParticipants = async (
  expenseId: number,
  participantIds: string[]
) => {
  const rows = participantIds.map((userId) => ({
    expense_id: expenseId,
    user_id: userId,
  }));

  const { data, error } = await supabase
    .from("expense_participants")
    .insert(rows)
    .select();

  return { data, error };
};