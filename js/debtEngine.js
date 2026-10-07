// WanderWise Smart Debt Minimization Algorithm
// Solves group debt reconciliation with minimum number of money transfers

class DebtMinimizer {
  /**
   * Calculate net balance for each member given list of expenses
   * @param {Array} members - [{id, name, ...}]
   * @param {Array} expenses - [{id, amount, payerId, ...}]
   * @returns {Object} { netBalances: Map, totalSpent: Number, perPersonShare: Number }
   */
  static calculateNetBalances(members, expenses) {
    const net = {};
    const paid = {};
    const count = members.length;

    members.forEach(m => {
      net[m.id] = 0;
      paid[m.id] = 0;
    });

    let totalSpent = 0;

    expenses.forEach(exp => {
      const amt = Number(exp.amount) || 0;
      totalSpent += amt;
      const share = amt / count;

      if (paid[exp.payerId] !== undefined) {
        paid[exp.payerId] += amt;
      }

      // Payer paid full amount (+amt), but also owes their own share (-share)
      members.forEach(m => {
        if (m.id === exp.payerId) {
          net[m.id] += (amt - share);
        } else {
          net[m.id] -= share;
        }
      });
    });

    return {
      netBalances: net,
      totalSpent,
      perPersonShare: count > 0 ? (totalSpent / count) : 0,
      totalPaidByMember: paid
    };
  }

  /**
   * Greedy Min Cash Flow Algorithm:
   * Greedily matches the greatest debtor with the greatest creditor
   * @param {Array} members 
   * @param {Array} expenses 
   * @returns {Array} List of optimized settlements: [{fromMember, toMember, amount}]
   */
  static minimizeDebts(members, expenses) {
    const { netBalances } = this.calculateNetBalances(members, expenses);
    const memberMap = new Map(members.map(m => [m.id, m]));

    // Separate debtors (negative net balance) and creditors (positive net balance)
    let debtors = [];
    let creditors = [];

    Object.keys(netBalances).forEach(id => {
      const balance = Math.round(netBalances[id]); // round to nearest integer currency
      if (balance < -1) {
        debtors.push({ id, amount: Math.abs(balance) });
      } else if (balance > 1) {
        creditors.push({ id, amount: balance });
      }
    });

    const settlements = [];

    // Match largest debtor with largest creditor
    while (debtors.length > 0 && creditors.length > 0) {
      // Sort to find maximums
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const debtor = debtors[0];
      const creditor = creditors[0];

      const settleAmount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: memberMap.get(debtor.id),
        to: memberMap.get(creditor.id),
        amount: settleAmount
      });

      debtor.amount -= settleAmount;
      creditor.amount -= settleAmount;

      if (debtor.amount <= 1) debtors.shift();
      if (creditor.amount <= 1) creditors.shift();
    }

    return settlements;
  }
}

// Make accessible to window
window.DebtMinimizer = DebtMinimizer;
