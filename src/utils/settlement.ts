export interface Balance {
  userId: string;
  paid: number;
  owed: number;
  net: number;
}

export function calculateNetBalance(
  paid: number,
  owed: number
): number {
  return paid - owed;
}

export interface PersonBalance {
  userId: string;
  net: number;
}

export function splitCreditorsAndDebtors(
  balances: PersonBalance[]
) {
  const creditors = balances.filter((person) => person.net > 0);

  const debtors = balances.filter((person) => person.net < 0);

  return {
    creditors,
    debtors,
  };
}

export function sortBalances(
  creditors: PersonBalance[],
  debtors: PersonBalance[]
) {
  const sortedCreditors = [...creditors].sort(
    (a, b) => b.net - a.net
  );

  const sortedDebtors = [...debtors].sort(
    (a, b) => Math.abs(b.net) - Math.abs(a.net)
  );

  return {
    creditors: sortedCreditors,
    debtors: sortedDebtors,
  };
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function simplifyDebts(
  creditors: PersonBalance[],
  debtors: PersonBalance[]
): Settlement[] {
  const result: Settlement[] = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (
    creditorIndex < creditors.length &&
    debtorIndex < debtors.length
  ) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];

    const amount = Math.min(
      creditor.net,
      Math.abs(debtor.net)
    );

    result.push({
      from: debtor.userId,
      to: creditor.userId,
      amount,
    });

    creditor.net -= amount;
    debtor.net += amount;

    if (creditor.net === 0) {
      creditorIndex++;
    }

    if (debtor.net === 0) {
      debtorIndex++;
    }
  }

  return result;
}

const test1 = [
  { userId: "A", net: 100 },
  { userId: "B", net: 100 },
  { userId: "C", net: -200 },
];

const result1 = splitCreditorsAndDebtors(test1);

const sorted1 = sortBalances(
  result1.creditors,
  result1.debtors
);

console.log(
  simplifyDebts(
    sorted1.creditors,
    sorted1.debtors
  )
);