import { useEffect, useState } from "react";
import {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
} from "../services/group";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";

type Group = {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
};

const Dashboard = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const navigate = useNavigate();

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

    const { error } = await createGroup("Trip Goa", user.id);

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
    const { error } = await updateGroup(id, "Updated Goa Trip");

    if (error) {
      console.log(error.message);
      return;
    }

    loadGroups();
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your shared expenses and settlements.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          + Create Group
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Your Groups</h2>
      </div>

      <div className="space-y-4">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
            <p className="text-xl font-semibold text-gray-900">No groups yet</p>
            <p className="mt-2 text-sm text-gray-500">
              Create your first group to start splitting expenses.
            </p>
            <button
              onClick={handleCreate}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Create Group
            </button>
          </div>
        ) : (
          groups.map((group) => (
            <div
              key={group.id}
              onClick={() => navigate(`/group/${group.id}`)}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-5 transition duration-150 hover:-translate-y-px hover:border-blue-300 hover:shadow-sm"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-sm font-semibold text-gray-700">
                    {group.name.charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div className="text-lg font-semibold text-gray-900 transition group-hover:text-blue-600">
                      {group.name}
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      View expenses, members & balances
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/group/${group.id}`);
                    }}
                    className="text-sm text-gray-500 transition group-hover:text-blue-600"
                  >
                    View group →
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUpdate(group.id);
                      }}
                      className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                    >
                      Rename
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group.id);
                      }}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;