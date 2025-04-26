import { supabase } from './supabaseClient';
import { toast } from 'react-hot-toast';

export interface Payment {
  id: string;
  user_id: string;
  application_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  transaction_id: string;
  created_at: string;
}

export const paymentService = {
  async createPayment(data: Omit<Payment, 'id' | 'created_at'>) {
    try {
      const { data: payment, error } = await supabase
        .from('payments')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return payment;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment');
      throw error;
    }
  },

  async getUserPayments(userId: string) {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch payments');
      throw error;
    }
  },

  async verifyPayment(reference: string) {
    try {
      const response = await fetch(`/api/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      toast.error(error.message || 'Payment verification failed');
      throw error;
    }
  }
};