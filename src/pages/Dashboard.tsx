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
  <div className="max-w-3xl mx-auto px-6 py-8">
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Your Groups
      </h1>

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
      >
        + Create Group
      </button>
    </div>

    <div className="space-y-4">
      {groups.length === 0 ? (
        <p className="text-center text-gray-500 py-10">
          No groups yet. Create your first group!
        </p>
      ) : (
        groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm hover:shadow-md transition"
          >
            <Link
              to={`/group/${group.id}`}
              className="text-lg font-medium text-gray-800 hover:text-blue-600"
            >
              {group.name}
            </Link>

            <div className="flex gap-2">
              <button
                onClick={() => handleUpdate(group.id)}
                className="px-3 py-1.5 text-sm rounded-md bg-gray-100 hover:bg-gray-200"
              >
                Rename
              </button>

              <button
                onClick={() => handleDelete(group.id)}
                className="px-3 py-1.5 text-sm rounded-md bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);
};

export default Dashboard