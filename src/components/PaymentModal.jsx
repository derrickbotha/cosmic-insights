import React, { useState, useEffect } from 'react';
import paymentService from '../services/paymentService';
import analyticsService from '../services/analyticsService';

/**
 * PaymentModal Component
 * Handles subscription payments through Stripe or Braintree
 */
const PaymentModal = ({ show, onClose, tier, currentTier }) => {
  const [paymentProvider, setPaymentProvider] = useState('stripe');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const tierPricing = paymentService.getTierPricing(tier);

  useEffect(() => {
    if (show) {
      // Track modal open
      analyticsService.trackEvent('payment_modal_opened', { tier, provider: paymentProvider });
    }
  }, [show, tier, paymentProvider]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // Validate inputs
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        throw new Error('Please fill in all card details');
      }

      // Track payment attempt
      analyticsService.trackEvent('payment_attempted', { 
        tier, 
        provider: paymentProvider,
        amount: tierPricing.price 
      });

      let result;
      if (paymentProvider === 'stripe') {
        result = await paymentService.processStripePayment(
          'pm_demo_' + Date.now(),
          tierPricing.price,
          tier
        );
      } else {
        result = await paymentService.processBraintreePayment(
          'nonce_demo_' + Date.now(),
          tierPricing.price,
          tier
        );
      }

      if (result.success) {
        // Create subscription
        await paymentService.createSubscription(
          tier,
          paymentProvider,
          result.payment.paymentMethodId || result.payment.nonce
        );

        setSuccess(true);
        
        // Track successful payment
        analyticsService.trackConversion('subscription', tierPricing.price, {
          tier,
          provider: paymentProvider
        });

        setTimeout(() => {
          onClose(true); // Pass true to indicate success
          window.location.reload(); // Reload to update tier
        }, 2000);
      } else {
        throw new Error(result.error || 'Payment failed');
      }
    } catch (err) {
      setError(err.message);
      analyticsService.trackEvent('payment_failed', { 
        tier, 
        provider: paymentProvider,
        error: err.message 
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.slice(0, 2) + '/' + v.slice(2, 4);
    }
    return v;
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upgrade to {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                ${tierPricing.price.toFixed(2)}/month - Cancel anytime
              </p>
            </div>
            <button
              onClick={() => onClose(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            // Success Message
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your subscription has been activated. Redirecting...
              </p>
            </div>
          ) : (
            <>
              {/* Features */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-6 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">What's included:</h3>
                <ul className="space-y-2">
                  {tierPricing.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Payment Provider Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentProvider('stripe')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentProvider === 'stripe'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <path d="M13.5 13.5C13.5 14.88 12.38 16 11 16C9.62 16 8.5 14.88 8.5 13.5C8.5 12.12 9.62 11 11 11C12.38 11 13.5 12.12 13.5 13.5Z" fill="#635BFF"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Stripe</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentProvider('braintree')}
                    className={`p-4 border-2 rounded-xl transition-all ${
                      paymentProvider === 'braintree'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" fill="#00A4DB"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Braintree</p>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    required
                    maxLength="19"
                    placeholder="4242 4242 4242 4242"
                    className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Expiry and CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      required
                      maxLength="5"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      CVC
                    </label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      required
                      maxLength="4"
                      placeholder="123"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full py-3 px-6 bg-gradient-to-r from-primary to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </div>
                  ) : (
                    `Pay $${tierPricing.price.toFixed(2)}`
                  )}
                </button>

                {/* Security Notice */}
                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4">
                  🔒 Your payment is secure and encrypted. We never store your card details.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
