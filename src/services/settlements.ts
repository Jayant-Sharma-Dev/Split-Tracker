import { supabase } from "../lib/supabase";

export async function addSettlement(
  groupId: number,
  fromUser: string,
  toUser: string,
  amount: number
) {
  return await supabase
    .from("settlements")
    .insert({
      group_id: groupId,
      from_user: fromUser,
      to_user: toUser,
      amount,
      settled_at: new Date().toISOString(),
    });
}

export async function getSettlements(groupId: number) {
  return await supabase
    .from("settlements")
    .select("*")
    .eq("group_id", groupId)
    .order("settled_at", { ascending: false });
}