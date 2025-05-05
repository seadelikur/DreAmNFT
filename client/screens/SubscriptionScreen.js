// screens/SubscriptionScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import SubscriptionService from '../services/SubscriptionService';
import { AppContext } from '../AppContext';
import Colors from '../constants/Colors';
import Dimensions from '../constants/Dimensions';

export default function SubscriptionScreen({ navigation }) {
  const { userState } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, subscriptionData] = await Promise.all([
        SubscriptionService.getSubscriptionPlans(),
        SubscriptionService.getUserSubscription(userState.user.uid)
      ]);

      setPlans(plansData);
      setCurrentSubscription(subscriptionData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load subscription information');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      setProcessing(true);

      // In a real app, you would integrate with a payment provider here
      // For this example, we'll just simulate subscription

      Alert.alert(
        'Confirm Subscription',
        'Would you like to subscribe to this plan? (This is a demo)',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setProcessing(false)
          },
          {
            text: 'Subscribe',
            onPress: async () => {
              try {
                // Simulate payment method ID
                const paymentMethodId = 'mock_payment_' + Date.now();

                await SubscriptionService.subscribeToPlan(
                  userState.user.uid,
                  planId,
                  paymentMethodId
                );

                Alert.alert('Success', 'Successfully subscribed to the plan');
                fetchData();
              } catch (error) {
                Alert.alert('Error', 'Failed to subscribe: ' + error.message);
              } finally {
                setProcessing(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process subscription');
      setProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setProcessing(true);

      Alert.alert(
        'Confirm Cancellation',
        'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period.',
        [
          {
            text: 'No, Keep Subscription',
            style: 'cancel',
            onPress: () => setProcessing(false)
          },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: async () => {
              try {
                await SubscriptionService.cancelSubscription(
                  userState.user.uid,
                  currentSubscription.id
                );

                Alert.alert('Success', 'Your subscription has been canceled');
                fetchData();
              } catch (error) {
                Alert.alert('Error', 'Failed to cancel subscription: ' + error.message);
              } finally {
                setProcessing(false);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to process cancellation');
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading subscription information...</Text>
      </SafeAreaView>
    );
  }

  const renderFeature = (feature, included) => (
    <View style={styles.featureRow}>
      <MaterialCommunityIcons
        name={included ? 'check-circle' : 'close-circle'}
        size={20}
        color={included ? Colors.success : Colors.error}
      />
      <Text style={styles.featureText}>{feature}</Text>
    </View>
  );

  const renderPlanCard = ({ item }) => {
    const isCurrentPlan = currentSubscription && currentSubscription.planId === item.id;

    return (
      <View style={[styles.planCard, isCurrentPlan && styles.currentPlanCard]}>
        {isCurrentPlan && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>CURRENT</Text></View>}
        <Text style={styles.planName}>{item.name}</Text>
        <Text style={styles.planPrice}>${item.price}/{item.billingPeriod}</Text>
        <View style={styles.planFeatures}>
          {renderFeature(`Record up to ${item.features.maxDreamsPerDay} dreams daily`, true)}
          {renderFeature('AI-generated dream images', item.features.aiImageGeneration)}
          {renderFeature('Advanced dream analytics', item.features.advancedAnalytics)}
          {renderFeature('Ad-free experience', item.features.adsRemoved)}
          {renderFeature('Priority NFT minting', item.features.priorityMinting)}
        </View>

        {!isCurrentPlan ? (
          <TouchableOpacity
            style={styles.subscribeButton}
            onPress={() => handleSubscribe(item.id)}
            disabled={processing}
          >
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelSubscription}
            disabled={processing}
          >
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Premium Plans</Text>
      <Text style={styles.subtitle}>Upgrade to unlock more dream features</Text>

      {processing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color={Colors.white} />
          <Text style={styles.processingText}>Processing...</Text>
        </View>
      )}

      <FlatList
        data={plans}
        renderItem={renderPlanCard}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.plansList}
      />

      <View style={styles.currentPlanInfo}>
        <Text style={styles.currentPlanTitle}>Your current plan:</Text>
        <Text style={styles.currentPlanName}>
          {currentSubscription?.planName || 'Free Plan'}
        </Text>
        {currentSubscription?.validUntil && (
          <Text style={styles.validUntil}>
            Valid until: {new Date(currentSubscription.validUntil.toDate()).toLocaleDateString()}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Dimensions.padding.medium
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background
  },
  loadingText: {
    marginTop: 16,
    fontSize: Dimensions.fontSize.medium,
    color: Colors.text.primary
  },
  title: {
    fontSize: Dimensions.fontSize.title,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: Dimensions.fontSize.medium,
    color: Colors.text.secondary,
    marginBottom: 24
  },
  plansList: {
    paddingBottom: 20
  },
  planCard: {
    backgroundColor: Colors.white,
    borderRadius: Dimensions.borderRadius.large,
    padding: Dimensions.padding.large,
    marginBottom: 20,
    ...Dimensions.shadows.medium
  },
  currentPlanCard: {
    borderColor: Colors.primary,
    borderWidth: 2
  },
  currentBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Dimensions.borderRadius.small
  },
  currentBadgeText: {
    color: Colors.white,
    fontSize: Dimensions.fontSize.small,
    fontWeight: 'bold'
  },
  planName: {
    fontSize: Dimensions.fontSize.large,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8
  },
  planPrice: {
    fontSize: Dimensions.fontSize.extraLarge,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16
  },
  planFeatures: {
    marginBottom: 20
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  featureText: {
    fontSize: Dimensions.fontSize.regular,
    color: Colors.text.primary,
    marginLeft: 10
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Dimensions.borderRadius.medium,
    alignItems: 'center'
  },
  subscribeButtonText: {
    color: Colors.white,
    fontSize: Dimensions.fontSize.medium,
    fontWeight: 'bold'
  },
  cancelButton: {
    backgroundColor: Colors.lightGray,
    paddingVertical: 12,
    borderRadius: Dimensions.borderRadius.medium,
    alignItems: 'center'
  },
  cancelButtonText: {
    color: Colors.error,
    fontSize: Dimensions.fontSize.medium,
    fontWeight: 'bold'
  },
  currentPlanInfo: {
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: Dimensions.borderRadius.medium,
    marginTop: 10
  },
  currentPlanTitle: {
    fontSize: Dimensions.fontSize.regular,
    color: Colors.text.secondary,
    marginBottom: 4
  },
  currentPlanName: {
    fontSize: Dimensions.fontSize.medium,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4
  },
  validUntil: {
    fontSize: Dimensions.fontSize.small,
    color: Colors.text.secondary
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  processingText: {
    color: Colors.white,
    fontSize: Dimensions.fontSize.medium,
    marginTop: 16
  }
});