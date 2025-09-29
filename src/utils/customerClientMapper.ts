import { Customer, Client, Address } from '../types';

// Convert Customer to Client
export const customerToClient = (customer: Customer): Client => {
  // Generate status based on totalOrders
  const status: 'active' | 'inactive' | 'prospect' = 
    customer.totalOrders > 0 ? 'active' : 'prospect';
  
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    dateOfBirth: undefined, // Not available in Customer
    nationality: '', // Not available in Customer
    currentCountry: customer.address?.country || '', // Use country from address if available
    targetCountry: '', // Not available in Customer
    passportNumber: undefined, // Not available in Customer
    maritalStatus: undefined, // Not available in Customer
    familyMembers: undefined, // Not available in Customer
    employmentStatus: undefined, // Not available in Customer
    educationLevel: undefined, // Not available in Customer
    incomeLevel: undefined, // Not available in Customer
    criminalRecord: false, // Not available in Customer
    healthConditions: undefined, // Not available in Customer
    emergencyContact: undefined, // Not available in Customer
    address: customer.address,
    notes: customer.notes,
    totalCases: customer.totalOrders, // Map totalOrders to totalCases
    totalSpent: customer.totalSpent,
    status: status,
    photoUrl: undefined, // Not available in Customer
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt
  };
};

// Convert Client to Customer
export const clientToCustomer = (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: client.name,
    email: client.email,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    totalOrders: client.totalCases, // Map totalCases to totalOrders
    totalSpent: client.totalSpent
  };
};

// Convert partial Client updates to Customer updates
export const clientUpdatesToCustomerUpdates = (updates: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>): Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>> => {
  const customerUpdates: Partial<Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>> = {};
  
  if (updates.name !== undefined) customerUpdates.name = updates.name;
  if (updates.email !== undefined) customerUpdates.email = updates.email;
  if (updates.phone !== undefined) customerUpdates.phone = updates.phone;
  if (updates.address !== undefined) customerUpdates.address = updates.address;
  if (updates.notes !== undefined) customerUpdates.notes = updates.notes;
  if (updates.totalCases !== undefined) customerUpdates.totalOrders = updates.totalCases;
  if (updates.totalSpent !== undefined) customerUpdates.totalSpent = updates.totalSpent;
  
  return customerUpdates;
};