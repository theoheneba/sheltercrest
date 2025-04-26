export const calculateInitialPayment = (monthlyRent: number) => {
  const twoMonthsDeposit = monthlyRent * 2;
  const companyInterest = twoMonthsDeposit * 0.28;
  return {
    deposit: twoMonthsDeposit,
    interest: companyInterest,
    total: twoMonthsDeposit + companyInterest
  };
};

export const calculateLatePaymentFee = (amount: number, dayOfMonth: number) => {
  if (dayOfMonth <= 3) return 0; // Grace period
  if (dayOfMonth <= 10) return amount * 0.10; // 10% penalty
  if (dayOfMonth <= 18) return amount * 0.15; // 15% penalty
  if (dayOfMonth <= 25) return amount * 0.25; // 25% penalty
  return 0; // No penalty if paid between 26-31 or within grace period
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    minimumFractionDigits: 2
  }).format(amount);
};