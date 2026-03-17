
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@dr.com'
  const password = 'Password123'
  const name = 'Dr. Test'
  
  const existing = await prisma.user.findUnique({
    where: { email }
  })
  
  if (existing) {
    console.log('User already exists')
    return
  }
  
  const passwordHash = await bcrypt.hash(password, 12)
  
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name,
      role: 'DOCTOR',
      isActive: true,
      doctor: {
        create: {
          licenseNumber: '12345',
          wilaya: '01 - Adrar',
          clinicName: 'Clinique Al-Amel',
          consultationFee: 2000
        }
      }
    }
  })
  
  console.log('Test user created:', user.email)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
