// src/screens/DreamAnalysisScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { colors, fonts } from '../styles/theme';
import { analyzeDreamContent } from '../utils/aiUtils';
import { getDreamHistory } from '../services/firestoreService';
import { useApp } from '../context/AppContext';

const { width: screenWidth } = Dimensions.get('window');

const DreamAnalysisScreen = ({ route, navigation }) => {
  const { dream } = route.params || {};
  const { userProfile } = useApp();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [dreamStats, setDreamStats] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('insights');

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        setLoading(true);

        // Analyze the current dream
        if (dream && dream.description) {
          const result = await analyzeDreamContent(dream.description);

          if (result.success) {
            setAnalysis(result.analysis);
          } else {
            throw new Error('Failed to analyze dream');
          }
        }

        // Get dream history statistics
        if (userProfile && userProfile.uid) {
          const { success, dreams } = await getDreamHistory(userProfile.uid);

          if (success && dreams.length > 0) {
            processHistoricalData(dreams);
          }
        }
      } catch (err) {
        console.error('Error analyzing dream:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAnalysis();
  }, [dream, userProfile]);

  const processHistoricalData = (dreams) => {
    // Extract dream frequencies by month
    const dreamCountByMonth = {};
    const emotions = {};
    const themes = {};
    const lastSixMonths = [];

    // Get last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });

      dreamCountByMonth[monthKey] = 0;
      lastSixMonths.unshift({
        key: monthKey,
        label: monthLabel
      });
    }

    // Process dreams
    dreams.forEach(dream => {
      // Count dreams by month
      const createdAt = new Date(dream.createdAt);
      const monthKey = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;

      if (dreamCountByMonth[monthKey] !== undefined) {
        dreamCountByMonth[monthKey]++;
      }

      // Count emotions
      if (dream.emotions && dream.emotions.length) {
        dream.emotions.forEach(emotion => {
          emotions[emotion] = (emotions[emotion] || 0) + 1;
        });
      }

      // Count themes
      if (dream.tags && dream.tags.length) {
        dream.tags.forEach(tag => {
          themes[tag] = (themes[tag] || 0) + 1;
        });
      }
    });

    // Prepare chart data
    const dreamFrequencyData = {
      labels: lastSixMonths.map(m => m.label),
      datasets: [
        {
          data: lastSixMonths.map(m => dreamCountByMonth[m.key]),
          color: (opacity = 1) => `rgba(86, 130, 255, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Dreams per Month']
    };

    // Prepare emotion data for pie chart
    const topEmotions = Object.entries(emotions)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const emotionChartData = topEmotions.map(([emotion, count], index) => {
      const colors = [
        '#FF6384', // red
        '#36A2EB', // blue
        '#FFCE56', // yellow
        '#4BC0C0', // teal
        '#9966FF', // purple
        '#FF9F40'  // orange
      ];

      return {
        name: emotion,
        count,
        color: colors[index % colors.length],
        legendFontColor: colors.text,
        legendFontSize: 12
      };
    });

    // Prepare top themes
    const topThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([theme, count]) => ({ theme, count }));

    setDreamStats({
      dreamFrequency: dreamFrequencyData,
      emotionStats: emotionChartData,
      topThemes,
      totalDreams: dreams.length,
      averageDreamsPerMonth: Object.values(dreamCountByMonth).reduce((sum, count) => sum + count, 0) / 6
    });
  };

  const renderInsightsTab = () => {
    if (!analysis) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Summary</Text>
          <Text style={styles.summaryText}>{analysis.summary}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Themes</Text>
          <View style={styles.tagsContainer}>
            {analysis.themes.map((theme, index) => (
              <View key={index} style={styles.tagItem}>
                <Text style={styles.tagText}>{theme}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotional Content</Text>
          <View style={styles.tagsContainer}>
            {analysis.emotions.map((emotion, index) => (
              <View key={index} style={[styles.tagItem, styles.emotionTag]}>
                <Text style={styles.tagText}>{emotion}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Symbols</Text>
          {analysis.symbols.map((symbol, index) => (
            <View key={index} style={styles.symbolItem}>
              <Text style={styles.symbolName}>{symbol.symbol}</Text>
              <Text style={styles.symbolMeaning}>{symbol.meaning}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {analysis.insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <Ionicons name="bulb-outline" size={20} color={colors.primary} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderStatisticsTab = () => {
    if (!dreamStats) return null;

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dream Frequency</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={dreamStats.dreamFrequency}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(86, 130, 255, ${opacity})`,
                labelColor: (opacity = 1) => colors.text,
                style: {
                  borderRadius: 16
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: colors.primary
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
          <View style={styles.statsInfoContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dreamStats.totalDreams}</Text>
              <Text style={styles.statLabel}>Total Dreams</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dreamStats.averageDreamsPerMonth.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Avg Dreams/Month</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emotional Patterns</Text>
          {dreamStats.emotionStats.length > 0 ? (
            <View style={styles.chartContainer}>
              <PieChart
                data={dreamStats.emotionStats}
                width={screenWidth - 40}
                height={200}
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor="count"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          ) : (
            <Text style={styles.noDataText}>No emotional data available</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recurring Themes</Text>
          {dreamStats.topThemes.length > 0 ? (
            <View style={styles.themesContainer}>
              {dreamStats.topThemes.map((item, index) => (
                <View key={index} style={styles.themeItem}>
                  <View style={styles.themeBar}>
                    <View
                      style={[
                        styles.themeBarFill,
                        { width: `${(item.count / dreamStats.topThemes[0].count) * 100}%` }
                      ]}
                    />
                  </View>
                  <View style={styles.themeLabels}>
                    <Text style={styles.themeText}>{item.theme}</Text>
                    <Text style={styles.themeCount}>{item.count}</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No theme data available</Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Analyzing your dreams...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={colors.error} />
        <Text style={styles.errorTitle}>Analysis Failed</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'insights' && styles.activeTabButton]}
          onPress={() => setActiveTab('insights')}
        >
          <Ionicons
            name="bulb-outline"
            size={20}
            color={activeTab === 'insights' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'insights' && styles.activeTabButtonText
            ]}
          >
            Insights
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'statistics' && styles.activeTabButton]}
          onPress={() => setActiveTab('statistics')}
        >
          <Ionicons
            name="stats-chart-outline"
            size={20}
            color={activeTab === 'statistics' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'statistics' && styles.activeTabButtonText
            ]}
          >
            Statistics
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'insights' ? renderInsightsTab() : renderStatisticsTab()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.text,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.error,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  tabButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.textSecondary,
  },
  activeTabButtonText: {
    color: colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  tagItem: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  emotionTag: {
    backgroundColor: colors.secondary,
  },
  tagText: {
    color: 'white',
    fontSize: 14,
    fontFamily: fonts.medium,
  },
  symbolItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  symbolName: {
    fontSize: 16,
    fontFamily: fonts.semiBold,
    color: colors.text,
    marginBottom: 4,
  },
  symbolMeaning: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  insightText: {
    flex: 1,
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
  },
  chartContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  statsInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    marginTop: 4,
  },
  themesContainer: {
    marginTop: 8,
  },
  themeItem: {
    marginBottom: 12,
  },
  themeBar: {
    height: 8,
    backgroundColor: colors.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  themeBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  themeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  themeText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.text,
  },
  themeCount: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
  },
  noDataText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default DreamAnalysisScreen;