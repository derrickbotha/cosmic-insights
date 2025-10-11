/**
 * Payment Service
 * Handles Stripe and Braintree payment processing
 */

class PaymentService {
  constructor() {
    this.stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_test_demo';
    this.braintreeToken = process.env.REACT_APP_BRAINTREE_TOKEN || 'sandbox_token_demo';
    this.stripe = null;
    this.braintree = null;
  }

  /**
   * Initialize Stripe
   */
  async initializeStripe() {
    if (this.stripe) return this.stripe;

    try {
      // Load Stripe.js dynamically
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      this.stripe = window.Stripe(this.stripePublicKey);
      return this.stripe;
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      return null;
    }
  }

  /**
   * Initialize Braintree
   */
  async initializeBraintree() {
    if (this.braintree) return this.braintree;

    try {
      // Load Braintree Drop-in dynamically
      const script = document.createElement('script');
      script.src = 'https://js.braintreegateway.com/web/dropin/1.33.7/js/dropin.min.js';
      document.head.appendChild(script);

      await new Promise((resolve) => {
        script.onload = resolve;
      });

      this.braintree = window.braintree;
      return this.braintree;
    } catch (error) {
      console.error('Failed to initialize Braintree:', error);
      return null;
    }
  }

  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(amount, currency = 'usd', metadata = {}) {
    try {
      // In production, call your backend API
      // const response = await fetch('/api/payments/create-payment-intent', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ amount, currency, metadata })
      // });
      // return await response.json();

      // Demo mode: Return mock payment intent
      return {
        clientSecret: 'pi_demo_secret_' + Math.random().toString(36),
        amount,
        currency,
        status: 'requires_payment_method'
      };
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      throw error;
    }
  }

  /**
   * Process Stripe payment
   */
  async processStripePayment(paymentMethodId, amount, tier) {
    try {
      await this.initializeStripe();

      // Track payment attempt
      this.trackPaymentEvent('payment_initiated', {
        provider: 'stripe',
        amount,
        tier
      });

      // In production, confirm payment with backend
      // const result = await this.stripe.confirmCardPayment(clientSecret, {
      //   payment_method: paymentMethodId
      // });

      // Demo mode: Simulate successful payment
      await this.simulatePayment(1500);

      const payment = {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        provider: 'stripe',
        amount,
        currency: 'usd',
        tier,
        status: 'succeeded',
        timestamp: Date.now(),
        paymentMethodId
      };

      // Store payment record
      this.storePayment(payment);

      // Track successful payment
      this.trackPaymentEvent('payment_succeeded', payment);

      return {
        success: true,
        payment
      };
    } catch (error) {
      this.trackPaymentEvent('payment_failed', {
        provider: 'stripe',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Process Braintree payment
   */
  async processBraintreePayment(nonce, amount, tier) {
    try {
      await this.initializeBraintree();

      // Track payment attempt
      this.trackPaymentEvent('payment_initiated', {
        provider: 'braintree',
        amount,
        tier
      });

      // In production, send nonce to backend
      // const response = await fetch('/api/payments/braintree/process', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ nonce, amount, tier })
      // });

      // Demo mode: Simulate successful payment
      await this.simulatePayment(1500);

      const payment = {
        id: 'pay_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        provider: 'braintree',
        amount,
        currency: 'usd',
        tier,
        status: 'succeeded',
        timestamp: Date.now(),
        nonce
      };

      // Store payment record
      this.storePayment(payment);

      // Track successful payment
      this.trackPaymentEvent('payment_succeeded', payment);

      return {
        success: true,
        payment
      };
    } catch (error) {
      this.trackPaymentEvent('payment_failed', {
        provider: 'braintree',
        error: error.message
      });

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create subscription
   */
  async createSubscription(tier, paymentProvider, paymentMethodId) {
    try {
      const tierPricing = this.getTierPricing(tier);

      const subscription = {
        id: 'sub_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        tier,
        amount: tierPricing.price,
        interval: tierPricing.interval,
        status: 'active',
        provider: paymentProvider,
        paymentMethodId,
        startDate: Date.now(),
        nextBillingDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
        trialEnd: null
      };

      // Store subscription
      this.storeSubscription(subscription);

      // Update user tier
      this.updateUserTier(tier);

      // Track subscription creation
      this.trackPaymentEvent('subscription_created', subscription);

      return {
        success: true,
        subscription
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId) {
    try {
      const subscriptions = this.getStoredSubscriptions();
      const index = subscriptions.findIndex(s => s.id === subscriptionId);

      if (index === -1) {
        throw new Error('Subscription not found');
      }

      subscriptions[index].status = 'canceled';
      subscriptions[index].canceledAt = Date.now();

      localStorage.setItem('cosmic_subscriptions', JSON.stringify(subscriptions));

      // Downgrade to free tier
      this.updateUserTier('free');

      // Track cancellation
      this.trackPaymentEvent('subscription_canceled', {
        subscriptionId,
        tier: subscriptions[index].tier
      });

      return {
        success: true,
        subscription: subscriptions[index]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId, newTier) {
    try {
      const subscriptions = this.getStoredSubscriptions();
      const index = subscriptions.findIndex(s => s.id === subscriptionId);

      if (index === -1) {
        throw new Error('Subscription not found');
      }

      const tierPricing = this.getTierPricing(newTier);
      const oldTier = subscriptions[index].tier;

      subscriptions[index].tier = newTier;
      subscriptions[index].amount = tierPricing.price;
      subscriptions[index].updatedAt = Date.now();

      localStorage.setItem('cosmic_subscriptions', JSON.stringify(subscriptions));

      // Update user tier
      this.updateUserTier(newTier);

      // Track update
      this.trackPaymentEvent('subscription_updated', {
        subscriptionId,
        oldTier,
        newTier
      });

      return {
        success: true,
        subscription: subscriptions[index]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get tier pricing
   */
  getTierPricing(tier) {
    const pricing = {
      free: { price: 0, interval: 'month', features: ['5 sections', '5 chats/day'] },
      premium: { price: 9.99, interval: 'month', features: ['All sections', '25 chats/day', 'Priority support'] },
      pro: { price: 19.99, interval: 'month', features: ['All sections', '100 chats/day', 'Priority support', 'Advanced analytics'] }
    };

    return pricing[tier] || pricing.free;
  }

  /**
   * Get payment history
   */
  getPaymentHistory(userId = null) {
    const payments = this.getStoredPayments();
    
    if (userId) {
      return payments.filter(p => p.userId === userId);
    }
    
    return payments;
  }

  /**
   * Get subscription status
   */
  getSubscriptionStatus() {
    const subscriptions = this.getStoredSubscriptions();
    const activeSubscription = subscriptions.find(s => s.status === 'active');
    
    return activeSubscription || null;
  }

  /**
   * Store payment
   */
  storePayment(payment) {
    const payments = this.getStoredPayments();
    payments.push({
      ...payment,
      userId: this.getCurrentUserId()
    });

    localStorage.setItem('cosmic_payments', JSON.stringify(payments));
  }

  /**
   * Get stored payments
   */
  getStoredPayments() {
    return JSON.parse(localStorage.getItem('cosmic_payments') || '[]');
  }

  /**
   * Store subscription
   */
  storeSubscription(subscription) {
    const subscriptions = this.getStoredSubscriptions();
    subscriptions.push({
      ...subscription,
      userId: this.getCurrentUserId()
    });

    localStorage.setItem('cosmic_subscriptions', JSON.stringify(subscriptions));
  }

  /**
   * Get stored subscriptions
   */
  getStoredSubscriptions() {
    return JSON.parse(localStorage.getItem('cosmic_subscriptions') || '[]');
  }

  /**
   * Update user tier
   */
  updateUserTier(tier) {
    localStorage.setItem('userTier', tier);
    
    // Update in user record
    const token = localStorage.getItem('cosmic_auth_token');
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const users = JSON.parse(localStorage.getItem('cosmic_users') || '[]');
      const userIndex = users.findIndex(u => u.id === payload.userId);
      
      if (userIndex !== -1) {
        users[userIndex].tier = tier;
        localStorage.setItem('cosmic_users', JSON.stringify(users));
      }
    }
  }

  /**
   * Get current user ID
   */
  getCurrentUserId() {
    const token = localStorage.getItem('cosmic_auth_token');
    if (!token) return 'anonymous';

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return 'anonymous';
    }
  }

  /**
   * Track payment event
   */
  trackPaymentEvent(eventName, data) {
    const event = {
      eventId: 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      eventName,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
      ...data
    };

    const events = JSON.parse(localStorage.getItem('cosmic_payment_events') || '[]');
    events.push(event);

    if (events.length > 1000) {
      events.shift();
    }

    localStorage.setItem('cosmic_payment_events', JSON.stringify(events));
  }

  /**
   * Simulate payment delay
   */
  simulatePayment(delay = 1500) {
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Validate payment amount
   */
  validatePaymentAmount(amount) {
    return amount > 0 && amount <= 999999.99;
  }

  /**
   * Format currency
   */
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency
    }).format(amount);
  }

  /**
   * Get payment summary
   */
  getPaymentSummary(timeRange = 30 * 24 * 60 * 60 * 1000) {
    const payments = this.getStoredPayments();
    const cutoffTime = Date.now() - timeRange;
    const recentPayments = payments.filter(p => p.timestamp > cutoffTime);

    return {
      totalPayments: recentPayments.length,
      totalRevenue: recentPayments.reduce((sum, p) => sum + p.amount, 0),
      successfulPayments: recentPayments.filter(p => p.status === 'succeeded').length,
      failedPayments: recentPayments.filter(p => p.status === 'failed').length,
      averagePayment: recentPayments.length > 0 
        ? recentPayments.reduce((sum, p) => sum + p.amount, 0) / recentPayments.length 
        : 0,
      byProvider: {
        stripe: recentPayments.filter(p => p.provider === 'stripe').length,
        braintree: recentPayments.filter(p => p.provider === 'braintree').length
      },
      byTier: {
        premium: recentPayments.filter(p => p.tier === 'premium').length,
        pro: recentPayments.filter(p => p.tier === 'pro').length
      }
    };
  }
}

export default new PaymentService();
