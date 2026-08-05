import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../services/group";
import { getProfiles } from "../services/profile";
import { addMember } from "../services/groupMember";

interface Group {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
};
interface Profile {
  id: string;
  name: string;
  email: string;
}
const GroupPage = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedUserId, setselectedUserId] = useState("");
  const handleAddMember = async () => {
  if (!group || !selectedUserId) return;

  const { error } = await addMember(group.id, selectedUserId);

  if (error) {
    console.log(error.message);
    return;
  }

  alert("Member added!");
};
  const { id } = useParams();
  useEffect(() => {
    async function loadGroup() {
      if (!id) return;

      const { data, error } = await getGroup(Number(id));

      console.log("GroupPage data:", data);
      console.log("GroupPage error:", error);

      if (error) {
        console.log(error);
        return;
      }

      setGroup(data);
      const { data: profileData, error: profileError } = await getProfiles();

      if (profileError) {
        console.log(profileError);
      } else {
        setProfiles(profileData ?? []);
      }

    }

    loadGroup();
  }, [id]);
    console.log(selectedUserId);
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white rounded-xl shadow-md p-6 border">
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

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-3">
            Add Member
          </h2>
          <select
            value={selectedUserId}
            onChange={(e) => setselectedUserId
        (e.target.value)}
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
      </div>
    </div>
  );
}

export default GroupPage