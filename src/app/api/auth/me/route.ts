import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Non authentifie',
        },
        { status: 401 }
      );
    }

    // Find session with user and doctor
    const session = await db.session.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session invalide',
        },
        { status: 401 }
      );
    }

    // Check if session is expired
    if (session.expiresAt < new Date()) {
      // Delete expired session
      await db.session.delete({
        where: { id: session.id },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Session expiree',
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!session.user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Compte desactive',
        },
        { status: 401 }
      );
    }

    // Prepare response data (exclude password hash)
    const { passwordHash: _, ...userWithoutPassword } = session.user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        doctor: session.user.doctor,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue',
      },
      { status: 500 }
    );
  }
}
