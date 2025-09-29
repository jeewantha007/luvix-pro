import React, { useState } from 'react';
import { Users, Package, ArrowLeft, ShoppingCart } from 'lucide-react';
import { useIsMobile } from '../../hooks/useMediaQuery';
import ClientList from './Clients/ClientList';
import OrderList from './Orders/OrderList';
import ProductList from './Products/ProductList';
import OrderDetails from './Orders/OrderDetails';
import ClientDetails from './Clients/ClientDetails';

type CMSModule = 'customers' | 'orders' | 'products';

const CMSView: React.FC = () => {
  const [activeModule, setActiveModule] = useState<CMSModule | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const isMobile = useIsMobile();

  const modules = [
    {
      id: 'products' as CMSModule,
      name: 'Products',
      icon: Package,
      description: 'Manage your product catalog and inventory',
      color: '#16863f'
    },
    {
      id: 'customers' as CMSModule,
      name: 'Customers',
      icon: Users,
      description: 'Manage customer information and relationships',
      color: '#16863f'
    },
    {
      id: 'orders' as CMSModule,
      name: 'Orders',
      icon: ShoppingCart,
      description: 'Track customer orders and manage fulfillment',
      color: '#16863f'
    }
  ];

  const handleModuleSelect = (moduleId: CMSModule) => {
    setActiveModule(moduleId);
    setSelectedItem(null); // Reset selected item when switching modules
  };

  const handleBackToModules = () => {
    setActiveModule(null);
    setSelectedItem(null);
  };

  const renderLeftSection = () => {
    // Always show module selection in left section
    return (
      <div className="w-full lg:w-96 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#16863f20' }}>
              <ShoppingCart className="w-6 h-6" style={{ color: '#16863f' }} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Sales CRM</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage products and customers</p>
            </div>
          </div>
        </div>

        {/* Module Selection */}
        <div className="p-4 space-y-3">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => handleModuleSelect(module.id)}
              className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                activeModule === module.id
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              style={{
                borderColor: activeModule === module.id ? '#16863f' : undefined,
                backgroundColor: activeModule === module.id ? '#16863f10' : undefined
              }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: module.color }}
                >
                  <module.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">{module.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{module.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderRightSection = () => {
    if (!activeModule) {
      // Show welcome message when no module is selected
      return (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#16863f20' }}
            >
              <ShoppingCart className="w-16 h-16" style={{ color: '#16863f' }} />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
              Sales CRM Management
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-md">
              Select a module from the left to manage your products, customers, and orders.
            </p>
          </div>
        </div>
      );
    }

    // Show the appropriate management view based on active module
    const currentModule = modules.find(m => m.id === activeModule);
    if (!currentModule) return null;

    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 sm:p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: currentModule.color }}
              >
                <currentModule.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{currentModule.name} Management</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">{currentModule.description}</p>
              </div>
            </div>
            {/* Back button for mobile */}
            {isMobile && (
              <button
                onClick={handleBackToModules}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Content area with scroll */}
        <div className="flex-1 overflow-hidden h-full">
          {activeModule === 'products' && <ProductList />}

          {activeModule === 'customers' && selectedItem && (
            <ClientDetails
              client={selectedItem}
              onBack={() => setSelectedItem(null)}
            />
          )}
          
          {activeModule === 'customers' && !selectedItem && (
            <ClientList
              selectedClient={selectedItem}
              onClientSelect={setSelectedItem}
            />
          )}
          
          {activeModule === 'orders' && selectedItem && (
            <OrderDetails
              order={selectedItem}
              onBack={() => setSelectedItem(null)}
            />
          )}
          
          {activeModule === 'orders' && !selectedItem && (
            <OrderList
              selectedOrder={selectedItem}
              onOrderSelect={setSelectedItem}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full">
      {/* Left Section: Module Selection */}
      <div className={`${isMobile ? (activeModule ? 'hidden' : 'flex') : 'flex'} w-full lg:w-auto`}>
        {renderLeftSection()}
      </div>

      {/* Right Section: Management View or Welcome Message */}
      <div className={`${isMobile ? (activeModule ? 'flex' : 'hidden') : 'flex'} flex-1`}>
        {renderRightSection()}
      </div>
    </div>
  );
};

export default CMSView;