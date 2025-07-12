import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Test endpoint to verify the route is working
export async function GET() {
  return NextResponse.json({ 
    status: 'API route is working',
    timestamp: new Date().toISOString(),
    supabaseUrl: supabaseUrl ? 'Configured' : 'Missing',
    supabaseKey: supabaseKey ? 'Configured' : 'Missing'
  });
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST request received to /api/arcbrain/documents');
    
    // Check if the request has the correct content type
    const contentType = req.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      console.log('Invalid content type:', contentType);
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    console.log('File received:', file ? {
      name: file.name,
      size: file.size,
      type: file.type
    } : 'No file');
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name || 'document';
    const extension = originalName.includes('.') ? originalName.split('.').pop() : '';
    const fileName = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    console.log('Uploading file:', fileName);

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(fileName, buffer, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Upload successful:', data);

    return NextResponse.json({ 
      id: data?.path || fileName, 
      name: fileName,
      size: file.size,
      type: file.type,
      originalName: originalName
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to process file upload',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 