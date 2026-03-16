import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer'

// Register fonts including Arabic font
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica@1.0.0/Helvetica.ttf' },
    { src: 'https://cdn.jsdelivr.net/npm/@canvas-fonts/helvetica-bold@1.0.0/Helvetica-Bold.ttf', fontWeight: 'bold' },
  ],
})

// Register Noto Sans Arabic for RTL text
Font.register({
  family: 'NotoSansArabic',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/notosansarabic/v14/nwpxtLm7d1jvAZJgxqxlCVLEQeAeb68c7I8-.ttf',
      fontWeight: 'normal',
    },
    { 
      src: 'https://fonts.gstatic.com/s/notosansarabic/v14/nwpttLm7d1jvAZJRYlheUacn7mDawwqO.ttf',
      fontWeight: 'bold',
    },
  ],
})

// Colors from design system
const COLORS = {
  primary: '#1B4F72',
  secondary: '#148F77',
  accent: '#F39C12',
  text: '#1a1a1a',
  textMuted: '#666666',
  border: '#d1d5db',
  lightGray: '#f3f4f6',
}

// A4 dimensions
const PAGE_WIDTH = 595.28
const PAGE_HEIGHT = 841.89
const MARGIN = 50

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: MARGIN,
    backgroundColor: '#ffffff',
    color: COLORS.text,
    lineHeight: 1.4,
  },
  
  // Header
  header: {
    marginBottom: 15,
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  doctorSection: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 3,
  },
  doctorSpecialty: {
    fontSize: 11,
    color: COLORS.secondary,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorInfo: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 1,
  },
  licenseNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 3,
    fontStyle: 'italic',
  },
  
  headerRight: {
    alignItems: 'flex-end',
    minWidth: 150,
  },
  dateSection: {
    marginBottom: 8,
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  dateValue: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  prescriptionNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  stampPlaceholder: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
  },
  stampText: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  stampImage: {
    width: 75,
    height: 75,
    objectFit: 'contain',
  },
  
  // Patient Section
  patientSection: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: COLORS.lightGray,
    borderRadius: 3,
  },
  patientLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  patientNameArabic: {
    fontSize: 11,
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginBottom: 4,
  },
  patientDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  patientDetail: {
    flexDirection: 'row',
    marginRight: 15,
  },
  patientDetailLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginRight: 4,
  },
  patientDetailValue: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  chifaNumber: {
    marginTop: 6,
    fontSize: 9,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  
  // Diagnosis
  diagnosisSection: {
    marginBottom: 12,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    paddingLeft: 10,
    backgroundColor: '#f0fdf4',
  },
  diagnosisLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  diagnosisValue: {
    fontSize: 10,
    color: COLORS.text,
  },
  diagnosisValueArabic: {
    fontSize: 10,
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Medications
  medicationsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  
  medicationBlock: {
    marginBottom: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  medicationNumber: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontWeight: 'bold',
    marginRight: 6,
  },
  rpSymbol: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: 6,
  },
  medicationName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  medicationDosage: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  medicationForm: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  
  // Arabic text styles
  arabicText: {
    fontFamily: 'NotoSansArabic',
    textAlign: 'right',
  },
  medicationArabic: {
    fontSize: 10,
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  medicationArabicInline: {
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
  },
  
  medicationDetails: {
    marginTop: 6,
    paddingLeft: 20,
  },
  medicationDetailRow: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  medicationDetailLabel: {
    fontSize: 9,
    color: COLORS.textMuted,
    width: 60,
  },
  medicationDetailValue: {
    fontSize: 9,
    fontWeight: 'bold',
    flex: 1,
  },
  
  medicationInstructions: {
    marginTop: 4,
    paddingLeft: 20,
    fontSize: 9,
    fontStyle: 'italic',
    color: COLORS.secondary,
  },
  medicationInstructionsArabic: {
    marginTop: 2,
    paddingLeft: 20,
    fontSize: 9,
    fontFamily: 'NotoSansArabic',
    color: COLORS.secondary,
    textAlign: 'right',
  },
  
  renewalBadge: {
    marginTop: 6,
    marginLeft: 20,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#ecfdf5',
    borderRadius: 2,
    alignSelf: 'flex-start',
  },
  renewalText: {
    fontSize: 8,
    color: COLORS.secondary,
    fontWeight: 'bold',
  },
  
  // General Instructions
  generalInstructions: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  generalInstructionsLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 4,
  },
  generalInstructionsValue: {
    fontSize: 9,
    color: COLORS.text,
  },
  generalInstructionsArabic: {
    fontSize: 9,
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 4,
  },
  
  // Footer
  footer: {
    position: 'absolute',
    bottom: MARGIN,
    left: MARGIN,
    right: MARGIN,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 10,
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
  },
  signatureSection: {
    width: '35%',
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 40,
  },
  signatureImage: {
    width: 100,
    height: 50,
    objectFit: 'contain',
    marginBottom: 5,
  },
  signatureLine: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.border,
    paddingTop: 4,
  },
  signatureName: {
    fontSize: 8,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  
  validityNotice: {
    width: '55%',
    alignItems: 'flex-end',
  },
  validityText: {
    fontSize: 7,
    color: COLORS.textMuted,
    textAlign: 'right',
  },
  validityTextArabic: {
    fontSize: 7,
    fontFamily: 'NotoSansArabic',
    color: COLORS.textMuted,
    textAlign: 'right',
    marginTop: 2,
  },
  
  watermark: {
    position: 'absolute',
    bottom: 20,
    right: MARGIN,
    fontSize: 6,
    color: '#e5e7eb',
  },
  watermarkArabic: {
    position: 'absolute',
    bottom: 20,
    right: MARGIN,
    fontSize: 6,
    fontFamily: 'NotoSansArabic',
    color: '#e5e7eb',
  },
})

// Types
interface MedicationPDF {
  medicationName: string
  medicationNameAr?: string | null
  dosage: string
  form?: string | null
  frequency: string
  frequencyAr?: string | null
  duration: string
  durationAr?: string | null
  quantity?: string | null
  instructions?: string | null
  instructionsAr?: string | null
  renewal?: boolean
  order: number
}

interface DoctorPDF {
  name: string
  professionalTitle?: string | null
  specialization?: string | null
  licenseNumber?: string | null
  clinicName?: string | null
  address?: string | null
  city?: string | null
  clinicPhone?: string | null
  stampImage?: string | null
  signatureImage?: string | null
}

interface PatientPDF {
  firstName: string
  lastName: string
  firstNameAr?: string | null
  lastNameAr?: string | null
  dateOfBirth: string
  gender: string
  fileNumber: string
  chifaNumber?: string | null
}

interface PrescriptionPDFProps {
  doctor: DoctorPDF
  patient: PatientPDF
  prescriptionDate: string
  prescriptionNumber?: string
  diagnosis?: string | null
  diagnosisAr?: string | null
  medications: MedicationPDF[]
  generalInstructions?: string | null
  generalInstructionsAr?: string | null
}

// Calculate age from date of birth (DD/MM/YYYY)
const calculateAge = (dateOfBirth: string): number => {
  const parts = dateOfBirth.split('/')
  if (parts.length !== 3) return 0
  const [day, month, year] = parts.map(Number)
  if (!day || !month || !year) return 0
  const birthDate = new Date(year, month - 1, day)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

// Get gender display
const getGenderDisplay = (gender: string): string => {
  return gender === 'MALE' ? 'M' : 'F'
}

// Arabic Text Component - handles RTL text properly
function ArabicText({ 
  children, 
  style = {} 
}: { 
  children: string
  style?: Record<string, unknown>
}): React.ReactElement | null {
  if (!children) return null
  return (
    <Text style={[styles.arabicText, style]}>
      {children}
    </Text>
  )
}

// PDF Document Component
export function PrescriptionPDFDocument({
  doctor,
  patient,
  prescriptionDate,
  prescriptionNumber,
  diagnosis,
  diagnosisAr,
  medications,
  generalInstructions,
  generalInstructionsAr,
}: PrescriptionPDFProps): React.ReactElement {
  const patientAge = calculateAge(patient.dateOfBirth)
  const patientFullName = `${patient.firstName} ${patient.lastName}`
  const patientNameAr = patient.firstNameAr && patient.lastNameAr
    ? `${patient.firstNameAr} ${patient.lastNameAr}`
    : null

  const title = doctor.professionalTitle || 'Dr.'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {/* Doctor Info */}
            <View style={styles.doctorSection}>
              <Text style={styles.doctorName}>
                {title} {doctor.name}
              </Text>
              {doctor.specialization && (
                <Text style={styles.doctorSpecialty}>
                  {doctor.specialization}
                </Text>
              )}
              {doctor.clinicName && (
                <Text style={styles.doctorInfo}>{doctor.clinicName}</Text>
              )}
              {(doctor.address || doctor.city) && (
                <Text style={styles.doctorInfo}>
                  {[doctor.address, doctor.city].filter(Boolean).join(', ')}
                </Text>
              )}
              {doctor.clinicPhone && (
                <Text style={styles.doctorInfo}>Tél: {doctor.clinicPhone}</Text>
              )}
              {doctor.licenseNumber && (
                <Text style={styles.licenseNumber}>
                  N° d&apos;inscription à l&apos;Ordre: {doctor.licenseNumber}
                </Text>
              )}
            </View>
            
            {/* Date & Stamp */}
            <View style={styles.headerRight}>
              <View style={styles.dateSection}>
                <Text style={styles.dateLabel}>Date</Text>
                <Text style={styles.dateValue}>{prescriptionDate}</Text>
              </View>
              {prescriptionNumber && (
                <Text style={styles.prescriptionNumber}>
                  N°: {prescriptionNumber}
                </Text>
              )}
              <View style={styles.stampPlaceholder}>
                {doctor.stampImage ? (
                  // eslint-disable-next-line jsx-a11y/alt-text
                  <Image style={styles.stampImage} src={doctor.stampImage} />
                ) : (
                  <>
                    <Text style={styles.stampText}>Cachet</Text>
                    <Text style={styles.stampText}>du médecin</Text>
                  </>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Patient Section */}
        <View style={styles.patientSection}>
          <Text style={styles.patientLabel}>Patient</Text>
          <Text style={styles.patientName}>{patientFullName}</Text>
          {patientNameAr && (
            <ArabicText style={styles.patientNameArabic}>{patientNameAr}</ArabicText>
          )}
          <View style={styles.patientDetails}>
            <View style={styles.patientDetail}>
              <Text style={styles.patientDetailLabel}>Âge:</Text>
              <Text style={styles.patientDetailValue}>{patientAge} ans</Text>
            </View>
            <View style={styles.patientDetail}>
              <Text style={styles.patientDetailLabel}>Sexe:</Text>
              <Text style={styles.patientDetailValue}>{getGenderDisplay(patient.gender)}</Text>
            </View>
            <View style={styles.patientDetail}>
              <Text style={styles.patientDetailLabel}>Né(e) le:</Text>
              <Text style={styles.patientDetailValue}>{patient.dateOfBirth}</Text>
            </View>
            <View style={styles.patientDetail}>
              <Text style={styles.patientDetailLabel}>N° Dossier:</Text>
              <Text style={styles.patientDetailValue}>{patient.fileNumber}</Text>
            </View>
          </View>
          {patient.chifaNumber && (
            <Text style={styles.chifaNumber}>
              N° Chifa: {patient.chifaNumber}
            </Text>
          )}
        </View>

        {/* Diagnosis */}
        {diagnosis && (
          <View style={styles.diagnosisSection}>
            <Text style={styles.diagnosisLabel}>Diagnostic</Text>
            <Text style={styles.diagnosisValue}>{diagnosis}</Text>
            {diagnosisAr && (
              <ArabicText style={styles.diagnosisValueArabic}>{diagnosisAr}</ArabicText>
            )}
          </View>
        )}

        {/* Medications */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.medicationsTitle}>
            Prescription Médicale
          </Text>
          
          {medications.map((med, index): React.ReactElement => (
            <View key={index} style={styles.medicationBlock}>
              <View style={styles.medicationHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Text style={styles.medicationNumber}>{index + 1}.</Text>
                  <Text style={styles.rpSymbol}>Rp/</Text>
                  <View>
                    <Text style={styles.medicationName}>{med.medicationName}</Text>
                    {med.form && (
                      <Text style={styles.medicationForm}>{med.form}</Text>
                    )}
                  </View>
                </View>
                <Text style={styles.medicationDosage}>{med.dosage}</Text>
              </View>
              
              {med.medicationNameAr && (
                <ArabicText style={styles.medicationArabic}>{med.medicationNameAr}</ArabicText>
              )}
              
              <View style={styles.medicationDetails}>
                <View style={styles.medicationDetailRow}>
                  <Text style={styles.medicationDetailLabel}>Posologie:</Text>
                  <Text style={styles.medicationDetailValue}>
                    {med.frequency}
                  </Text>
                </View>
                {med.frequencyAr && (
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationDetailLabel}></Text>
                    <ArabicText style={{ fontSize: 9, color: COLORS.textMuted }}>
                      {med.frequencyAr}
                    </ArabicText>
                  </View>
                )}
                <View style={styles.medicationDetailRow}>
                  <Text style={styles.medicationDetailLabel}>Durée:</Text>
                  <Text style={styles.medicationDetailValue}>
                    {med.duration}
                  </Text>
                </View>
                {med.durationAr && (
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationDetailLabel}></Text>
                    <ArabicText style={{ fontSize: 9, color: COLORS.textMuted }}>
                      {med.durationAr}
                    </ArabicText>
                  </View>
                )}
                {med.quantity && (
                  <View style={styles.medicationDetailRow}>
                    <Text style={styles.medicationDetailLabel}>Quantité:</Text>
                    <Text style={styles.medicationDetailValue}>{med.quantity}</Text>
                  </View>
                )}
              </View>
              
              {med.instructions && (
                <Text style={styles.medicationInstructions}>
                  {med.instructions}
                </Text>
              )}
              {med.instructionsAr && (
                <ArabicText style={styles.medicationInstructionsArabic}>
                  {med.instructionsAr}
                </ArabicText>
              )}
              
              {med.renewal && (
                <View style={styles.renewalBadge}>
                  <Text style={styles.renewalText}>Renouvellement autorisé</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* General Instructions */}
        {generalInstructions && (
          <View style={styles.generalInstructions}>
            <Text style={styles.generalInstructionsLabel}>Instructions générales</Text>
            <Text style={styles.generalInstructionsValue}>{generalInstructions}</Text>
            {generalInstructionsAr && (
              <ArabicText style={styles.generalInstructionsArabic}>
                {generalInstructionsAr}
              </ArabicText>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.signatureSection}>
            <Text style={styles.signatureLabel}>Signature et cachet du médecin</Text>
            {doctor.signatureImage && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image style={styles.signatureImage} src={doctor.signatureImage} />
            )}
            <View style={styles.signatureLine}>
              <Text style={styles.signatureName}>
                {title} {doctor.name}
              </Text>
            </View>
          </View>
          <View style={styles.validityNotice}>
            <Text style={styles.validityText}>
              Ordonnance valable 3 mois à compter de la date de délivrance
            </Text>
            <ArabicText style={styles.validityTextArabic}>
              المرخص الطبي صالح لمدة 3 أشهر من تاريخ الإصدار
            </ArabicText>
          </View>
        </View>

        {/* Watermark */}
        <Text style={styles.watermark} fixed>
          Shifa Connect
        </Text>
        <Text style={{ ...styles.watermark, right: MARGIN + 70 }} fixed>
          الشفاء كونيكت
        </Text>
      </Page>
    </Document>
  )
}

export default PrescriptionPDFDocument
