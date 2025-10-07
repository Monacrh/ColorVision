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

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('colorvision_db');
    const collection = db.collection('test_results');

    const results = await collection
      .find({})
      .sort({ testDate: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      data: results,
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching test results:', error);
    
    // Fix untuk TypeScript error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch test results',
      error: errorMessage,
    }, { status: 500 });
  }
}