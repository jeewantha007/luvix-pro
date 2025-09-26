import React, { useState, useEffect } from 'react';
import { Product, getProducts, searchProducts, deleteProduct, createProduct, updateProduct } from '../../../services/productService';
import ProductForm from './ProductForm';
import { useToast } from '../../../context/ToastContext';
import { Search, Plus, Grid3X3, List, Edit, Trash2, Eye, ArrowLeft, Package, DollarSign, Calendar, Tag, AlertTriangle } from 'lucide-react';

const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [brandFilter, setBrandFilter] = useState<string>('all');
  const [availableBrands, setAvailableBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fetch products and brands on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Extract unique brands from products
  useEffect(() => {
    const brands = Array.from(new Set(products.map((p) => p.brand).filter((b): b is string => !!b)));
    setAvailableBrands(['all', ...brands]);
  }, [products]);

  // Fetch all products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    setLoading(true);
    try {
      let filteredProducts = await (term.trim() ? searchProducts(term) : getProducts());
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter((p) => 
          statusFilter === 'active' ? p.is_active : !p.is_active
        );
      }
      
      // Apply brand filter
      if (brandFilter !== 'all') {
        filteredProducts = filteredProducts.filter((p) => p.brand === brandFilter);
      }
      
      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value as 'all' | 'active' | 'inactive';
    setStatusFilter(status);
    
    setLoading(true);
    try {
      let filteredProducts = searchTerm.trim() ? await searchProducts(searchTerm) : await getProducts();
      
      // Apply status filter
      if (status !== 'all') {
        filteredProducts = filteredProducts.filter((p) => 
          status === 'active' ? p.is_active : !p.is_active
        );
      }
      
      // Apply brand filter
      if (brandFilter !== 'all') {
        filteredProducts = filteredProducts.filter((p) => p.brand === brandFilter);
      }
      
      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle brand filter change
  const handleBrandFilter = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brand = e.target.value;
    setBrandFilter(brand);
    
    setLoading(true);
    try {
      let filteredProducts = searchTerm.trim() ? await searchProducts(searchTerm) : await getProducts();
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredProducts = filteredProducts.filter((p) => 
          statusFilter === 'active' ? p.is_active : !p.is_active
        );
      }
      
      // Apply brand filter
      if (brand !== 'all') {
        filteredProducts = filteredProducts.filter((p) => p.brand === brand);
      }
      
      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Handle view product details
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!deletingProduct) return;
    
    setIsDeleting(true);
    try {
      await deleteProduct(deletingProduct.id);
      setProducts(products.filter((product) => product.id !== deletingProduct.id));
      showSuccess('Product Deleted', 'Product has been deleted successfully.');
      setError(null);
      setShowDeleteModal(false);
      setDeletingProduct(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      showError('Delete Failed', errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Open delete modal
  const openDeleteModal = (product: Product) => {
    setDeletingProduct(product);
    setShowDeleteModal(true);
  };

  // Handle add product
  const handleAddProduct = async (
    productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    imageFiles?: File[]
  ) => {
    try {
      const newProduct = await createProduct(productData, imageFiles);
      setProducts([newProduct, ...products]);
      setError(null);
      showSuccess('Product Added', 'New product has been added successfully.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Handle edit product
  const handleEditProduct = async (
    productData: Omit<Product, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    imageFiles?: File[]
  ) => {
    if (!editingProduct) return;
    try {
      const updatedProduct = await updateProduct(editingProduct.id, productData, imageFiles);
      setProducts(products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
      setError(null);
      showSuccess('Product Updated', 'Product has been updated successfully.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      throw err;
    }
  };

  // Open edit form
  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Product Detail View
  if (selectedProduct) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 h-full">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h1 className="text-2xl font-bold text-gray-900">Product Details</h1>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => openEditForm(selectedProduct)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </button>
                <button
                  onClick={() => openDeleteModal(selectedProduct)}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Product Images</h2>
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {selectedProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {selectedProduct.images.slice(1).map((image, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={image}
                            alt={`${selectedProduct.name} ${index + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Package className="h-16 w-16 mx-auto mb-2" />
                    <p>No images available</p>
                  </div>
                </div>
              )}
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <p className="text-lg text-gray-900">{selectedProduct.name}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {selectedProduct.brand && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
                      <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        <Tag className="h-4 w-4 mr-1" />
                        {selectedProduct.brand}
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                      selectedProduct.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedProduct.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Pricing & Stock</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Price</p>
                        <p className="text-2xl font-bold text-green-900">${selectedProduct.price}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <Package className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Stock Quantity</p>
                        <p className="text-2xl font-bold text-blue-900">{selectedProduct.stock_quantity}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Created:</span>
                    <span className="ml-2">{formatDate(selectedProduct.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="font-medium">Last Updated:</span>
                    <span className="ml-2">{formatDate(selectedProduct.updated_at)}</span>
                  </div>
                </div>
              </div>

              {(selectedProduct as any).category || (selectedProduct as any).sku || (selectedProduct as any).weight ? (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                  <div className="space-y-3">
                    {(selectedProduct as any).category && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Category: </span>
                        <span className="text-gray-600">{(selectedProduct as any).category}</span>
                      </div>
                    )}
                    
                    {(selectedProduct as any).sku && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">SKU: </span>
                        <span className="text-gray-600">{(selectedProduct as any).sku}</span>
                      </div>
                    )}
                    
                    {(selectedProduct as any).weight && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Weight: </span>
                        <span className="text-gray-600">{(selectedProduct as any).weight}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search products..."
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex border border-gray-300 rounded-lg p-1 bg-gray-100">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 text-white font-medium rounded-lg transition-colors shadow-sm"
                style={{ backgroundColor: '#16863f' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#0d5a2b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#16863f';
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4 pb-4">
            <select
              value={statusFilter}
              onChange={handleStatusFilter}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={brandFilter}
              onChange={handleBrandFilter}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand === 'all' ? 'All Brands' : brand}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        ) : (
          <>
            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No products found.</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
                {products.map((product) => (
                  viewMode === 'grid' ? (
                    <div
                      key={product.id}
                      className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden group cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="absolute top-3 right-3 z-10 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewProduct(product);
                          }}
                          className="p-2 bg-white rounded-lg shadow-sm hover:bg-green-50 hover:text-green-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditForm(product);
                          }}
                          className="p-2 bg-white rounded-lg shadow-sm hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(product);
                          }}
                          className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="aspect-square bg-gray-100">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span>No Image</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {product.brand && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {product.brand}
                            </span>
                          )}
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            product.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold" style={{ color: '#16863f' }}>${product.price}</span>
                          <span className="text-sm text-gray-500">Stock: {product.stock_quantity}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-4 group cursor-pointer"
                      onClick={() => handleViewProduct(product)}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
                              <p className="text-sm text-gray-600 truncate mt-1">{product.description}</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                {product.brand && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                    {product.brand}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center space-x-4 ml-4">
                              <div className="text-right">
                                <span className="text-lg font-bold" style={{ color: '#16863f' }}>${product.price}</span>
                                <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                                  product.is_active 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {product.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              
                              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewProduct(product);
                                  }}
                                  className="p-2 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditForm(product);
                                  }}
                                  className="p-2 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openDeleteModal(product);
                                  }}
                                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && deletingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-sm sm:max-w-md w-full">
              <div className="p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Delete Product</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
                  Are you sure you want to delete "{deletingProduct.name}"? This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingProduct(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="w-full sm:w-auto px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ProductForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default ProductList;