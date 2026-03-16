
import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

// Register fonts for Arabic support if needed
// Font.register({
//   family: 'Noto Sans Arabic',
//   src: 'https://fonts.gstatic.com/s/notosansarabic/v18/n8AUm8VOn7unT2KdpNUmD25WvX2Udw.ttf'
// })

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#333',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '1pt solid #1B4F72',
    paddingBottom: 20,
  },
  doctorInfo: {
    flexDirection: 'column',
    maxWidth: '60%',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1B4F72',
    marginBottom: 4,
  },
  doctorSub: {
    fontSize: 9,
    color: '#666',
    marginBottom: 2,
  },
  prescriptionMeta: {
    alignItems: 'right',
    textAlign: 'right',
  },
  date: {
    marginBottom: 10,
    fontWeight: 'bold',
  },
  patientSection: {
    marginBottom: 30,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientLabel: {
    fontSize: 9,
    color: '#777',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  patientValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  medicationList: {
    flex: 1,
  },
  medicationItem: {
    marginBottom: 20,
    paddingBottom: 10,
  },
  rp: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#000',
  },
  medDetails: {
    marginLeft: 15,
    lineHeight: 1.5,
  },
  posology: {
    fontStyle: 'italic',
    color: '#444',
  },
  instructions: {
    marginTop: 5,
    color: '#1B4F72',
    fontWeight: 'bold',
  },
  footer: {
    borderTop: '1pt solid #eee',
    paddingTop: 20,
    marginTop: 20,
  },
  generalInstructions: {
    marginBottom: 40,
  },
  signatureArea: {
    alignItems: 'flex-end',
    marginTop: 20,
  },
  signatureLine: {
    width: 150,
    borderBottom: '1pt solid #333',
    marginTop: 40,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: 'center',
    width: 150,
  },
  validity: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 7,
    color: '#999',
    borderTop: '0.5pt solid #eee',
    paddingTop: 10,
  }
})

interface PrescriptionPDFProps {
  doctor: any
  patient: any
  medications: any[]
  generalInstructions?: string
  date?: string
  prescriptionNumber?: string
}

export const PrescriptionPDF = ({ 
  doctor, 
  patient, 
  medications, 
  generalInstructions,
  date = new Date().toISOString(),
  prescriptionNumber
}: PrescriptionPDFProps) => {
  const patientAge = patient.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / 31557600000)
    : 'N/A'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>Dr. {doctor.full_name}</Text>
            <Text style={styles.doctorSub}>{doctor.speciality || 'Médecin Généraliste'}</Text>
            <Text style={styles.doctorSub}>N° d'Ordre: {doctor.license_number || '----------'}</Text>
            <Text style={styles.doctorSub}>{doctor.clinic_address}</Text>
            <Text style={styles.doctorSub}>{doctor.clinic_wilaya}</Text>
            <Text style={styles.doctorSub}>Tél: {doctor.phone}</Text>
          </View>
          <View style={styles.prescriptionMeta}>
            <Text style={styles.date}>Fait le : {format(new Date(date), 'dd/MM/yyyy')}</Text>
            {prescriptionNumber && <Text style={{ fontSize: 8 }}>Ordonnance N° {prescriptionNumber}</Text>}
            {doctor.stamp_image_url && (
              <Image src={doctor.stamp_image_url} style={{ width: 80, height: 80, marginTop: 10 }} />
            )}
          </View>
        </View>

        {/* Patient Section */}
        <View style={styles.patientSection}>
          <View>
            <Text style={styles.patientLabel}>Patient</Text>
            <Text style={styles.patientValue}>{patient.first_name} {patient.last_name}</Text>
          </View>
          <View style={{ textAlign: 'center' }}>
            <Text style={styles.patientLabel}>Âge / Sexe</Text>
            <Text style={styles.patientValue}>{patientAge} ans / {patient.gender}</Text>
          </View>
          {patient.nin && (
            <View style={{ textAlign: 'right' }}>
              <Text style={styles.patientLabel}>N° CHIFA / NIN</Text>
              <Text style={styles.patientValue}>{patient.nin}</Text>
            </View>
          )}
        </View>

        {/* Medications */}
        <View style={styles.medicationList}>
          {medications.map((med, index) => (
            <View key={index} style={styles.medicationItem}>
              <Text style={styles.rp}>
                {index + 1}. Rp/ {med.medicationName} {med.dosage} {med.form}
              </Text>
              <View style={styles.medDetails}>
                <Text style={styles.posology}>
                  Posologie: {med.frequency} pendant {med.duration} — Qté: {med.quantity}
                </Text>
                {med.instructions && (
                  <Text style={styles.instructions}>Note: {med.instructions}</Text>
                )}
                {med.isRenewable && (
                  <Text style={{ fontSize: 8, color: '#e67e22', marginTop: 2 }}>Renouvellement autorisé</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {generalInstructions && (
            <View style={styles.generalInstructions}>
              <Text style={[styles.patientLabel, { color: '#1B4F72' }]}>Instructions Générales</Text>
              <Text style={{ lineHeight: 1.4 }}>{generalInstructions}</Text>
            </View>
          )}

          <View style={styles.signatureArea}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Signature et cachet du médecin</Text>
          </View>
        </View>

        {/* Validity */}
        <Text style={styles.validity}>
          Ordonnance valable 3 mois à compter de la date de délivrance. Document généré par Shifa-Connect.
        </Text>
      </Page>
    </Document>
  )
}
