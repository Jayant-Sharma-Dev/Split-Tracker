import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../services/group";
import { getProfiles } from "../services/profile";
import { addMember, getGroupMembers } from "../services/groupMember";

interface Group {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
}

interface Profile {
  id: string;
  name: string;
  email: string;
}

interface Member {
  id: number;
  profiles: {
    id: string;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

const GroupPage = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [activeTab, setActiveTab] = useState<
    "members" | "expenses" | "balances"
  >("members");

  const { id } = useParams();

  const handleAddMember = async () => {
    if (!group || !selectedUserId) return;

    const alreadyExists = members.some(
      (member) => member.profiles.id === selectedUserId
    );

    if (alreadyExists) {
      alert("Member already exists");
      return;
    }

    const { error } = await addMember(group.id, selectedUserId);

    if (error) {
      console.log(error.message);
      return;
    }

    const { data: memberData } = await getGroupMembers(group.id);

    if (memberData) {
      setMembers(memberData as any);
    }

    setSelectedUserId("");
    alert("Member added!");
  };

  useEffect(() => {
    async function loadGroup() {
      if (!id) return;

      const { data, error } = await getGroup(Number(id));

      if (error) {
        console.log(error);
        return;
      }

      setGroup(data);

      const { data: memberData, error: memberError } =
        await getGroupMembers(Number(id));

      if (!memberError && memberData) {
        setMembers(memberData as any);
      }

      const { data: profileData, error: profileError } =
        await getProfiles();

      if (profileError) {
        console.log(profileError);
      } else {
        setProfiles(profileData ?? []);
      }
    }

    loadGroup();
  }, [id]);

  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="rounded-xl border bg-white p-6 shadow-md">
        <h1 className="text-3xl font-bold">{group?.name}</h1>

        <div className="mt-4 space-y-2 text-gray-700">
          <p>
            <span className="font-semibold">Group ID:</span> {group?.id}
          </p>

          <p>
            <span className="font-semibold">Created By:</span>{" "}
            {group?.created_by}
          </p>
        </div>

        <div className="mt-8 flex gap-2 border-b pb-3">
          <button
            onClick={() => setActiveTab("members")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "members"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Members
          </button>

          <button
            onClick={() => setActiveTab("expenses")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "expenses"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Expenses
          </button>

          <button
            onClick={() => setActiveTab("balances")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${
              activeTab === "balances"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Balances
          </button>
        </div>

        {activeTab === "members" && (
          <>
            <div className="mt-8">
              <h2 className="mb-3 text-xl font-semibold">
                Add Member
              </h2>

              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a member</option>

                {profiles.map((profile) => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.email})
                  </option>
                ))}
              </select>

              <button
                onClick={handleAddMember}
                className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Member
              </button>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">
                Members
              </h2>

              <div className="space-y-3">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">
                        {member.profiles.name}
                      </p>

                      <p className="text-sm text-gray-500">
                        {member.profiles.email}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "expenses" && (
          <div className="mt-8 rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-semibold">
              Expenses
            </h2>

            <p className="mt-3 text-gray-500">
              Coming Soon 🚧
            </p>
          </div>
        )}

        {activeTab === "balances" && (
          <div className="mt-8 rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-semibold">
              Balances
            </h2>

            <p className="mt-3 text-gray-500">
              Coming Soon 🚧
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;