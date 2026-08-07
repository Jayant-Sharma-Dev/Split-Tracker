interface MemberCardProps {
  name: string;
  email: string;
  balance?: number;
}

const MemberCard = ({
  name,
  email,
  balance = 0,
}: MemberCardProps) => {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm text-gray-500">Balance</p>
        <p className="font-semibold">
          ₹{balance.toFixed(2)}
        </p>
      </div>
    </div>
  );
};

export default MemberCard;