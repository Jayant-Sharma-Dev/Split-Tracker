export const equalSplit = (
  amount: number,
  participants: string[]
): Record<string, number> => {
  if (participants.length === 0) {
    throw new Error("At least one participant is required");
  }

  if (amount < 0) {
    throw new Error("Amount cannot be negative");
  }

  const totalCents = Math.round(amount * 100);
  const baseCents = Math.floor(totalCents / participants.length);
  const remainder = totalCents % participants.length;

  const result: Record<string, number> = {};

  participants.forEach((userId, index) => {
    const cents = baseCents + (index < remainder ? 1 : 0);

    result[userId] = cents / 100;
  });
  return result;
};

//When everyone owes different amount ...
export const exactSplit = (
  amount: number,
  participantAmounts: Record<string, number>
): Record<string, number> => {
  const total = Object.values(participantAmounts).reduce(
    (sum, value) => sum + value,
    0
  );

  if (Math.abs(total - amount) > 0.01) {
    throw new Error("Participant amounts must equal the total amount");
  }

  for (const value of Object.values(participantAmounts)) {
    if (value < 0) {
      throw new Error("Participant amount cannot be negative");
    }
  }

  return participantAmounts;
};

//Percentage wise splitt..
export function percentageSplit(
  amount: number,
  percentages: Record<string, number>
) {
  const totalPercentage = Object.values(percentages).reduce(
    (sum, percentage) => sum + percentage,
    0
  );

  if (totalPercentage !== 100) {
    throw new Error("Percentages must add up to 100");
  }

  const result: Record<string, number> = {};

  for (const userId in percentages) {
    result[userId] = (amount * percentages[userId]) / 100;
  }

  return result;
}

//Split with no. of share..
export function sharesSplit(
  amount: number,
  shares: Record<string, number>
) {
  const totalShares = Object.values(shares).reduce(
    (sum, share) => sum + share,
    0
  );

  if (totalShares <= 0) {
    throw new Error("Total shares must be greater than 0");
  }

  const result: Record<string, number> = {};

  for (const userId in shares) {
    result[userId] = amount * (shares[userId] / totalShares);
  }

  return result;
}