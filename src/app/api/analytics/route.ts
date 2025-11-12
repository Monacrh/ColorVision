// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30'; // days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(timeRange));

    const client = await clientPromise;
    const db = client.db('colorvision_db');
    const collection = db.collection('test_results');

    // Total Tests
    const totalTests = await collection.countDocuments({
      testDate: { $gte: startDate }
    });

    // Tests by Date (for trend chart)
    const testsByDate = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$testDate' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]).toArray();

    // Severity Distribution
    const severityDistribution = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$summary.severity',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Deficiency Type Distribution
    const deficiencyDistribution = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$summary.deficiencyType',
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Average Accuracy
    const accuracyStats = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgAccuracy: { $avg: '$summary.accuracy' },
          maxAccuracy: { $max: '$summary.accuracy' },
          minAccuracy: { $min: '$summary.accuracy' }
        }
      }
    ]).toArray();

    // Completion Rate (tests with all questions answered)
    const completionStats = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          completed: {
            $sum: {
              $cond: [{ $gte: [{ $size: '$answers' }, 17] }, 1, 0]
            }
          },
          total: { $sum: 1 }
        }
      }
    ]).toArray();

    // Average Test Time by Severity
    const timeByseverity = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$summary.severity',
          avgTime: { $avg: '$summary.totalTime' },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    // Accuracy Distribution (grouped by ranges)
    const accuracyRanges = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate }
        }
      },
      {
        $bucket: {
          groupBy: '$summary.accuracy',
          boundaries: [0, 20, 40, 60, 80, 100],
          default: 'Other',
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]).toArray();

    // Recent Tests Summary
    const recentTests = await collection
      .find({
        testDate: { $gte: startDate }
      })
      .sort({ testDate: -1 })
      .limit(10)
      .project({
        testDate: 1,
        'summary.diagnosis': 1,
        'summary.severity': 1,
        'summary.accuracy': 1,
        'summary.deficiencyType': 1
      })
      .toArray();

    // Career Recommendation Stats
    const careerStats = await collection.aggregate([
      {
        $match: {
          testDate: { $gte: startDate },
          careerRecommendation: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          withRecommendation: { $sum: 1 }
        }
      }
    ]).toArray();

    const completionRate = completionStats[0]
      ? (completionStats[0].completed / completionStats[0].total) * 100
      : 0;

    return NextResponse.json(
      {
        success: true,
        data: {
          overview: {
            totalTests,
            avgAccuracy: accuracyStats[0]?.avgAccuracy || 0,
            completionRate: completionRate.toFixed(1),
            recommendationsGenerated: careerStats[0]?.withRecommendation || 0
          },
          trends: {
            testsByDate: testsByDate.map(item => ({
              date: item._id,
              count: item.count
            }))
          },
          distributions: {
            severity: severityDistribution.map(item => ({
              name: item._id || 'unknown',
              value: item.count
            })),
            deficiencyType: deficiencyDistribution.map(item => ({
              name: item._id || 'unknown',
              value: item.count
            })),
            accuracyRanges: accuracyRanges.map((item, index) => ({
              range: `${item._id}-${
                index < accuracyRanges.length - 1 ? item._id + 20 : 100
              }%`,
              count: item.count
            }))
          },
          performance: {
            accuracyStats: {
              average: accuracyStats[0]?.avgAccuracy || 0,
              max: accuracyStats[0]?.maxAccuracy || 0,
              min: accuracyStats[0]?.minAccuracy || 0
            },
            timeBySevirity: timeByseverity.map(item => ({
              severity: item._id,
              avgTime: item.avgTime,
              count: item.count
            }))
          },
          recentTests: recentTests.map(test => ({
            id: test._id.toString(),
            date: test.testDate,
            diagnosis: test.summary?.diagnosis || 'Unknown',
            severity: test.summary?.severity || 'unknown',
            accuracy: test.summary?.accuracy || 0,
            deficiencyType: test.summary?.deficiencyType || 'unknown'
          }))
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch analytics data',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}