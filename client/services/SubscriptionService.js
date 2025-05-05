// services/SubscriptionService.js
import { firebase } from '../firebase';
import 'firebase/firestore';
import 'firebase/functions';

class SubscriptionService {
  constructor() {
    this.db = firebase.firestore();
    this.functions = firebase.functions();
  }

  // Get available subscription plans
  async getSubscriptionPlans() {
    try {
      const plansSnapshot = await this.db.collection('subscriptionPlans').get();

      const plans = [];
      plansSnapshot.forEach(doc => {
        plans.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return plans;
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
      throw error;
    }
  }

  // Get user's current subscription
  async getUserSubscription(userId) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();

      if (!userData.subscriptionId) {
        return {
          status: 'free',
          features: {
            maxDreamsPerDay: 3,
            aiImageGeneration: false,
            advancedAnalytics: false,
            adsRemoved: false,
            priorityMinting: false
          }
        };
      }

      const subscriptionDoc = await this.db.collection('subscriptions').doc(userData.subscriptionId).get();

      if (!subscriptionDoc.exists) {
        return {
          status: 'free',
          features: {
            maxDreamsPerDay: 3,
            aiImageGeneration: false,
            advancedAnalytics: false,
            adsRemoved: false,
            priorityMinting: false
          }
        };
      }

      return {
        id: subscriptionDoc.id,
        ...subscriptionDoc.data()
      };
    } catch (error) {
      console.error('Failed to fetch user subscription:', error);
      throw error;
    }
  }

  // Subscribe user to a plan
  async subscribeToPlan(userId, planId, paymentMethodId) {
    try {
      // Call Cloud Function to handle payment and subscription
      const createSubscription = this.functions.httpsCallable('createSubscription');

      const result = await createSubscription({
        userId,
        planId,
        paymentMethodId
      });

      return result.data;
    } catch (error) {
      console.error('Failed to subscribe to plan:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(userId, subscriptionId) {
    try {
      // Call Cloud Function to handle subscription cancellation
      const cancelSubscription = this.functions.httpsCallable('cancelSubscription');

      const result = await cancelSubscription({
        userId,
        subscriptionId
      });

      return result.data;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      throw error;
    }
  }

  // Check if user has specific premium feature
  async hasFeature(userId, featureName) {
    try {
      const subscription = await this.getUserSubscription(userId);

      return subscription.features && subscription.features[featureName] === true;
    } catch (error) {
      console.error(`Failed to check feature ${featureName}:`, error);
      return false;
    }
  }

  // Get user's feature limits (e.g., dreams per day)
  async getFeatureLimit(userId, limitName) {
    try {
      const subscription = await this.getUserSubscription(userId);

      if (subscription.features && subscription.features[limitName]) {
        return subscription.features[limitName];
      }

      // Default limits
      const defaultLimits = {
        maxDreamsPerDay: 3,
        maxAiImagesPerMonth: 0,
        maxStorageGB: 1
      };

      return defaultLimits[limitName] || 0;
    } catch (error) {
      console.error(`Failed to check limit ${limitName}:`, error);

      // Fallback to free tier limits
      const defaultLimits = {
        maxDreamsPerDay: 3,
        maxAiImagesPerMonth: 0,
        maxStorageGB: 1
      };

      return defaultLimits[limitName] || 0;
    }
  }
}

export default new SubscriptionService();