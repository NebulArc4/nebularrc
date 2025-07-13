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

    // First, try to create the documents bucket if it doesn't exist
    try {
      const { data: bucketData, error: bucketError } = await supabase.storage
        .createBucket('documents', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*'],
          fileSizeLimit: 10485760 // 10MB
        });
      
      if (bucketError && bucketError.message !== 'Bucket already exists') {
        console.log('Bucket creation error (non-critical):', bucketError.message);
      } else if (bucketData) {
        console.log('Documents bucket created successfully');
      }
    } catch (bucketCreateError) {
      console.log('Bucket creation failed (non-critical):', bucketCreateError);
      // Continue with upload attempt
    }

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
      
      // If bucket doesn't exist, provide a helpful error message
      if (error.message === 'Bucket not found') {
        return NextResponse.json({ 
          error: 'Storage bucket not configured. Please contact support to set up document storage.',
          details: 'The documents storage bucket needs to be created in your Supabase project.'
        }, { status: 500 });
      }
      
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Insert document metadata into the documents table
    const userId = '00000000-0000-0000-0000-000000000000'; // TODO: Replace with real user ID from auth
    const { data: docInsert, error: docInsertError } = await supabase
      .from('documents')
      .insert([
        {
          user_id: userId,
          file_name: originalName,
          storage_path: data?.path || fileName,
          created_at: new Date().toISOString(),
        },
      ])
      .select('id');

    if (docInsertError) {
      console.error('Error inserting document metadata:', docInsertError);
      return NextResponse.json({ error: 'Failed to save document metadata', details: docInsertError.message }, { status: 500 });
    }

    console.log('Upload successful:', data);

    return NextResponse.json({ 
      id: docInsert?.[0]?.id,
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