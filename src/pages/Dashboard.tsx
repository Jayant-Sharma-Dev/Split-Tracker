import { useEffect, useState } from "react";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../services/group";
import { useAuth } from "../components/context/AuthContext";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

type Group = {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
};

const Dashboard = () => {
  const navigate = useNavigate();
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
 

const handleDelete = async (id: number) => {
  const { error } = await deleteGroup(id);

  if (error) {
    console.log(error.message);
    return;
  }

  loadGroups();
};

const handleUpdate = async (id: number) => {
  const { error } = await updateGroup(
    id,
    "Updated Goa Trip"
  );

  if (error) {
    console.log(error.message);
    return;
  }

  loadGroups();
};

return (
  <div>
    <button onClick={handleCreate}>
      Create Group
    </button>
    <hr />

    {groups.map((group) => (
      <div key={group.id}>
      <Link to={`/group/${group.id}`}>
  {group.name}
</Link>

        <button onClick={() => handleUpdate(group.id)}>
          Rename
        </button>

        <button onClick={() => handleDelete(group.id)}>
          Delete
        </button>
      </div>
    ))}
  </div>
);
};

export default Dashboard