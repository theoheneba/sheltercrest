import { usePaystackPayment } from 'react-paystack';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface PaystackButtonProps {
  amount: number;
  onSuccess: (reference: string) => void;
  onClose: () => void;
  className?: string;
}

const PaystackButton = ({ amount, onSuccess, onClose, className }: PaystackButtonProps) => {
  const { user } = useAuth();

  const config = {
    reference: `pay_${Math.floor(Math.random() * 1000000000 + 1)}`,
    email: user?.email || '',
    amount: amount * 100, // Convert to pesewas
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    currency: 'GHS',
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    initializePayment(() => onSuccess(config.reference), onClose);
  };

  return (
    <Button
      onClick={handlePayment}
      className={className}
    >
      Pay GH₵ {amount.toLocaleString()}
    </Button>
  );
};

export default PaystackButton;