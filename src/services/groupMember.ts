import { supabase } from "../lib/supabase";

export const addMember = async (groupId: number, userId: string) => {
  const { data, error } = await supabase
    .from("group_members")
    .insert({
      group_id: groupId,
      user_id: userId,
    });

  return { data, error };
};