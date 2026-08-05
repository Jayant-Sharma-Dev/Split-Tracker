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

export const getGroupMembers = async (groupId: number) => {
  const { data, error } = await supabase
  .from("group_members")
  .select(`
    user_id,
    profiles!group_members_user_id_fkey(
      id,
      name,
      email,
      avatar_url
    )
  `)
  .eq("group_id", groupId);

  console.log("RAW GROUP MEMBERS:", data);
return { data, error };
};