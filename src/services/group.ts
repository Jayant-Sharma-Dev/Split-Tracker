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
    console.log("createdBy:", createdBy);
  const { data, error } = await supabase!
    .from("groups")
    
    .insert({
      name,
      created_by: createdBy,
    })
    
    .select();
    console.log(data);
console.log(error);

  return { data, error };
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

