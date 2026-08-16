import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { useParams } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getGroup } from "../services/group";
import { getProfiles } from "../services/profile";
import { addMember, getGroupMembers } from "../services/groupMember";
import { createExpense, getExpenses } from "../services/expense";
import MemberCard from "./MemberCard";
import {
  addExpenseParticipants,
  getExpenseParticipants,
} from "../services/expenseParticipants";
import { addSettlement, getSettlements } from "../services/settlements";
import {
  calculateNetBalance,
  splitCreditorsAndDebtors,
  sortBalances,
  simplifyDebts,
} from "../utils/settlement";
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

interface RawProfileRow {
  id?: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

interface GroupMemberRow {
  user_id?: string;
  profiles?: RawProfileRow | RawProfileRow[] | null;
}

interface BalanceEntry {
  userId: string;
  name: string;
  email: string;
  avatar_url: string | null;
  paid: number;
  owed: number;
  net: number;
}

interface SettlementHistoryItem {
  id: number;
  from_user: string;
  to_user: string;
  amount: number;
  created_at: string;
}

interface ExpenseRecord {
  id: number;
  group_id: number;
  title: string;
  amount: number | string;
  paid_by: string;
  category: string;
  expense_date: string;
  notes: string;
}

const PIE_COLORS = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formatSignedCurrency = (value: number) => {
  const amount = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);

  if (value > 0) return `+ ${formatted}`;
  if (value < 0) return `− ${formatted}`;
  return "settled";
};

const formatTooltipCurrency = (
  value: number | string | readonly (number | string)[] | undefined,
  label: string
) => {
  const actualValue = Array.isArray(value) ? value[0] : value;
  const numericValue = Number(actualValue ?? 0);

  return [formatCurrency(numericValue), label] as [string, string];
};

const GroupPage = () => {
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [expense, setExpense] = useState({
    title: "",
    amount: "",
    paidBy: "",
    splitMethod: "equal",
    participants: [] as string[],
    category: "Food",
    date: "",
    notes: "",
  });
  const [splitValues, setSplitValues] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<
    "members" | "expenses" | "balances"
  >("members");
  const [settlements, setSettlements] = useState<
    { from: string; to: string; amount: number }[]
  >([]);
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [settlementHistory, setSettlementHistory] = useState<
    SettlementHistoryItem[]
  >([]);
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [balanceError, setBalanceError] = useState<string | null>(null);

  const { id } = useParams();

  const findMemberIdByName = (name?: string | null) => {
    if (!name) return null;

    const trimmedName = name.trim();
    if (!trimmedName) return null;

    const directMatch = members.find(
      (member) => member.profiles.id.toLowerCase() === trimmedName.toLowerCase()
    );

    if (directMatch) {
      return directMatch.profiles.id;
    }

    const nameMatch = members.find(
      (member) =>
        member.profiles.name.toLowerCase().trim() === trimmedName.toLowerCase()
    );

    if (!nameMatch) {
      console.warn(`AI name did not match any group member: "${name}"`);
      return null;
    }

    return nameMatch.profiles.id;
  };

  const mapAiExpenseToForm = (parsedExpense: {
    title?: string;
    amount?: number | string;
    paidBy?: string;
    participants?: string[];
    category?: string;
    date?: string;
    notes?: string;
    splitMethod?: string;
  }) => {
    const paidById = parsedExpense.paidBy
      ? findMemberIdByName(parsedExpense.paidBy)
      : null;

    const participantIds =
      parsedExpense.participants?.reduce<string[]>((acc, participantName) => {
        const matchedId = findMemberIdByName(participantName);

        if (matchedId) {
          acc.push(matchedId);
        }

        return acc;
      }, []) ?? [];

    return {
      title: parsedExpense.title ?? "",
      amount: String(parsedExpense.amount ?? ""),
      paidBy: paidById ?? "",
      splitMethod: parsedExpense.splitMethod ?? "equal",
      participants: participantIds,
      category: parsedExpense.category ?? "Other",
      date: parsedExpense.date ?? new Date().toISOString().split("T")[0],
      notes: parsedExpense.notes ?? "",
    };
  };

  const resetExpenseForm = () => {
    setExpense({
      title: "",
      amount: "",
      paidBy: "",
      splitMethod: "equal",
      participants: [],
      category: "Food",
      date: "",
      notes: "",
    });
  };

  const parseExpenseWithAI = async () => {
    if (!aiInput.trim()) return;

    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "parse-expense",
        {
          body: {
            text: aiInput,
          },
        }
      );

      if (error) {
        console.error("AI error:", error);
        alert("Failed to parse expense");
        return;
      }

      const parsed = data?.expense;

      if (!parsed) {
        alert("AI could not understand the expense");
        return;
      }

      const nextExpense = mapAiExpenseToForm(parsed);

      setExpense((currentExpense) => ({
        ...currentExpense,
        ...nextExpense,
      }));

      setShowExpenseForm(true);
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setAiLoading(false);
    }
  };

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

  const handleSaveExpense = async () => {
    if (!group) return;

    if (
      !expense.title ||
      !expense.amount ||
      !expense.paidBy ||
      expense.participants.length === 0
    ) {
      alert(
        "Please fill in all required expense fields and select at least one participant."
      );
      return;
    }

    const paidById = findMemberIdByName(expense.paidBy);

    if (!paidById) {
      alert(
        `${expense.paidBy} is not a member of this group. Add them to the group first.`
      );
      return;
    }

    const participantIds: string[] = [];

    for (const participant of expense.participants) {
      const memberId = findMemberIdByName(participant);

      if (!memberId) {
        alert(
          `${participant} is not a member of this group. Add them to the group first.`
        );
        return;
      }

      participantIds.push(memberId);
    }

    const { data, error } = await createExpense({
      group_id: group.id,
      title: expense.title,
      amount: Number(expense.amount),
      paid_by: paidById,
      category: expense.category,
      expense_date: expense.date,
      notes: expense.notes,
    });

    if (error || !data) {
      console.error("Create expense error:", error);
      alert("Failed to save expense");
      return;
    }

    const participantData = participantIds.map((userId) => ({
      userId,
      shareAmount:
        expense.splitMethod === "equal"
          ? Number(expense.amount) / Math.max(participantIds.length, 1)
          : splitValues[userId] || 0,
    }));

    const { error: participantError } = await addExpenseParticipants(
      data.id,
      participantData
    );

    if (participantError) {
      console.log("Participant error:", participantError);
      alert("Expense saved, but participants could not be added");
      return;
    }

    const { data: refreshedExpenses, error: refreshedExpenseError } =
      await getExpenses(group.id);

    if (!refreshedExpenseError && refreshedExpenses) {
      setExpenses(refreshedExpenses as ExpenseRecord[]);
    }

    await calculateSettlements(refreshedExpenses ?? []);

    resetExpenseForm();
    setShowExpenseForm(false);
    alert("Expense saved successfully");
  };

  const calculateSettlements = async (providedExpenses: ExpenseRecord[] = expenses) => {
    if (!group || members.length === 0) {
      setBalances([]);
      setSettlements([]);
      return;
    }

    setLoadingBalances(true);
    setBalanceError(null);

    try {
      const expenseList =
        providedExpenses.length > 0
          ? providedExpenses
          : (await getExpenses(group.id)).data ?? [];

      const memberMap = new Map(
        members.map((member) => [member.profiles.id, member.profiles])
      );

      const balancesMap: Record<string, { paid: number; owed: number }> = {};

      members.forEach((member) => {
        balancesMap[member.profiles.id] = { paid: 0, owed: 0 };
      });

      const participantResults = await Promise.all(
        expenseList.map(async (expense) => {
          const { data: participants, error: participantError } =
            await getExpenseParticipants(expense.id);

          return {
            expenseId: expense.id,
            participants: participants ?? [],
            participantError,
          };
        })
      );

      for (const expense of expenseList) {
        const paidBy = expense.paid_by;

        if (!balancesMap[paidBy]) {
          balancesMap[paidBy] = { paid: 0, owed: 0 };
        }

        balancesMap[paidBy].paid += Number(expense.amount ?? 0);

        const matchingParticipants = participantResults.find(
          (result) => result.expenseId === expense.id
        );

        if (matchingParticipants?.participantError) {
          continue;
        }

        for (const participant of matchingParticipants?.participants ?? []) {
          if (!balancesMap[participant.user_id]) {
            balancesMap[participant.user_id] = { paid: 0, owed: 0 };
          }

          balancesMap[participant.user_id].owed += Number(
            participant.share_amount ?? 0
          );
        }
      }

      const balanceList: BalanceEntry[] = members.map((member) => {
        const userId = member.profiles.id;
        const profile = memberMap.get(userId) ?? {
          id: userId,
          name: "Unknown",
          email: "",
          avatar_url: null,
        };

        const current = balancesMap[userId] ?? { paid: 0, owed: 0 };
        const paid = Number(current.paid ?? 0);
        const owed = Number(current.owed ?? 0);

        return {
          userId,
          name: profile.name ?? "Unknown",
          email: profile.email ?? "",
          avatar_url: profile.avatar_url ?? null,
          paid,
          owed,
          net: calculateNetBalance(paid, owed),
        };
      });

      const balancePersonList = balanceList.map(({ userId, net }) => ({
        userId,
        net,
      }));

      const { creditors, debtors } = splitCreditorsAndDebtors(balancePersonList);
      const sorted = sortBalances(creditors, debtors);
      const simplified = simplifyDebts(sorted.creditors, sorted.debtors);

      const { data: settlementRows, error: settlementError } = await getSettlements(
        group.id
      );

      if (settlementError) {
        throw settlementError;
      }

      setBalances(balanceList);
      setSettlements(simplified);
      setSettlementHistory(
        (settlementRows ?? []).map((row) => ({
          id: Number(row.id),
          from_user: row.from_user,
          to_user: row.to_user,
          amount: Number(row.amount ?? 0),
          created_at: row.created_at,
        }))
      );
    } catch (error) {
      console.log("Balance calculation error:", error);
      setBalanceError("Unable to load balances.");
    } finally {
      setLoadingBalances(false);
    }
  };

  const handleMarkAsPaid = async (settlement: {
    from: string;
    to: string;
    amount: number;
  }) => {
    if (!group) return;

    const { error } = await addSettlement(
      group.id,
      settlement.from,
      settlement.to,
      settlement.amount
    );

    if (error) {
      console.log(error);
      alert("Unable to mark settlement as paid.");
      return;
    }

    await calculateSettlements();
  };

  const memberNameMap = useMemo(() => {
    const map = new Map<string, string>();

    profiles.forEach((profile) => {
      map.set(profile.id, profile.name || "Unknown member");
    });

    members.forEach((member) => {
      map.set(member.profiles.id, member.profiles.name || "Unknown member");
    });

    return map;
  }, [profiles, members]);

  const monthlySpending = useMemo(() => {
    const totals = new Map<string, { monthKey: string; month: string; total: number }>();

    expenses.forEach((expense) => {
      if (!expense.expense_date) return;

      const date = new Date(`${expense.expense_date}T00:00:00`);
      if (Number.isNaN(date.getTime())) return;

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const month = new Intl.DateTimeFormat("en-US", {
        month: "short",
        year: "numeric",
      }).format(date);
      const amount = Number(expense.amount ?? 0);

      const current = totals.get(monthKey) ?? { monthKey, month, total: 0 };
      current.total += amount;
      totals.set(monthKey, current);
    });

    return Array.from(totals.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(({ month, total }) => ({ month, total }));
  }, [expenses]);

  const categorySpending = useMemo(() => {
    const totals = new Map<string, number>();

    expenses.forEach((expense) => {
      const category = expense.category || "Other";
      const amount = Number(expense.amount ?? 0);
      totals.set(category, (totals.get(category) ?? 0) + amount);
    });

    return Array.from(totals.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const topSpender = useMemo(() => {
    const totals = new Map<string, number>();

    expenses.forEach((expense) => {
      const userId = expense.paid_by;
      if (!userId) return;

      const amount = Number(expense.amount ?? 0);
      totals.set(userId, (totals.get(userId) ?? 0) + amount);
    });

    return Array.from(totals.entries())
      .map(([userId, total]) => ({
        userId,
        name: memberNameMap.get(userId) ?? "Unknown member",
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses, memberNameMap]);

  const timelineData = useMemo(() => {
    const totals = new Map<string, { date: string; label: string; total: number }>();

    expenses.forEach((expense) => {
      if (!expense.expense_date) return;

      const amount = Number(expense.amount ?? 0);
      const dateKey = expense.expense_date;
      const date = new Date(`${dateKey}T00:00:00`);

      if (Number.isNaN(date.getTime())) return;

      const label = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date);

      const current = totals.get(dateKey) ?? { date: dateKey, label, total: 0 };
      current.total += amount;
      current.label = label;
      totals.set(dateKey, current);
    });

    return Array.from(totals.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(({ label, total }) => ({ date: label, total }));
  }, [expenses]);

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
        const rows = memberData as unknown as GroupMemberRow[];
        const normalizedMembers: Member[] = rows.map((row, index) => {
          const profile = Array.isArray(row.profiles)
            ? row.profiles[0] ?? null
            : row.profiles ?? null;

          return {
            id: index,
            profiles: {
              id: row.user_id ?? profile?.id ?? "",
              name: profile?.name ?? "Unknown member",
              email: profile?.email ?? "",
              avatar_url: profile?.avatar_url ?? null,
            },
          };
        });

        setMembers(normalizedMembers);
      }

      const { data: profileData, error: profileError } =
        await getProfiles();

      if (profileError) {
        console.log(profileError);
      } else {
        setProfiles(profileData ?? []);
      }

      const { data: expenseData, error: expenseError } =
        await getExpenses(Number(id));

      if (!expenseError && expenseData) {
        setExpenses(expenseData as ExpenseRecord[]);
      }
    }

    loadGroup();
  }, [id]);

  useEffect(() => {
    if (group && members.length > 0) {
      void calculateSettlements(expenses);
    }
  }, [group, members, expenses]);

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
            className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === "members"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            Members
          </button>

          <button
            onClick={() => setActiveTab("expenses")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === "expenses"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 hover:bg-gray-200"
              }`}
          >
            Expenses
          </button>

          <button
            onClick={() => setActiveTab("balances")}
            className={`rounded-md px-4 py-2 text-sm font-medium ${activeTab === "balances"
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
                  <MemberCard
                    key={member.id}
                    name={member.profiles.name}
                    email={member.profiles.email}
                    balance={0}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "expenses" && (
          <div className="mt-8">
            <textarea
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Dinner 1800, paid by Jayant, split with Anhsika and Shorya"
              className="w-full rounded-xl border border-red-300 p-4"
              rows={3}
            />

            <button
              type="button"
              disabled={aiLoading || !aiInput.trim()}
              onClick={parseExpenseWithAI}
              className="mt-3 rounded-xl bg-blue-600 px-3 py-3 text-white disabled:opacity-50"
            >
              {aiLoading ? "Parsing..." : "Parse with AI"}
            </button>

            <div className="mb-6 mt-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Expenses</h2>

              <button
                onClick={() => setShowExpenseForm(true)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Add Expense Manually
              </button>
            </div>

            {showExpenseForm ? (
              <div className="space-y-5 rounded-lg border p-6">
                <div>
                  <label className="mb-2 block font-medium">
                    Expense Title
                  </label>

                  <input
                    type="text"
                    value={expense.title}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        title: e.target.value,
                      })
                    }
                    placeholder="Dinner"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Amount
                  </label>

                  <input
                    type="number"
                    value={expense.amount}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        amount: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Paid By
                  </label>

                  <select
                    value={expense.paidBy}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        paidBy: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="">Select payer</option>

                    {members.map((member) => (
                      <option key={member.id} value={member.profiles.id}>
                        {member.profiles.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Split Method
                  </label>

                  <select
                    value={expense.splitMethod}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        splitMethod: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="equal">Equal</option>
                    <option value="exact">Exact Amount</option>
                    <option value="percentage">Percentage</option>
                    <option value="shares">Shares</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Split Among
                  </label>

                  <div className="space-y-3">
                    {members.map((member) => {
                      const userId = member.profiles.id;
                      const selected = expense.participants.includes(userId);

                      return (
                        <div key={userId} className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              const updatedParticipants = e.target.checked
                                ? [...expense.participants, userId]
                                : expense.participants.filter((id) => id !== userId);

                              setExpense({
                                ...expense,
                                participants: updatedParticipants,
                              });
                            }}
                          />

                          <span className="flex-1">{member.profiles.name}</span>

                          {selected && expense.splitMethod !== "equal" && (
                            <input
                              type="number"
                              min="0"
                              value={splitValues[userId] ?? ""}
                              onChange={(e) =>
                                setSplitValues({
                                  ...splitValues,
                                  [userId]: Number(e.target.value),
                                })
                              }
                              placeholder={
                                expense.splitMethod === "exact"
                                  ? "Amount"
                                  : expense.splitMethod === "percentage"
                                    ? "%"
                                    : "Shares"
                              }
                              className="w-28 rounded-lg border px-3 py-2"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Category
                  </label>

                  <select
                    value={expense.category}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        category: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option>Food</option>
                    <option>Travel</option>
                    <option>Shopping</option>
                    <option>Entertainment</option>
                    <option>Hotel</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Date
                  </label>

                  <input
                    type="date"
                    value={expense.date}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        date: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block font-medium">
                    Notes
                  </label>

                  <textarea
                    rows={3}
                    value={expense.notes}
                    onChange={(e) =>
                      setExpense({
                        ...expense,
                        notes: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <button
                  onClick={handleSaveExpense}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Save Expense
                </button>

                <pre className="mt-6 rounded-lg bg-gray-100 p-4 text-sm">
                  {JSON.stringify(expense, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="rounded-lg border p-8 text-center text-gray-500">
                No expenses yet.
              </div>
            )}
          </div>
        )}

        {activeTab === "balances" && (
          <div className="mt-8 space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-semibold">BALANCE SUMMARY</h2>

              {loadingBalances ? (
                <p className="text-gray-500">Loading balances...</p>
              ) : balanceError ? (
                <p className="text-red-500">{balanceError}</p>
              ) : balances.length === 0 ? (
                <p className="text-gray-500">No balances available yet.</p>
              ) : (
                <div className="space-y-3">
                  {balances.map((balance) => {
                    const name = balance.name || "Unknown user";
                    const netLabel = formatSignedCurrency(balance.net);

                    return (
                      <div
                        key={balance.userId}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-sm font-medium text-gray-700">
                            {balance.avatar_url ? (
                              <img
                                src={balance.avatar_url}
                                alt={name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              name.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-gray-500">{balance.email}</p>
                          </div>
                        </div>

                        <div className="text-right text-sm">
                          <p>Paid: {formatCurrency(balance.paid)}</p>
                          <p>Owes: {formatCurrency(balance.owed)}</p>
                          <p
                            className={
                              balance.net > 0
                                ? "text-green-600"
                                : balance.net < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                            }
                          >
                            {netLabel}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold">SETTLEMENTS</h2>

              {settlements.length === 0 ? (
                <p className="text-gray-500">Everyone is settled up.</p>
              ) : (
                <div className="space-y-3">
                  {settlements.map((settlement, index) => {
                    const fromName =
                      members.find((member) => member.profiles.id === settlement.from)
                        ?.profiles.name ?? settlement.from;
                    const toName =
                      members.find((member) => member.profiles.id === settlement.to)
                        ?.profiles.name ?? settlement.to;

                    return (
                      <div
                        key={`${settlement.from}-${settlement.to}-${index}`}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div>
                          <p className="font-medium">
                            {fromName} owes {toName} {formatCurrency(settlement.amount)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleMarkAsPaid(settlement)}
                          className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700"
                        >
                          Mark as Paid
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold">SETTLEMENT HISTORY</h2>

              {settlementHistory.length === 0 ? (
                <p className="text-gray-500">No settlement payments recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {settlementHistory.map((row) => {
                    const fromName =
                      members.find((member) => member.profiles.id === row.from_user)
                        ?.profiles.name ?? row.from_user;
                    const toName =
                      members.find((member) => member.profiles.id === row.to_user)
                        ?.profiles.name ?? row.to_user;

                    return (
                      <div
                        key={row.id}
                        className="rounded-lg border p-4"
                      >
                        <p className="font-medium">
                          {fromName} → {toName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatCurrency(row.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(row.created_at).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
                <p className="text-sm text-gray-500">
                  Understand how your group is spending.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Monthly Spending
                    </h3>
                    <p className="text-sm text-gray-500">
                      How much your group spent over time
                    </p>
                  </div>

                  {monthlySpending.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No spending data yet. Add an expense to see analytics.
                    </p>
                  ) : (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlySpending}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="month" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip
                            formatter={(value) => formatTooltipCurrency(value, "Total")}
                          />
                          <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="#2563eb" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Spending by Category
                    </h3>
                    <p className="text-sm text-gray-500">
                      Where your money is going
                    </p>
                  </div>

                  {categorySpending.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No spending data yet. Add an expense to see analytics.
                    </p>
                  ) : (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categorySpending}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={58}
                            outerRadius={90}
                            paddingAngle={3}
                          >
                            {categorySpending.map((entry, index) => (
                              <Cell
                                key={`${entry.name}-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => formatTooltipCurrency(value, "Total")}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Top Spender
                    </h3>
                    <p className="text-sm text-gray-500">
                      Highest contributor in this group
                    </p>
                  </div>

                  {topSpender.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No spending data yet. Add an expense to see analytics.
                    </p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-2xl font-semibold text-gray-900">
                          {topSpender[0].name}
                        </p>
                        <p className="text-lg text-blue-600">
                          {formatCurrency(topSpender[0].total)} paid
                        </p>
                      </div>

                      <div className="space-y-2">
                        {topSpender.slice(0, 5).map((person, index) => (
                          <div
                            key={`${person.userId}-${index}`}
                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
                          >
                            <span className="text-gray-600">
                              {index + 1}. {person.name}
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatCurrency(person.total)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Spending Timeline
                    </h3>
                    <p className="text-sm text-gray-500">
                      Daily group spending
                    </p>
                  </div>

                  {timelineData.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No spending data yet. Add an expense to see analytics.
                    </p>
                  ) : (
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                          <XAxis dataKey="date" tickLine={false} axisLine={false} />
                          <YAxis tickLine={false} axisLine={false} />
                          <Tooltip
                            formatter={(value) => formatTooltipCurrency(value, "Amount")}
                          />
                          <Line
                            type="monotone"
                            dataKey="total"
                            stroke="#2563eb"
                            strokeWidth={3}
                            dot={{ r: 4, fill: "#2563eb" }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupPage;