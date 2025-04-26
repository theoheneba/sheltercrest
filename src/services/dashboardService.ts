import { supabase } from './supabaseClient';

export const dashboardService = {
  // Application Management
  async updateApplication(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('applications')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  async getApplications(filters?: any) {
    let query = supabase.from('applications').select(`
      *,
      profiles:user_id(*),
      documents(*)
    `);

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // Document Management
  async verifyDocument(id: string, verifiedBy: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({
        status: 'verified',
        verified_at: new Date().toISOString(),
        verified_by: verifiedBy
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateDocumentStatus(id: string, status: string) {
    const { data, error } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // User Management
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'superadmin') {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateUserStatus(userId: string, status: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Support Management
  async updateTicket(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('support_tickets')
      .update(data)
      .eq('id', id)
      .select(`
        *,
        replies:ticket_replies(*)
      `)
      .single();

    if (error) throw error;
    return result;
  },

  async addTicketReply(ticketId: string, userId: string, message: string) {
    const { data, error } = await supabase
      .from('ticket_replies')
      .insert({
        ticket_id: ticketId,
        user_id: userId,
        message
      })
      .select(`
        *,
        user:profiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  // Payment Management
  async updatePayment(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('payments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Document Upload
  async uploadDocument(file: File, userId: string, applicationId: string, documentType: string) {
    const fileName = `${userId}/${documentType}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);

    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        application_id: applicationId,
        document_type: documentType,
        file_name: file.name,
        file_path: publicUrl.publicUrl,
        status: 'pending'
      })
      .select()
      .single();

    if (docError) throw docError;
    return document;
  },

  // BNPL Management
  async createBNPLOrder(orderData: any) {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBNPLPayment(id: string, data: any) {
    const { data: result, error } = await supabase
      .from('bnpl_payments')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return result;
  },

  // Product Management
  async getProducts(filters?: any) {
    let query = supabase.from('products').select(`
      *,
      category:category_id(*)
    `);

    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data;
  },

  async getProductCategories() {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
};