import { supabase } from '../../data/supabaseClient';
import { Order, OrderItem, Customer } from '../types';
import { getOrCreateCustomer } from './customerService';

// Generate a unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  return `ORD-${timestamp}${random}`;
};

// Create a new order with items
export const createOrder = async (order: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<Order> => {
  try {
    // Generate order number if not provided
    const orderNumber = order.orderNumber || generateOrderNumber();
    
    // First, ensure customer exists in the customers table
    let customerId = order.customerId;
    if (order.contactNo) {
      // Create or update customer based on contact number
      const customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'> = {
        name: order.customerName || 'Unknown Customer',
        phone: order.contactNo,
        email: order.customerEmail || '', // Add customer email here
        address: order.shippingAddress ? {
          street: order.shippingAddress.street,
          city: order.shippingAddress.city,
          state: '', // Not available in order address
          zipCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country
        } : undefined,
        notes: order.notes || '',
        totalOrders: 0,
        totalSpent: order.totalAmount || 0
      };
      
      const customer = await getOrCreateCustomer(customerData);
      customerId = customer.id;
    }
    
    // 1. Insert into orders table
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([{
        user_id: order.userId,
        customer_id: customerId,
        contact_no: order.contactNo,
        customer_name: order.customerName,
        order_number: orderNumber,
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        shipping_address: order.shippingAddress,
        billing_address: order.billingAddress,
        notes: order.notes,
        total_amount: order.totalAmount || 0,
        tax_amount: order.taxAmount || 0,
        discount_amount: order.discountAmount || 0,
        shipping_amount: order.shippingAmount || 0,
      }])
      .select()
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    const newOrderId = orderData.id;

    // 2. Insert order items (only if there are items)
    if (order.items && order.items.length > 0) {
      const orderItemsPayload = order.items.map((item: OrderItem) => ({
        order_id: newOrderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice || (item.quantity * item.unitPrice),
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItemsPayload);

      if (itemsError) throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // 3. Update customer stats
    if (order.totalAmount && order.totalAmount > 0) {
      // Get current customer stats
      const { data: customerData, error: customerError } = await supabase
        .from("customers")
        .select("total_orders, total_spent")
        .eq("id", customerId)
        .single();

      if (!customerError && customerData) {
        // Update customer stats
        await supabase
          .from("customers")
          .update({
            total_orders: customerData.total_orders + 1,
            total_spent: customerData.total_spent + order.totalAmount
          })
          .eq("id", customerId);
      }
    }

    // Map the response back to our Order interface
    const mappedOrder: Order = {
      id: orderData.id,
      orderNumber: orderData.order_number,
      userId: orderData.user_id,
      customerId: orderData.customer_id,
      contactNo: orderData.contact_no,
      customerName: orderData.customer_name,
      status: orderData.status,
      paymentStatus: orderData.payment_status,
      paymentMethod: orderData.payment_method,
      shippingAddress: orderData.shipping_address || { street: '', city: '', postalCode: '', country: '' },
      billingAddress: orderData.billing_address || { street: '', city: '', postalCode: '', country: '' },
      notes: orderData.notes,
      totalAmount: orderData.total_amount,
      taxAmount: orderData.tax_amount,
      discountAmount: orderData.discount_amount,
      shippingAmount: orderData.shipping_amount,
      items: order.items || [],
      createdAt: orderData.created_at ? new Date(orderData.created_at) : new Date(),
      updatedAt: orderData.updated_at ? new Date(orderData.updated_at) : new Date()
    };

    return mappedOrder;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Fetch all orders
export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    
    if (error) throw new Error(`Failed to fetch orders: ${error.message}`);
    
    // If no orders exist, return empty array
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map the database response to our Order interface
    const mappedOrders: Order[] = data.map((order: any) => ({
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      customerId: order.customer_id,
      contactNo: order.contact_no,
      customerName: order.customer_name,
      // Note: The orders table doesn't have a customer_email field, so we can't map it here
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      shippingAddress: order.shipping_address || { street: '', city: '', postalCode: '', country: '' },
      billingAddress: order.billing_address || { street: '', city: '', postalCode: '', country: '' },
      notes: order.notes,
      totalAmount: order.total_amount,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      shippingAmount: order.shipping_amount,
      items: [], // Items would need to be fetched separately if needed
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      updatedAt: order.updated_at ? new Date(order.updated_at) : new Date()
    }));
    
    return mappedOrders;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

// Fetch single order with items
export const getOrderById = async (orderId: string): Promise<Order> => {
  try {
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError) throw new Error(`Failed to fetch order: ${orderError.message}`);

    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

    // Map the database response to our Order interface
    const mappedOrder: Order = {
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      customerId: order.customer_id,
      contactNo: order.contact_no,
      customerName: order.customer_name,
      // Note: The orders table doesn't have a customer_email field, so we can't map it here
      status: order.status,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      shippingAddress: order.shipping_address || { street: '', city: '', postalCode: '', country: '' },
      billingAddress: order.billing_address || { street: '', city: '', postalCode: '', country: '' },
      notes: order.notes,
      totalAmount: order.total_amount,
      taxAmount: order.tax_amount,
      discountAmount: order.discount_amount,
      shippingAmount: order.shipping_amount,
      items: items.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        createdAt: item.created_at ? new Date(item.created_at) : new Date()
      })),
      createdAt: order.created_at ? new Date(order.created_at) : new Date(),
      updatedAt: order.updated_at ? new Date(order.updated_at) : new Date()
    };

    return mappedOrder;
  } catch (error) {
    console.error("Error fetching order:", error);
    throw error;
  }
};

// Update order (status, payment, etc.)
export const updateOrder = async (orderId: string, updates: Partial<Order>): Promise<Order> => {
  try {
    // Filter out items from updates since they should be handled separately
    const { items, ...orderUpdates } = updates;
    
    // Map field names to match database schema
    const dbUpdates: any = {};
    if (orderUpdates.status !== undefined) dbUpdates.status = orderUpdates.status;
    if (orderUpdates.paymentStatus !== undefined) dbUpdates.payment_status = orderUpdates.paymentStatus;
    if (orderUpdates.paymentMethod !== undefined) dbUpdates.payment_method = orderUpdates.paymentMethod;
    if (orderUpdates.shippingAddress !== undefined) dbUpdates.shipping_address = orderUpdates.shippingAddress;
    if (orderUpdates.billingAddress !== undefined) dbUpdates.billing_address = orderUpdates.billingAddress;
    if (orderUpdates.notes !== undefined) dbUpdates.notes = orderUpdates.notes;
    if (orderUpdates.totalAmount !== undefined) dbUpdates.total_amount = orderUpdates.totalAmount;
    if (orderUpdates.taxAmount !== undefined) dbUpdates.tax_amount = orderUpdates.taxAmount;
    if (orderUpdates.discountAmount !== undefined) dbUpdates.discount_amount = orderUpdates.discountAmount;
    if (orderUpdates.shippingAmount !== undefined) dbUpdates.shipping_amount = orderUpdates.shippingAmount;
    if (orderUpdates.customerName !== undefined) dbUpdates.customer_name = orderUpdates.customerName;
    if (orderUpdates.orderNumber !== undefined) dbUpdates.order_number = orderUpdates.orderNumber;
    if (orderUpdates.contactNo !== undefined) dbUpdates.contact_no = orderUpdates.contactNo;
    if (orderUpdates.customerId !== undefined) dbUpdates.customer_id = orderUpdates.customerId;
    // Note: The orders table doesn't have a customer_email field, so we don't map it here
    
    // Always update the updated_at timestamp
    dbUpdates.updated_at = new Date();
    
    // Perform the update operation
    const { data: updatedOrder, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw new Error(`Failed to update order: ${error.message}`);

    // If items were provided in updates, update them separately
    if (items && items.length > 0) {
      // First, delete existing items for this order
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);
      
      // Then insert new items
      const orderItemsPayload = items.map((item: OrderItem) => ({
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice || (item.quantity * item.unitPrice),
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsPayload);

      if (itemsError) throw new Error(`Failed to update order items: ${itemsError.message}`);
    }

    // Map the response back to our Order interface
    const mappedOrder: Order = {
      id: updatedOrder.id,
      orderNumber: updatedOrder.order_number,
      userId: updatedOrder.user_id,
      customerId: updatedOrder.customer_id,
      contactNo: updatedOrder.contact_no,
      customerName: updatedOrder.customer_name,
      // Note: The orders table doesn't have a customer_email field, so we can't map it here
      status: updatedOrder.status,
      paymentStatus: updatedOrder.payment_status,
      paymentMethod: updatedOrder.payment_method,
      shippingAddress: updatedOrder.shipping_address || { street: '', city: '', postalCode: '', country: '' },
      billingAddress: updatedOrder.billing_address || { street: '', city: '', postalCode: '', country: '' },
      notes: updatedOrder.notes,
      totalAmount: updatedOrder.total_amount,
      taxAmount: updatedOrder.tax_amount,
      discountAmount: updatedOrder.discount_amount,
      shippingAmount: updatedOrder.shipping_amount,
      items: items || [],
      createdAt: updatedOrder.created_at ? new Date(updatedOrder.created_at) : new Date(),
      updatedAt: updatedOrder.updated_at ? new Date(updatedOrder.updated_at) : new Date()
    };

    return mappedOrder;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};