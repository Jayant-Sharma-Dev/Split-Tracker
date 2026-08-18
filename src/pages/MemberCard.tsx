interface MemberCardProps {
  name: string;
  email: string;
}

const MemberCard = ({ name, email }: MemberCardProps) => {
  return (
    <div className="flex items-center rounded-lg border p-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white">
          {name.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-semibold">{name}</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>
    </div>
  );
};

export default MemberCard;