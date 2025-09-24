import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brandContent: {
    flexDirection: 'column',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  brandSeed: {
    color: '#65A30D',
  },
  brandLing: {
    color: '#1f2937',
  },
  brandDescription: {
    fontSize: 10,
    color: '#6b7280',
    maxWidth: 300,
    lineHeight: 1.4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
  },
  stockOverview: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stockMetrics: {
    flex: 1,
    marginRight: 20,
  },
  stockSymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyName: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stockIntroduction: {
    flex: 1,
  },
  introductionText: {
    fontSize: 11,
    lineHeight: 1.4,
    color: '#374151',
  },
  recommendationSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  recommendationBadge: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  recommendationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  targetPrice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 12,
    marginRight: 5,
  },
  targetValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  analysisContent: {
    flexDirection: 'row',
  },
  sentimentAnalysis: {
    flex: 1,
    marginRight: 20,
  },
  financialRatios: {
    flex: 1,
  },
  analysisSection: {
    marginBottom: 15,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1f2937',
  },
  analysisList: {
    paddingLeft: 10,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.3,
  },
  ratiosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratioItem: {
    width: '50%',
    marginBottom: 8,
  },
  ratioLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 2,
  },
  ratioValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  growthPositive: {
    color: '#65A30D',
  },
  disclaimer: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 5,
  },
  disclaimerText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: '#4b5563',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 15,
  },
  valuationMetrics: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginVertical: 10,
  },
  valuationItem: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 120,
  },
  valuationLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  valuationValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  valuationPositive: {
    color: '#65A30D',
  },
  valuationNegative: {
    color: '#dc2626',
  },
});

export default function ReportPDF({ stockData }) {
  const defaultData = {
    symbol: 'AAPL',
    companyName: 'Apple Inc.',
    currentPrice: 150.25,
    marketCap: '2.45T',
    peRatio: 25.4,
    sector: 'Technology',
    introduction:
      'Apple Inc. is a multinational technology company that designs, develops, and sells consumer electronics, computer software, and online services.',
    recommendation: 'BUY',
    confidence: 'HIGH',
    targetPrice: 175.0,
    strengths: [
      'Strong brand loyalty and ecosystem',
      'Consistent revenue growth',
      'Strong cash position',
      'Innovation leadership in consumer tech',
    ],
    weaknesses: [
      'High dependence on iPhone sales',
      'Premium pricing limits market reach',
      'Regulatory scrutiny in multiple markets',
    ],
    marketPosition:
      'Market leader in premium consumer electronics with strong competitive moats',
    ratios: {
      peRatio: 25.4,
      pbRatio: 8.2,
      psRatio: 6.8,
      deRatio: 1.73,
      roe: 26.4,
      netIncome: 94.3,
      freeCashFlowMargin: 25.8,
      revenueGrowth: 8.1,
      netIncomeGrowth: 5.4,
    },
  };

  const data = stockData || defaultData;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const formatPercent = (value) => {
    return `${value}%`;
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation?.toUpperCase()) {
      case 'BUY':
        return '#65A30D';
      case 'SELL':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandContent}>
            <Text style={styles.brandTitle}>
              <Text style={styles.brandSeed}>Seed</Text>
              <Text style={styles.brandLing}>ling</Text>
            </Text>
            <Text style={styles.brandDescription}>
              Getting you one big step closer to your financial goals by bringing you the most accurate stock findings powered with Perplexity Finance API and our advanced screening methods.
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Stock Overview */}
        <View style={styles.stockOverview}>
          <View style={styles.stockMetrics}>
            <Text style={styles.stockSymbol}>{data.symbol}</Text>
            <Text style={styles.companyName}>{data.companyName}</Text>
            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Current Price</Text>
                <Text style={styles.metricValue}>
                  {formatCurrency(data.currentPrice)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Market Cap</Text>
                <Text style={styles.metricValue}>${data.marketCap}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>P/E Ratio</Text>
                <Text style={styles.metricValue}>{data.peRatio}</Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={styles.metricLabel}>Sector</Text>
                <Text style={styles.metricValue}>{data.sector}</Text>
              </View>
            </View>
          </View>

          <View style={styles.stockIntroduction}>
            <Text style={styles.sectionTitle}>Company Overview</Text>
            <Text style={styles.introductionText}>{data.introduction}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Investment Recommendation */}
        <View style={styles.recommendationSection}>
          <View
            style={[
              styles.recommendationBadge,
              { backgroundColor: getRecommendationColor(data.recommendation) },
            ]}
          >
            <Text style={styles.recommendationText}>
              {data.recommendation} - {data.confidence} CONFIDENCE
            </Text>
          </View>

          <View style={styles.valuationMetrics}>
            {data.upside && (
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>Upside Potential</Text>
                <Text style={[
                  styles.valuationValue,
                  data.upside > 0 ? styles.valuationPositive : styles.valuationNegative
                ]}>
                  {formatPercent(data.upside)}
                </Text>
              </View>
            )}

            {(data.mos || data.marginOfSafety) && (
              <View style={styles.valuationItem}>
                <Text style={styles.valuationLabel}>Margin of Safety</Text>
                <Text style={[
                  styles.valuationValue,
                  (data.mos || data.marginOfSafety) > 0 ? styles.valuationPositive : styles.valuationNegative
                ]}>
                  {formatPercent(data.mos || data.marginOfSafety)}
                </Text>
              </View>
            )}
          </View>

          {data.targetPrice && (
            <View style={styles.targetPrice}>
              <Text style={styles.targetLabel}>12-Month Target Price: </Text>
              <Text style={styles.targetValue}>
                {formatCurrency(data.targetPrice)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        {/* Detailed Analysis */}
        <View style={styles.analysisContent}>
          <View style={styles.sentimentAnalysis}>
            <View style={styles.analysisSection}>
              <Text style={styles.analysisTitle}>Strengths</Text>
              <View style={styles.analysisList}>
                {data.strengths.map((strength, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {strength}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.analysisSection}>
              <Text style={styles.analysisTitle}>Weaknesses</Text>
              <View style={styles.analysisList}>
                {data.weaknesses.map((weakness, index) => (
                  <Text key={index} style={styles.listItem}>
                    • {weakness}
                  </Text>
                ))}
              </View>
            </View>

            <View style={styles.analysisSection}>
              <Text style={styles.analysisTitle}>Market Position</Text>
              <Text style={styles.introductionText}>{data.marketPosition}</Text>
            </View>
          </View>

          <View style={styles.financialRatios}>
            <Text style={styles.analysisTitle}>Key Financial Ratios</Text>
            <View style={styles.ratiosGrid}>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>P/E Ratio</Text>
                <Text style={styles.ratioValue}>{data.ratios.peRatio}</Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>P/B Ratio</Text>
                <Text style={styles.ratioValue}>{data.ratios.pbRatio}</Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>P/S Ratio</Text>
                <Text style={styles.ratioValue}>{data.ratios.psRatio}</Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>D/E Ratio</Text>
                <Text style={styles.ratioValue}>{data.ratios.deRatio}</Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>ROE</Text>
                <Text style={styles.ratioValue}>
                  {formatPercent(data.ratios.roe)}
                </Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>Net Income</Text>
                <Text style={styles.ratioValue}>${data.ratios.netIncome}B</Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>FCF Margin</Text>
                <Text style={styles.ratioValue}>
                  {formatPercent(data.ratios.freeCashFlowMargin)}
                </Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>Revenue Growth</Text>
                <Text style={[styles.ratioValue, styles.growthPositive]}>
                  {formatPercent(data.ratios.revenueGrowth)}
                </Text>
              </View>
              <View style={styles.ratioItem}>
                <Text style={styles.ratioLabel}>Income Growth</Text>
                <Text style={[styles.ratioValue, styles.growthPositive]}>
                  {formatPercent(data.ratios.netIncomeGrowth)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            <Text style={{ fontWeight: 'bold' }}>Disclaimer:</Text> This report is for informational purposes only and should not be considered as investment advice. Past performance does not guarantee future results. Please consult with a qualified financial advisor before making any investment decisions. All data is subject to change and may not reflect real-time market conditions.
          </Text>
        </View>
      </Page>
    </Document>
  );
}