import { db } from '../../src/lib/db';
import bcrypt from 'bcrypt';

async function globalSetup() {
  const email = 'doctor@test.dz';
  const password = 'Password123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Clean up any existing test data from previous failed runs
  await db.auditLog.deleteMany({ where: { user: { email } } });
  await db.user.deleteMany({ where: { email } });

  // Create test doctor
  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      name: 'Dr. John Doe',
      role: 'DOCTOR',
      doctor: {
        create: {
          professionalTitle: 'Dr.',
          specialization: 'Généraliste',
          clinicName: 'Clinique de Test',
          wilaya: 'Alger',
        },
      },
    },
    include: {
      doctor: true,
    },
  });

  const doctorId = user.doctor!.id;

  // Create 3 test patients
  const patientsData = [
    {
      firstName: 'Kamel',
      lastName: 'Amrani',
      dateOfBirth: '15/05/1980',
      gender: 'MALE',
      phone: '0550123456',
      fileNumber: 'P-TEST-001',
      wilaya: 'Alger',
      bloodType: 'A_POSITIVE',
    },
    {
      firstName: 'Fatima',
      lastName: 'Zohra',
      dateOfBirth: '20/10/1992',
      gender: 'FEMALE',
      phone: '0660987654',
      fileNumber: 'P-TEST-002',
      wilaya: 'Oran',
      bloodType: 'O_NEGATIVE',
    },
    {
      firstName: 'Omar',
      lastName: 'Saidani',
      dateOfBirth: '05/01/1975',
      gender: 'MALE',
      phone: '0770112233',
      fileNumber: 'P-TEST-003',
      wilaya: 'Constantine',
      bloodType: 'B_POSITIVE',
    },
  ];

  for (const p of patientsData) {
    await db.patient.create({
      data: {
        ...p,
        doctorId,
        gender: p.gender as any,
        bloodType: p.bloodType as any,
      },
    });
  }

  // Store credentials in env for tests
  process.env.TEST_DOCTOR_EMAIL = email;
  process.env.TEST_DOCTOR_PASSWORD = password;

  // Return teardown function
  return async () => {
    // Optional: Cleanup after all tests
    // For now, let's keep it so developers can see results in DB if needed,
    // or uncomment the following to clean up every time:
    /*
    await db.auditLog.deleteMany({ where: { user: { email } } });
    await db.user.deleteMany({ where: { email } });
    */
  };
}

export default globalSetup;
