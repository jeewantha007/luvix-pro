import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

interface Product {
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

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    imageFiles?: File[]
  ) => Promise<void>;
  editingProduct?: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingProduct,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    brand: '',
    is_active: true,
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const { showError, showSuccess } = useToast();

  type ValidationErrors = {
    name?: string;
    description?: string;
    price?: string;
    stock_quantity?: string;
    brand?: string;
    images?: string;
  };
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setFormData({
          name: editingProduct.name,
          description: editingProduct.description || '',
          price: editingProduct.price.toString(),
          stock_quantity: editingProduct.stock_quantity.toString(),
          brand: editingProduct.brand || '',
          is_active: editingProduct.is_active,
        });
        setExistingImages(editingProduct.images || []);
        setSelectedImages([]);
        setImagePreviews([]);
      } else {
        resetForm();
      }
      validateForm(); // Validate on open
    }
  }, [isOpen, editingProduct]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      brand: '',
      is_active: true,
    });
    setSelectedImages([]);
    setImagePreviews([]);
    setExistingImages([]);
    setErrors({});
    setIsFormValid(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate total images (existing + new)
    if (existingImages.length + selectedImages.length + files.length > 5) {
      setErrors((prev) => ({ ...prev, images: 'Maximum 5 images allowed per product' }));
      setIsFormValid(false);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, images: 'Each image must be less than 5MB' }));
        setIsFormValid(false);
        continue;
      }
      
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          images: 'Please select valid image files (JPG, PNG, GIF)',
        }));
        setIsFormValid(false);
        continue;
      }
      
      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    }

    if (validFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...validFiles]);
      setErrors((prev) => ({ ...prev, images: undefined }));
    }
    validateForm();
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    validateForm();
  };

  const removeNewImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    validateForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity),
        brand: formData.brand.trim() || undefined,
        images: existingImages.length > 0 ? existingImages : undefined,
        is_active: formData.is_active,
      };

      await onSubmit(productData, selectedImages.length > 0 ? selectedImages : undefined);
      
      showSuccess(
        editingProduct ? 'Product Updated' : 'Product Added',
        editingProduct
          ? 'Product has been updated successfully.'
          : 'New product has been added successfully.'
      );
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error submitting product:', error);
      
      if (error instanceof Error) {
        showError('Save Failed', error.message);
      } else {
        showError('Save Failed', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) {
      return 'Product name is required';
    }
    if (name.trim().length < 2) {
      return 'Product name must be at least 2 characters long';
    }
    if (name.trim().length > 255) {
      return 'Product name must be less than 255 characters';
    }
    return undefined;
  };

  const validateDescription = (description: string): string | undefined => {
    if (description.trim() && description.trim().length < 10) {
      return 'Description must be at least 10 characters long if provided';
    }
    return undefined;
  };

  const validatePrice = (price: string): string | undefined => {
    if (!price.trim()) {
      return 'Price is required';
    }
    
    if (!/^\d*\.?\d*$/.test(price)) {
      return 'Price can only contain numbers and decimal points';
    }
    
    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      return 'Price must be a valid positive number';
    }
    
    if (numPrice > 999999.99) {
      return 'Price cannot exceed 999,999.99';
    }
    
    return undefined;
  };

  const validateStockQuantity = (stock: string): string | undefined => {
    if (!stock.trim()) {
      return 'Stock quantity is required';
    }
    
    if (!/^\d+$/.test(stock)) {
      return 'Stock quantity must be a whole number';
    }
    
    const numStock = parseInt(stock);
    if (isNaN(numStock) || numStock < 0) {
      return 'Stock quantity must be a positive number';
    }
    
    if (numStock > 999999) {
      return 'Stock quantity cannot exceed 999,999';
    }
    
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    const priceError = validatePrice(formData.price);
    if (priceError) newErrors.price = priceError;

    const stockError = validateStockQuantity(formData.stock_quantity);
    if (stockError) newErrors.stock_quantity = stockError;

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };

  const handleInputChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (typeof value === 'string' && errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    validateForm();
  };

  const handlePriceChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value) || value === '') {
      setFormData((prev) => ({ ...prev, price: value }));
      
      if (errors.price) {
        setErrors((prev) => ({ ...prev, price: undefined }));
      }
      validateForm();
    }
  };

  const handleStockChange = (value: string) => {
    if (/^\d*$/.test(value) || value === '') {
      setFormData((prev) => ({ ...prev, stock_quantity: value }));
      
      if (errors.stock_quantity) {
        setErrors((prev) => ({ ...prev, stock_quantity: undefined }));
      }
      validateForm();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (isFormValid && !isSubmitting) {
        handleSubmit(e as any);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-[9999]"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              type="button"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Product Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., iPhone 15 Pro"
                required
                autoFocus
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe the product..."
              />
              {errors.description && (
                <p className="text-xs text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Price *
                </label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  required
                />
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock Quantity *
                </label>
                <input
                  type="text"
                  value={formData.stock_quantity}
                  onChange={(e) => handleStockChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0"
                  required
                />
                {errors.stock_quantity && (
                  <p className="text-xs text-red-500 mt-1">{errors.stock_quantity}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Brand
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Apple, Nike, Sony"
              />
              {errors.brand && (
                <p className="text-xs text-red-500 mt-1">{errors.brand}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Product Images
              </label>
              <div className="space-y-3">
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {existingImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                          <img
                            src={imageUrl}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">New Images:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`New ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {(existingImages.length + selectedImages.length) < 5 && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-500 file:text-white hover:file:bg-blue-600 file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Max 5 images total, 5MB each. Supported: JPG, PNG, GIF
                    </p>
                  </div>
                )}

                {errors.images && (
                  <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900 dark:text-white">
                Product is active
              </label>
            </div>
          </form>
        </div>
        
        <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>
              {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;