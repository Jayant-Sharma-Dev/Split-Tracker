import { useEffect, useState } from "react";
import { getGroups } from "../services/group";
import { createGroup } from "../services/group";
import { useAuth } from "../components/context/AuthContext";

type Group = {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
};

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    const { data, error } = await getGroups();

    if (error) {
      console.log(error);
    } else {
      setGroups((data as Group[]) ?? []);
    }
  }
 const { user } = useAuth();
 const handleCreate = async () => {
  if (!user) return;

  console.log("User ID:", user.id);
console.log("User:", user);
  const { error } = await createGroup(
    "Trip Goa",
    user.id
  );

  if (error) {
    console.log(error.message);
    return;
  }

  loadGroups();
};
console.log(groups)
  return (
    <div>
       <button onClick={handleCreate}>
Create Group
</button>
    </div>
  );
};

export default Dashboard