import { supabase } from '../../data/supabaseClient';
import { Customer, DatabaseCustomer } from '../types';

// Convert DatabaseCustomer to Customer interface
const convertDatabaseCustomer = (dbCustomer: DatabaseCustomer): Customer => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  email: dbCustomer.email || '',
  phone: dbCustomer.phone || '',
  address: dbCustomer.address || {},
  notes: dbCustomer.notes || '',
  totalOrders: dbCustomer.total_orders,
  totalSpent: dbCustomer.total_spent,
  createdAt: new Date(dbCustomer.created_at),
  updatedAt: new Date(dbCustomer.updated_at)
});

// Convert Customer to DatabaseCustomer interface
const convertToDatabaseCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Omit<DatabaseCustomer, 'id' | 'created_at' | 'updated_at'>> => {
  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  return {
    user_id: user.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    notes: customer.notes,
    total_orders: customer.totalOrders,
    total_spent: customer.totalSpent
  };
};

// Get all customers with calculated totals from orders
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching customers: ${error.message}`);
  }

  // Calculate actual totals from orders for each customer
  const customersWithTotals = await Promise.all(
    data.map(async (customer) => {
      // Get all orders for this customer
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', customer.id);

      if (ordersError) {
        console.error(`Error fetching orders for customer ${customer.id}:`, ordersError);
      }

      // Calculate total spent
      const totalSpent = orders ? orders.reduce((sum, order) => sum + order.total_amount, 0) : 0;
      const totalOrders = orders ? orders.length : 0;

      // Update customer stats in database
      if (totalSpent !== customer.total_spent || totalOrders !== customer.total_orders) {
        await updateCustomerStats(customer.id, totalOrders, totalSpent);
      }

      const convertedCustomer = convertDatabaseCustomer(customer);
      convertedCustomer.totalSpent = totalSpent;
      convertedCustomer.totalOrders = totalOrders;
      
      return convertedCustomer;
    })
  );

  return customersWithTotals;
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No rows returned
    }
    throw new Error(`Error fetching customer: ${error.message}`);
  }

  return convertDatabaseCustomer(data);
};

// Create new customer
export const createCustomer = async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
  const dbCustomer = await convertToDatabaseCustomer(customer);

  const { data, error } = await supabase
    .from('customers')
    .insert([dbCustomer])
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating customer: ${error.message}`);
  }

  return convertDatabaseCustomer(data);
};

// Update customer
export const updateCustomer = async (id: string, updates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Customer> => {
  const updateData: any = {};
  
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.email !== undefined) updateData.email = updates.email;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.address !== undefined) updateData.address = updates.address;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.totalOrders !== undefined) updateData.total_orders = updates.totalOrders;
  if (updates.totalSpent !== undefined) updateData.total_spent = updates.totalSpent;

  const { data, error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating customer: ${error.message}`);
  }

  return convertDatabaseCustomer(data);
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting customer: ${error.message}`);
  }
};

// Search customers with calculated totals
export const searchCustomers = async (searchTerm: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error searching customers: ${error.message}`);
  }

  // Calculate actual totals from orders for each customer
  const customersWithTotals = await Promise.all(
    data.map(async (customer) => {
      // Get all orders for this customer
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_id', customer.id);

      if (ordersError) {
        console.error(`Error fetching orders for customer ${customer.id}:`, ordersError);
      }

      // Calculate total spent
      const totalSpent = orders ? orders.reduce((sum, order) => sum + order.total_amount, 0) : 0;
      const totalOrders = orders ? orders.length : 0;

      const convertedCustomer = convertDatabaseCustomer(customer);
      convertedCustomer.totalSpent = totalSpent;
      convertedCustomer.totalOrders = totalOrders;
      
      return convertedCustomer;
    })
  );

  return customersWithTotals;
};

// Update customer order statistics
export const updateCustomerStats = async (id: string, totalOrders: number, totalSpent: number): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update({ total_orders: totalOrders, total_spent: totalSpent })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating customer stats: ${error.message}`);
  }

  return convertDatabaseCustomer(data);
};

// Recalculate customer stats from orders (useful when orders are modified)
export const recalculateCustomerStats = async (customerId: string): Promise<void> => {
  // Get all orders for this customer
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('customer_id', customerId);

  if (ordersError) {
    throw new Error(`Error fetching orders for customer ${customerId}: ${ordersError.message}`);
  }

  // Calculate totals
  const totalSpent = orders ? orders.reduce((sum, order) => sum + order.total_amount, 0) : 0;
  const totalOrders = orders ? orders.length : 0;

  // Update customer stats
  await updateCustomerStats(customerId, totalOrders, totalSpent);
};
