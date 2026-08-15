import { supabase } from "../lib/supabase";

export const addExpenseParticipants = async (
  expenseId: number,
  participants: {
    userId: string;
    shareAmount: number;
  }[]
) => {
  const rows = participants.map((participant) => ({
    expense_id: expenseId,
    user_id: participant.userId,
    share_amount: participant.shareAmount,
  }));

  const { data, error } = await supabase
    .from("expense_participants")
    .insert(rows)
    .select();

  return { data, error };
};

export const getExpenseParticipants = async (expenseId: number) => {
  const { data, error } = await supabase
    .from("expense_participants")
    .select("user_id, share_amount")
    .eq("expense_id", expenseId);

  return { data, error };
};