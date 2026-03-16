import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { z } from 'zod';

// Extended registration schema with additional fields
const ExtendedRegisterSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir une minuscule')
    .regex(/\d/, 'Le mot de passe doit contenir un chiffre'),
  confirmPassword: z.string(),
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  phone: z.string().regex(/^0[5-7]\d{8}$/, 'Numéro de téléphone invalide').optional(),
  licenseNumber: z.string().optional(),
  wilaya: z.string().optional(),
  clinicName: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = ExtendedRegisterSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: validationResult.error.issues[0]?.message || 'Données invalides',
        },
        { status: 400 }
      );
    }

    const { email, password, name, phone, licenseNumber, wilaya, clinicName } = validationResult.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Un compte avec cette adresse email existe déjà',
        },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user and doctor in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          phone: phone || null,
          role: 'DOCTOR',
          isActive: true,
        },
      });

      // Create doctor profile
      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          licenseNumber: licenseNumber || null,
          wilaya: wilaya || null,
          clinicName: clinicName || null,
          consultationFee: 2000, // Default consultation fee in DZD centimes (20 DA)
        },
      });

      // Create session
      const sessionToken = uuidv4();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      await tx.session.create({
        data: {
          userId: user.id,
          token: sessionToken,
          expiresAt,
          ipAddress: request.headers.get('x-forwarded-for') || null,
          userAgent: request.headers.get('user-agent') || null,
        },
      });

      return { user, doctor, sessionToken };
    });

    // Prepare response data (exclude password hash)
    const { passwordHash: _, ...userWithoutPassword } = result.user;

    const response = NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        doctor: result.doctor,
      },
    });

    // Set session cookie
    response.cookies.set('session_token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de l\'inscription',
      },
      { status: 500 }
    );
  }
}
