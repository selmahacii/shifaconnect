import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (sessionToken) {
      // Delete session from database
      try {
        await db.session.delete({
          where: { token: sessionToken },
        });
      } catch {
        // Session might not exist, ignore error
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Deconnexion reussie',
    });

    // Clear session cookie
    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Still clear the cookie even if there's an error
    const response = NextResponse.json({
      success: true,
      message: 'Deconnexion reussie',
    });

    response.cookies.set('session_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
