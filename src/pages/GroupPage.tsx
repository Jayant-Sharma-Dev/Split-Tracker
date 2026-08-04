import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getGroup } from "../services/group";
interface Group {
  id: number;
  name: string;
  created_at?: string;
  created_by?: string | null;
};
const GroupPage = () => {
 const [group, setGroup] = useState<Group | null>(null);
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
  }

  loadGroup();
}, [id]);
   console.log("group state:", group);
  return (
  <div>
    <h1>{group?.name}</h1>
    <h2>Group ID: {group?.id}</h2>
    <p>Created By: {group?.created_by}</p>
  </div>
);
}

export default GroupPage