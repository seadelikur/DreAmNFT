// screens/DreamAnalyticsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { firestore, auth } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const { width } = Dimensions.get('window');

const DreamAnalyticsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [dreams, setDreams] = useState([]);
  const [timeRange, setTimeRange] = useState('6months'); // '1month', '3months', '6months', '1year'
  const [chartType, setChartType] = useState('frequency'); // 'frequency', 'emotions', 'tags', 'rarity'

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (currentUser) {
      loadDreams();
    }
  }, [currentUser, timeRange]);

  const loadDreams = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // Calculate date range based on selected time range
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case '1month':
          startDate = subMonths(now, 1);
          break;
        case '3months':
          startDate = subMonths(now, 3);
          break;
        case '6months':
          startDate = subMonths(now, 6);
          break;
        case '1year':
          startDate = subMonths(now, 12);
          break;
        default:
          startDate = subMonths(now, 6);
      }

      const dreamsQuery = query(
        collection(firestore, 'dreams'),
        where('userId', '==', currentUser.uid),
        where('createdAt', '>=', startDate)
      );

      const snapshot = await getDocs(dreamsQuery);

      if (!snapshot.empty) {
        const dreamsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()
        }));

        setDreams(dreamsData);
      } else {
        setDreams([]);
      }
    } catch (error) {
      console.error('Error loading dreams:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyData = () => {
    if (dreams.length === 0) return null;

    const now = new Date();
    const months = [];
    const dreamCounts = [];

    // Determine how many months to show based on time range
    let monthCount;
    switch (timeRange) {
      case '1month':
        monthCount = 1;
        break;
      case '3months':
        monthCount = 3;
        break;
      case '6months':
        monthCount = 6;
        break;
      case '1year':
        monthCount = 12;
        break;
      default:
        monthCount = 6;
    }

    // Generate labels and initialize counts
    for (let i = monthCount - 1; i >= 0; i--) {
      const month = subMonths(now, i);
      months.push(format(month, 'MMM'));
      dreamCounts.push(0);
    }

    // Count dreams per month
    dreams.forEach(dream => {
      if (dream.createdAt) {
        const dreamMonth = format(dream.createdAt, 'MMM');
        const index = months.indexOf(dreamMonth);
        if (index !== -1) {
          dreamCounts[index]++;
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          data: dreamCounts,
          color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Dream Frequency']
    };
  };

  const getEmotionsData = () => {
    if (dreams.length === 0) return null;

    // Count emotions
    const emotions = {
      happy: 0,
      sad: 0,
      scared: 0,
      angry: 0,
      confused: 0,
      peaceful: 0
    };

    dreams.forEach(dream => {
      if (dream.emotions && Array.isArray(dream.emotions)) {
        dream.emotions.forEach(emotion => {
          if (emotions[emotion] !== undefined) {
            emotions[emotion]++;
          }
        });
      }
    });

    // Convert to chart data
    const data = Object.entries(emotions)
      .filter(([_, count]) => count > 0)
      .map(([emotion, count]) => ({
        name: emotion.charAt(0).toUpperCase() + emotion.slice(1),
        count,
        color: getEmotionColor(emotion),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }));

    return data.length > 0 ? data : null;
  };

  const getTagsData = () => {
    if (dreams.length === 0) return null;

    // Count tags
    const tagCounts = {};

    dreams.forEach(dream => {
      if (dream.tags && Array.isArray(dream.tags)) {
        dream.tags.forEach(tag => {
          if (tagCounts[tag]) {
            tagCounts[tag]++;
          } else {
            tagCounts[tag] = 1;
          }
        });
      }
    });

    // Sort tags by count and take top 5
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    if (topTags.length === 0) return null;

    return {
      labels: topTags.map(([tag]) => tag),
      datasets: [
        {
          data: topTags.map(([_, count]) => count),
          color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Top Tags']
    };
  };

  const getRarityData = () => {
    if (dreams.length === 0) return null;

    // Count dreams by rarity
    const rarities = {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    };

    dreams.forEach(dream => {
      if (dream.rarity && rarities[dream.rarity] !== undefined) {
        rarities[dream.rarity]++;
      }
    });

    // Convert to chart data
    const data = Object.entries(rarities)
      .filter(([_, count]) => count > 0)
      .map(([rarity, count]) => ({
        name: rarity.charAt(0).toUpperCase() + rarity.slice(1),
        count,
        color: getRarityColor(rarity),
        legendFontColor: '#7F7F7F',
        legendFontSize: 12
      }));

    return data.length > 0 ? data : null;
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'happy':
        return '#4caf50';
      case 'sad':
        return '#2196f3';
      case 'scared':
        return '#9c27b0';
      case 'angry':
        return '#f44336';
      case 'confused':
        return '#ff9800';
      case 'peaceful':
        return '#00bcd4';
      default:
        return '#6200ee';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#78909c';
      case 'uncommon':
        return '#4caf50';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#f44336';
      default:
        return '#6200ee';
    }
  };

  const renderChart = () => {
    if (dreams.length === 0) {
      return (
        <View style={styles.noDataContainer}>
          <MaterialCommunityIcons name="chart-line" size={60} color="#ccc" />
          <Text style={styles.noDataText}>No dream data available</Text>
          <Text style={styles.noDataSubtext}>
            Record more dreams to see analytics
          </Text>
        </View>
      );
    }

    const chartConfig = {
      backgroundGradientFrom: '#fff',
      backgroundGradientTo: '#fff',
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(98, 0, 238, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: '#6200ee'
      }
    };

    switch (chartType) {
      case 'frequency': {
        const data = getFrequencyData();
        if (!data) return null;

        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Dream Frequency</Text>
            <LineChart
              data={data}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
            <Text style={styles.chartDescription}>
              Number of dreams recorded per month
            </Text>
          </View>
        );
      }

      case 'emotions': {
        const data = getEmotionsData();
        if (!data) return null;

        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Emotional Themes</Text>
            <PieChart
              data={data}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <Text style={styles.chartDescription}>
              Distribution of emotions in your dreams
            </Text>
          </View>
        );
      }

      case 'tags': {
        const data = getTagsData();
        if (!data) return null;

        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Top Dream Tags</Text>
            <BarChart
              data={data}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              style={styles.chart}
              verticalLabelRotation={30}
            />
            <Text style={styles.chartDescription}>
              Most frequent tags in your dreams
            </Text>
          </View>
        );
      }

      case 'rarity': {
        const data = getRarityData();
        if (!data) return null;

        return (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Dream Rarity</Text>
            <PieChart
              data={data}
              width={width - 32}
              height={220}
              chartConfig={chartConfig}
              accessor="count"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
            <Text style={styles.chartDescription}>
              Distribution of dream rarity levels
            </Text>
          </View>
        );
      }

      default:
        return null;
    }
  };

  const renderStats = () => {
    if (dreams.length === 0) return null;

    // Calculate stats
    const totalDreams = dreams.length;
    const nftDreams = dreams.filter(dream => dream.isNFT).length;
    const avgDreamsPerMonth = totalDreams / (timeRange === '1month' ? 1 :
                                            timeRange === '3months' ? 3 :
                                            timeRange === '6months' ? 6 : 12);

    // Find most common tag
    const tagCounts = {};
    dreams.forEach(dream => {
      if (dream.tags && Array.isArray(dream.tags)) {
        dream.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    const mostCommonTag = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'None';

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalDreams}</Text>
          <Text style={styles.statLabel}>Total Dreams</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{nftDreams}</Text>
          <Text style={styles.statLabel}>NFT Dreams</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{avgDreamsPerMonth.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Avg/Month</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>{mostCommonTag}</Text>
          <Text style={styles.statLabel}>Top Tag</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dream Analytics</Text>
      </View>

      <View style={styles.timeRangeContainer}>
        <TouchableOpacity
          style={[styles.timeButton, timeRange === '1month' && styles.activeTimeButton]}
          onPress={() => setTimeRange('1month')}
        >
          <Text
            style={[
              styles.timeButtonText,
              timeRange === '1month' && styles.activeTimeButtonText
            ]}
          >
            1M
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, timeRange === '3months' && styles.activeTimeButton]}
          onPress={() => setTimeRange('3months')}
        >
          <Text
            style={[
              styles.timeButtonText,
              timeRange === '3months' && styles.activeTimeButtonText
            ]}
          >
            3M
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, timeRange === '6months' && styles.activeTimeButton]}
          onPress={() => setTimeRange('6months')}
        >
          <Text
            style={[
              styles.timeButtonText,
              timeRange === '6months' && styles.activeTimeButtonText
            ]}
          >
            6M
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, timeRange === '1year' && styles.activeTimeButton]}
          onPress={() => setTimeRange('1year')}
        >
          <Text
            style={[
              styles.timeButtonText,
              timeRange === '1year' && styles.activeTimeButtonText
            ]}
          >
            1Y
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <>
          {renderStats()}

          <View style={styles.chartTypeContainer}>
            <TouchableOpacity
              style={[styles.typeButton, chartType === 'frequency' && styles.activeTypeButton]}
              onPress={() => setChartType('frequency')}
            >
              <MaterialCommunityIcons
                name="chart-line"
                size={20}
                color={chartType === 'frequency' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  chartType === 'frequency' && styles.activeTypeButtonText
                ]}
              >
                Frequency
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, chartType === 'emotions' && styles.activeTypeButton]}
              onPress={() => setChartType('emotions')}
            >
              <MaterialCommunityIcons
                name="emoticon-outline"
                size={20}
                color={chartType === 'emotions' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  chartType === 'emotions' && styles.activeTypeButtonText
                ]}
              >
                Emotions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, chartType === 'tags' && styles.activeTypeButton]}
              onPress={() => setChartType('tags')}
            >
              <Ionicons
                name="pricetags-outline"
                size={20}
                color={chartType === 'tags' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  chartType === 'tags' && styles.activeTypeButtonText
                ]}
              >
                Tags
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, chartType === 'rarity' && styles.activeTypeButton]}
              onPress={() => setChartType('rarity')}
            >
              <MaterialCommunityIcons
                name="diamond-outline"
                size={20}
                color={chartType === 'rarity' ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.typeButtonText,
                  chartType === 'rarity' && styles.activeTypeButtonText
                ]}
              >
                Rarity
              </Text>
            </TouchableOpacity>
          </View>

          {renderChart()}

          <View style={styles.insightsContainer}>
            <Text style={styles.insightsTitle}>Dream Insights</Text>

            {dreams.length > 0 ? (
              <>
                <View style={styles.insightItem}>
                  <MaterialCommunityIcons name="sleep" size={24} color="#6200ee" style={styles.insightIcon} />
                  <View style={styles.insightContent}>
                    <Text style={styles.insightText}>
                      You've recorded {dreams.length} dreams in the past {
                        timeRange === '1month' ? 'month' :
                        timeRange === '3months' ? '3 months' :
                        timeRange === '6months' ? '6 months' : 'year'
                      }.
                    </Text>
                  </View>
                </View>

                {dreams.filter(dream => dream.isNFT).length > 0 && (
                  <View style={styles.insightItem}>
                    <MaterialCommunityIcons name="ethereum" size={24} color="#6200ee" style={styles.insightIcon} />
                    <View style={styles.insightContent}>
                      <Text style={styles.insightText}>
                        You've minted {dreams.filter(dream => dream.isNFT).length} dreams as NFTs.
                      </Text>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.moreInsightsButton}
                  onPress={() => navigation.navigate('DreamPatterns')}
                >
                  <Text style={styles.moreInsightsText}>View Detailed Patterns</Text>
                  <Ionicons name="chevron-forward" size={20} color="#6200ee" />
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.noInsightsText}>
                Record more dreams to unlock insights about your dream patterns
              </Text>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  timeRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  timeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTimeButton: {
    backgroundColor: '#6200ee',
  },
  timeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTimeButtonText: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200ee',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  chartTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeTypeButton: {
    backgroundColor: '#6200ee',
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginLeft: 4,
  },
  activeTypeButtonText: {
    color: '#fff',
  },
  chartContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  chart: {
    borderRadius: 16,
  },
  chartDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 16,
    alignSelf: 'flex-start',
  },
  noDataContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  insightsContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  insightIcon: {
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  noInsightsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  moreInsightsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  moreInsightsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6200ee',
    marginRight: 4,
  },
});

export default DreamAnalyticsScreen;