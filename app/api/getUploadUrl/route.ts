import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { filename } = await request.json();
  
    try {
      const blob = await put(filename, new Uint8Array(), {
        access: 'public',
      });
  
      return NextResponse.json({ uploadUrl: blob.url, pathname: blob.pathname });
    } catch (error) {
      console.error('Error generating upload URL:', error);
      return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
    }
  }
  
  