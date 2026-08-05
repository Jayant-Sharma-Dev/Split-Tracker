import { supabase } from "../lib/supabase";
export const getProfiles = async () => {
 const { data, error } = await supabase
  .from("profiles")
  .select("id, name, email");
  return { data, error };
};