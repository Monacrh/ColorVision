// src/app/api/test-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const client = await clientPromise;
    const db = client.db('colorvision_db');
    const collection = db.collection('test_results');

    const testResult = {
      testDate: new Date(),
      answers: body.answers,
      summary: body.summary,
      metadata: {
        browserInfo: request.headers.get('user-agent'),
      },
      createdAt: new Date(),
    };

    const result = await collection.insertOne(testResult);

    return NextResponse.json({
      success: true,
      message: 'Test result saved successfully',
      id: result.insertedId,
    }, { status: 201 });

  } catch (error) {
    console.error('Error saving test result:', error);
    
    // Fix untuk TypeScript error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      message: 'Failed to save test result',
      error: errorMessage,
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const id = searchParams.get('id');

    const client = await clientPromise;
    const db = client.db('colorvision_db');
    const collection = db.collection('test_results');

    // If ID is provided, fetch specific test result
    if (id) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { ObjectId } = require('mongodb');
      const result = await collection.findOne({ _id: new ObjectId(id) });
      
      if (!result) {
        return NextResponse.json({
          success: false,
          message: 'Test result not found',
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        data: result,
      }, { status: 200 });
    }

    // Fetch list of test results
    const results = await collection
      .find({})
      .sort({ testDate: -1 })
      .limit(limit)
      .toArray();

    // Transform data for sidebar display
    const formattedResults = results.map(result => ({
      id: result._id.toString(),
      title: `${result.summary?.diagnosis || 'Test Result'} - ${new Date(result.testDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
      date: result.testDate,
      diagnosis: result.summary?.diagnosis || 'Unknown',
      severity: result.summary?.severity || 'none',
      accuracy: result.summary?.accuracy || 0,
      deficiencyType: result.summary?.deficiencyType || 'none',
      confidence: result.summary?.confidence || 0,
    }));

    return NextResponse.json({
      success: true,
      data: formattedResults,
      total: results.length,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching test results:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch test results',
      error: errorMessage,
    }, { status: 500 });
  }
}