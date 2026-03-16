import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcrypt'

// GET /api/settings - Get current user and doctor profile settings
export async function GET() {
  try {
    // Get user with doctor profile from session
    // For now, get first user with doctor
    const user = await db.user.findFirst({
      include: {
        doctor: true,
      },
    })

    if (!user || !user.doctor) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        avatar: user.avatar,
      },
      doctor: {
        id: user.doctor.id,
        professionalTitle: user.doctor.professionalTitle,
        specialization: user.doctor.specialization,
        licenseNumber: user.doctor.licenseNumber,
        wilaya: user.doctor.wilaya,
        address: user.doctor.address,
        city: user.doctor.city,
        postalCode: user.doctor.postalCode,
        clinicPhone: user.doctor.clinicPhone,
        clinicName: user.doctor.clinicName,
        consultationFee: user.doctor.consultationFee,
        workingHours: user.doctor.workingHours,
        stampImage: user.doctor.stampImage,
        signatureImage: user.doctor.signatureImage,
      },
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings - Update user and doctor profile settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // Get first user with doctor for now
    const existingUser = await db.user.findFirst({
      include: { doctor: true },
    })

    if (!existingUser || !existingUser.doctor) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { user, doctor } = body

    // Update user
    if (user) {
      await db.user.update({
        where: { id: existingUser.id },
        data: {
          name: user.name ?? existingUser.name,
          phone: user.phone ?? existingUser.phone,
          avatar: user.avatar ?? existingUser.avatar,
        },
      })
    }

    // Update doctor
    if (doctor) {
      await db.doctor.update({
        where: { id: existingUser.doctor.id },
        data: {
          professionalTitle: doctor.professionalTitle ?? existingUser.doctor.professionalTitle,
          specialization: doctor.specialization ?? existingUser.doctor.specialization,
          licenseNumber: doctor.licenseNumber ?? existingUser.doctor.licenseNumber,
          wilaya: doctor.wilaya ?? existingUser.doctor.wilaya,
          address: doctor.address ?? existingUser.doctor.address,
          city: doctor.city ?? existingUser.doctor.city,
          postalCode: doctor.postalCode ?? existingUser.doctor.postalCode,
          clinicPhone: doctor.clinicPhone ?? existingUser.doctor.clinicPhone,
          clinicName: doctor.clinicName ?? existingUser.doctor.clinicName,
          consultationFee: doctor.consultationFee ?? existingUser.doctor.consultationFee,
          workingHours: doctor.workingHours ?? existingUser.doctor.workingHours,
          stampImage: doctor.stampImage !== undefined ? doctor.stampImage : existingUser.doctor.stampImage,
          signatureImage: doctor.signatureImage !== undefined ? doctor.signatureImage : existingUser.doctor.signatureImage,
        },
      })
    }

    // Fetch updated data
    const updatedUser = await db.user.findFirst({
      where: { id: existingUser.id },
      include: { doctor: true },
    })

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Failed to fetch updated settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatar: updatedUser.avatar,
      },
      doctor: updatedUser.doctor ? {
        id: updatedUser.doctor.id,
        professionalTitle: updatedUser.doctor.professionalTitle,
        specialization: updatedUser.doctor.specialization,
        licenseNumber: updatedUser.doctor.licenseNumber,
        wilaya: updatedUser.doctor.wilaya,
        address: updatedUser.doctor.address,
        city: updatedUser.doctor.city,
        postalCode: updatedUser.doctor.postalCode,
        clinicPhone: updatedUser.doctor.clinicPhone,
        clinicName: updatedUser.doctor.clinicName,
        consultationFee: updatedUser.doctor.consultationFee,
        workingHours: updatedUser.doctor.workingHours,
        stampImage: updatedUser.doctor.stampImage,
        signatureImage: updatedUser.doctor.signatureImage,
      } : null,
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}

// PUT /api/settings/password - Change password
export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Get user
    const existingUser = await db.user.findFirst()

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, existingUser.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12)

    // Update password
    await db.user.update({
      where: { id: existingUser.id },
      data: { passwordHash: newHash },
    })

    return NextResponse.json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Error updating password:', error)
    return NextResponse.json(
      { error: 'Failed to update password' },
      { status: 500 }
    )
  }
}
