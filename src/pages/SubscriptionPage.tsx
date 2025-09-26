import React, { useEffect, useState } from 'react';
import { Check, Star, Users, BarChart3, Shield, Zap, Crown, Building2, LogOut, Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const API_BASE = import.meta.env.VITE_API_URL || '';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

type BackendPlan = {
  id: string;
  name: string;
  plan_type: 'monthly';
  price: number;
  stripe_price_id: string;
  features: string[];
};

type UiPlan = {
  id: string;
  name: string;
  plan_type: 'monthly';
  price: number;
  interval: string;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ComponentType<any>;
  color: string;
  originalPrice?: number;
};

const SubscriptionPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [backendPlans, setBackendPlans] = useState<BackendPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logout function
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // The auth state change will be handled by AppContext
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Load plans from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/payments/plans`);
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        if (mounted) setBackendPlans(data.plans || []);
      } catch (e) {
        setError('Could not load plans');
      }
    })();
    return () => { mounted = false; };
  }, []);

  const plans: UiPlan[] = backendPlans.map((p, idx) => {
    // Determine icon and color based on plan type or price
    const icon = idx === 0 ? Users : Building2;
    const color = idx === 0 
      ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
      : 'bg-gradient-to-br from-purple-500 to-purple-600';
    
    // Clean up the plan name for description
    const cleanName = p.name.split(' - ')[0] || p.name;
    const description = idx === 0 
      ? 'Perfect for small businesses getting started'
      : 'Ideal for growing teams and advanced features';
    
    return {
      id: p.id,
      name: cleanName,
      plan_type: p.plan_type,
      price: p.price,
      interval: '/month',
      description,
      features: p.features || [],
      popular: idx === 1, // Make second plan (Professional) popular
      icon,
      color
    };
  });

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      setError('Please select a subscription plan');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Get current user id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const plan = plans.find(p => p.id === selectedPlan);
      if (!plan) throw new Error('Plan not found');

      // Create subscription checkout session
      const response = await fetch(`${API_BASE}/api/payments/create-subscription-checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          subscription_plan_id: plan.id 
        })
      });
      
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create checkout session');
      }
      
      const { checkoutUrl } = await response.json();
      
      // Redirect to payment
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Luvix CRM</h1>
                <p className="text-sm text-gray-600">Choose your perfect plan</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Trusted by 50,000+ businesses worldwide</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Scale Your Business
            <span className="block bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Choose Your Plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Transform your customer relationships with our powerful CRM solution. 
            All plans include core features and 30-day money-back guarantee.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 max-w-md mx-auto rounded-2xl bg-red-50 p-4 border border-red-200 shadow-sm">
            <div className="text-red-600 text-sm font-medium text-center flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {backendPlans.length === 0 && !error && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading plans...</p>
          </div>
        )}

        {/* Centered Plans Grid */}
        {plans.length > 0 && (
          <div className="flex justify-center mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
              {plans.map((plan) => {
                const IconComponent = plan.icon;
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`relative bg-white rounded-3xl p-8 cursor-pointer transition-all duration-500 border-2 hover:scale-105 ${
                      isSelected
                        ? 'border-green-500 shadow-2xl scale-105 ring-4 ring-green-100'
                        : 'border-gray-200 shadow-xl hover:shadow-2xl hover:border-green-300'
                    } ${plan.popular ? 'ring-2 ring-green-200' : ''}`}
                    style={{
                      transform: isSelected ? 'translateY(-8px) scale(1.05)' : 'translateY(0) scale(1)'
                    }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-2 shadow-lg">
                          <Star className="w-4 h-4" />
                          <span>Most Popular</span>
                        </div>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <div className={`w-20 h-20 ${plan.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg transform transition-all duration-300 hover:rotate-6`}>
                        <IconComponent className="w-10 h-10 text-white" />
                      </div>
                      
                      <h3 className="text-3xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-gray-600 mb-6">{plan.description}</p>
                      
                      <div className="mb-8">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                          <span className="text-5xl font-bold text-gray-900">
                            ${plan.price}
                          </span>
                          <div className="text-left">
                            <div className="text-gray-600 font-medium">{plan.interval}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features List */}
                    <div className="space-y-4 mb-8">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-start space-x-3 group hover:bg-gray-50 rounded-lg p-2 transition-all duration-200">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5 group-hover:bg-green-200 transition-colors">
                            <Check className="w-4 h-4 text-green-600" />
                          </div>
                          <span className="text-sm text-gray-700 leading-relaxed font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      className={`w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                        isSelected
                          ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg transform hover:shadow-xl'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Selected Plan</span>
                        </>
                      ) : (
                        <>
                          <span>Select {plan.name}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Plan Summary & Payment */}
        {selectedPlan && selectedPlanData && (
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden">
              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-transparent opacity-30"></div>
              
              <div className="relative">
                <div className="text-center mb-6">
                  <h3 className="text-3xl font-bold text-gray-900 mb-2">
                    Ready to Get Started?
                  </h3>
                  <p className="text-gray-600">Complete your subscription to unlock all features</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 ${selectedPlanData.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                        <selectedPlanData.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">{selectedPlanData.name}</h4>
                        <p className="text-gray-600">{selectedPlanData.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-gray-600">
                      Billing {selectedPlanData.plan_type}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">
                        ${selectedPlanData.price}{selectedPlanData.interval}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white font-bold py-5 px-8 rounded-2xl hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-green-200 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 text-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="w-6 h-6" />
                      <span>Subscribe Now - Secure Payment</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  )}
                </button>

                <div className="flex items-center justify-center space-x-4 mt-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>Cancel anytime</span>
                  <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                  <span>30-day guarantee</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!selectedPlan && plans.length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 text-gray-600 bg-gray-100 px-6 py-3 rounded-full">
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Select a plan above to continue</span>
            </div>
          </div>
        )}
      </div>

      {/* Features Comparison */}
      <div className="bg-gradient-to-r from-gray-50 to-green-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Luvix CRM?
            </h3>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of businesses that trust Luvix CRM to manage their customer relationships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Users, title: "50K+ Users", desc: "Trusted by businesses worldwide", color: "bg-blue-500" },
              { icon: BarChart3, title: "99.9% Uptime", desc: "Reliable service you can count on", color: "bg-green-500" },
              { icon: Shield, title: "Bank-Level Security", desc: "Your data is always protected", color: "bg-purple-500" },
              { icon: Zap, title: "24/7 Support", desc: "Help when you need it most", color: "bg-orange-500" }
            ].map((feature, idx) => (
              <div key={idx} className="text-center group hover:scale-105 transition-all duration-300">
                <div className={`w-20 h-20 ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <feature.icon className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;