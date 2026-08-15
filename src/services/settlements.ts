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
    });
}

export async function getSettlements(groupId: number) {
  return await supabase
    .from("settlements")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at", { ascending: false });
}