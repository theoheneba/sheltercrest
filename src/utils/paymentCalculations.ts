export const calculateInitialPayment = (monthlyRent: number) => {
  // Service fee equals one month's rent
  const serviceFee = monthlyRent;
  
  // Property visit fee is fixed at 120 GHS
  const visitFee = 120;
  
  // Document processing fee is fixed at 60 GHS
  const processingFee = 60;
  
  // Interest is 28% of one month's rent (not two months)
  const interest = monthlyRent * 0.28;
  
  // Two months deposit
  const deposit = monthlyRent * 2;
  
  return {
    deposit,
    interest,
    serviceFee,
    visitFee,
    processingFee,
    total: deposit + interest + serviceFee + visitFee + processingFee
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