import { supabase } from "../lib/supabase";
export async function getGroups() {
  const { data, error } = await supabase!
    .from("groups")
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function createGroup(
  name: string,
  createdBy: string
) {
  const { data, error } = await supabase!
    .from("groups")
    .insert({
      name,
      created_by: createdBy,
    })
    .select();

  if (error || !data || data.length === 0) {
    return { data, error };
  }

  const newGroupId = data[0].id;

  const { error: memberError } = await supabase!
    .from("group_members")
    .insert({
      group_id: newGroupId,
      user_id: createdBy,
    });

  if (memberError) {
    return { data, error: memberError };
  }

  return { data, error: null };
}

export async function deleteGroup(id: number) {
  const { error } = await supabase!
    .from("groups")
    .delete()
    .eq("id", id);

  return { error };
}

export async function updateGroup(
  id: number,
  name: string
) {
  const { data, error } = await supabase!
    .from("groups")
    .update({
      name,
    })
    .eq("id", id)
    .select();

  return { data, error };
}

export async function getGroup(id: number) {
  const { data, error } = await supabase!
    .from("groups")
    .select("*")
    .eq("id", id)
    .single();

  return { data, error };
}

