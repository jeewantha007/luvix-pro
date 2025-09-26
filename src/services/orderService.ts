import { supabase } from '../../data/supabaseClient';
import {Order, OrderItem } from '../types';

// Create a new order with items
export const createOrder = async (order: Omit<Order, "id" | "orderNumber" | "createdAt" | "updatedAt">) => {
  try {
    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id: order.userId,
        customer_id: order.customerId,
        customer_name: order.customerName,
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        shipping_address: order.shippingAddress,
        billing_address: order.billingAddress,
        notes: order.notes,
        total_amount: order.totalAmount,
        tax_amount: order.taxAmount,
        discount_amount: order.discountAmount,
        shipping_amount: order.shippingAmount,
      }])
      .select()
      .single();

    if (orderError) throw orderError;

    const newOrderId = orderData.id;

    // 2. Insert order items
    const orderItemsPayload = order.items.map((item: OrderItem) => ({
      order_id: newOrderId,
      product_id: item.productId,
      product_name: item.productName,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total_price: item.quantity * item.unitPrice,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsPayload);

    if (itemsError) throw itemsError;

    return orderData;
  } catch (err: any) {
    console.error("Error creating order:", err.message);
    throw err;
  }
};

// Fetch all orders
export const getOrders = async () => {
  const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

// Fetch single order with items
export const getOrderById = async (orderId: string) => {
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError) throw orderError;

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) throw itemsError;

  return { ...order, items };
};

// Update order (status, payment, etc.)
export const updateOrder = async (orderId: string, updates: Partial<Order>) => {
  const { data, error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Delete an order + items
export const deleteOrder = async (orderId: string) => {
  // Delete items first
  await supabase.from("order_items").delete().eq("order_id", orderId);

  // Delete order
  const { error } = await supabase.from("orders").delete().eq("id", orderId);
  if (error) throw error;

  return true;
};
