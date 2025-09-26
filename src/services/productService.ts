import { supabase } from "../../data/supabaseClient";


export interface Product {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  brand?: string;
  images?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Convert database row to Product
const convertDatabaseProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  user_id: dbProduct.user_id,
  name: dbProduct.name,
  description: dbProduct.description,
  price: dbProduct.price,
  stock_quantity: dbProduct.stock_quantity,
  brand: dbProduct.brand,
  images: dbProduct.images || [],
  is_active: dbProduct.is_active,
  created_at: dbProduct.created_at,
  updated_at: dbProduct.updated_at,
});

// Sanitize product data
const sanitizeProduct = (product: Partial<Product>) => ({
  ...product,
  description: product.description?.trim() || undefined,
  brand: product.brand?.trim() || undefined,
  images: product.images && product.images.length > 0 ? product.images : undefined,
  is_active: product.is_active !== undefined ? product.is_active : true,
});

// Upload images to Supabase storage
const uploadImages = async (files: File[], productId: string): Promise<string[]> => {
  console.log('uploadImages: Starting image upload for', files.length, 'files');
  const imageUrls: string[] = [];
  for (const [index, file] of files.entries()) {
    console.log(`uploadImages: Processing file ${file.name}, size: ${file.size}, type: ${file.type}`);
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${Date.now()}-${index}.${fileExt}`;
    const { error } = await supabase.storage
      .from('product_images')
      .upload(fileName, file, {
        contentType: file.type,
      });

    if (error) {
      console.error(`uploadImages: Error uploading ${file.name}:`, error);
      if (error.message && error.message.includes('Bucket not found')) {
        throw new Error(`Image upload failed: The storage bucket 'product_images' does not exist. Please check your Supabase configuration.`);
      }
      throw new Error(`Failed to upload image ${file.name}: ${error.message}`);
    }

    const { data } = supabase.storage.from('product_images').getPublicUrl(fileName);
    if (data?.publicUrl) {
      console.log(`uploadImages: Successfully uploaded ${file.name}, URL: ${data.publicUrl}`);
      imageUrls.push(data.publicUrl);
    } else {
      console.error(`uploadImages: Failed to get public URL for ${file.name}`);
      throw new Error(`Failed to get public URL for image ${file.name}`);
    }
  }
  console.log('uploadImages: Completed, URLs:', imageUrls);
  return imageUrls;
};

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching products: ${error.message}`);
  }

  return data.map(convertDatabaseProduct);
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw new Error(`Error fetching product: ${error.message}`);
  }

  return convertDatabaseProduct(data);
};

// Create new product
export const createProduct = async (
  product: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
  imageFiles?: File[]
): Promise<Product> => {
  console.log('createProduct: Starting with product:', product, 'imageFiles:', imageFiles?.length || 0);
  const { data: userData, error: authError } = await supabase.auth.getUser();
  if (authError || !userData.user) {
    console.error('createProduct: Authentication error:', authError);
    throw new Error('User not authenticated');
  }

  const sanitized = sanitizeProduct({
    ...product,
    user_id: userData.user.id,
  });

  console.log('createProduct: Inserting product into database:', sanitized);
  const { data, error } = await supabase
    .from('products')
    .insert([
      {
        ...sanitized,
        user_id: userData.user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('createProduct: Error inserting product:', error);
    throw new Error(`Error creating product: ${error.message}`);
  }

  console.log('createProduct: Product inserted, ID:', data.id);

  // Handle image uploads
  let images: string[] | undefined;
  if (imageFiles && imageFiles.length > 0) {
    console.log('createProduct: Uploading images for product ID:', data.id);
    try {
      images = await uploadImages(imageFiles, data.id);
      console.log('createProduct: Updating product with images:', images);
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: images, updated_at: new Date().toISOString() }) // Explicitly set images as array
        .eq('id', data.id);

      if (updateError) {
        console.error('createProduct: Error updating images:', updateError);
        // Delete the product to avoid orphaned data
        await supabase.from('products').delete().eq('id', data.id);
        throw new Error(`Error updating product images: ${updateError.message}`);
      }
      data.images = images;
      console.log('createProduct: Images updated successfully');
    } catch (err) {
      console.error('createProduct: Image upload failed:', err);
      await supabase.from('products').delete().eq('id', data.id);
      throw err;
    }
  } else {
    console.log('createProduct: No images provided for upload');
  }

  console.log('createProduct: Returning product:', data);
  return convertDatabaseProduct(data);
};

// Update product
export const updateProduct = async (
  id: string,
  updates: Partial<Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
  imageFiles?: File[]
): Promise<Product> => {
  const sanitized = sanitizeProduct(updates);

  let images = sanitized.images;
  if (imageFiles && imageFiles.length > 0) {
    try {
      images = await uploadImages(imageFiles, id);
      if (sanitized.images && sanitized.images.length > 0) {
        images = [...sanitized.images, ...images];
      }
    } catch (err) {
      throw err;
    }
  }

  const { data, error } = await supabase
    .from('products')
    .update({ ...sanitized, images, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }

  return convertDatabaseProduct(data);
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single();

  if (product?.images) {
    for (const imageUrl of product.images) {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await supabase.storage.from('product_images').remove([`${id}/${fileName}`]);
      }
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id);

  if (error) {
    throw new Error(`Error deleting product: ${error.message}`);
  }
};

// Search products
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const sanitizedTerm = searchTerm.trim();
  if (!sanitizedTerm) return getProducts();

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .or(
      `name.ilike.%${sanitizedTerm}%,description.ilike.%${sanitizedTerm}%,brand.ilike.%${sanitizedTerm}%`
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error searching products: ${error.message}`);
  }

  return data.map(convertDatabaseProduct);
};