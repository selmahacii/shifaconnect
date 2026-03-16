import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { LoginSchema } from '@/lib/validations/schemas';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = LoginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || 'Donnees invalides',
        },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        doctor: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email ou mot de passe incorrect',
        },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ce compte a ete desactive',
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email ou mot de passe incorrect',
        },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await db.session.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
      },
    });

    // Prepare response data (exclude password hash)
    const { passwordHash: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        doctor: user.doctor,
      },
    });

    // Set session cookie
    response.cookies.set('session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la connexion',
      },
      { status: 500 }
    );
  }
}
