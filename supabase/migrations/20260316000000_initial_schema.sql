-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors table (one per Supabase auth user)
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name TEXT NOT NULL,
  full_name_ar TEXT,                    -- Arabic name
  speciality TEXT DEFAULT 'Médecin généraliste',
  license_number TEXT,                  -- Numéro d'ordre
  clinic_name TEXT,
  clinic_address TEXT,
  clinic_wilaya TEXT,
  phone TEXT,
  stamp_image_url TEXT,                 -- Doctor stamp for PDF
  signature_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  
  -- Identity
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_ar TEXT,
  last_name_ar TEXT,
  date_of_birth DATE NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')) NOT NULL,
  national_id TEXT,                    -- NIN (optional)
  chifa_number TEXT,                   -- Numéro Chifa
  
  -- Contact
  phone TEXT,
  address TEXT,
  wilaya TEXT,
  
  -- Medical background
  blood_group TEXT CHECK (blood_group IN ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  allergies TEXT[],                    -- Array of allergy strings
  chronic_conditions TEXT[],           -- Diabète, HTA, etc.
  current_medications TEXT[],
  notes TEXT,                          -- Doctor notes
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consultations table
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  
  consultation_date TIMESTAMPTZ DEFAULT NOW(),
  
  -- Clinical
  chief_complaint TEXT NOT NULL,       -- Motif de consultation
  symptoms TEXT,
  diagnosis TEXT,                      -- Diagnostic
  diagnosis_code TEXT,                 -- ICD-10 (optional)
  clinical_notes TEXT,                 -- Examen clinique
  
  -- Vitals
  blood_pressure_systolic INTEGER,
  blood_pressure_diastolic INTEGER,
  heart_rate INTEGER,
  temperature DECIMAL(4,1),
  weight DECIMAL(5,1),
  height INTEGER,
  oxygen_saturation INTEGER,
  
  -- Follow up
  followup_date DATE,
  followup_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  
  prescription_number TEXT UNIQUE,     -- Auto-generated: ORD-2026-00001
  prescription_date TIMESTAMPTZ DEFAULT NOW(),
  
  medications JSONB NOT NULL,          -- Array of medication objects (see below)
  instructions TEXT,                   -- General instructions
  is_renewable BOOLEAN DEFAULT FALSE,
  renewal_count INTEGER DEFAULT 0,
  
  -- PDF
  pdf_url TEXT,                        -- Supabase Storage URL
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medication object structure (stored in prescriptions.medications JSONB):
-- [{
--   name: string,          -- Nom du médicament
--   dosage: string,        -- Ex: "500mg"
--   form: string,          -- Cp, Gél, Sirop, Inj, etc.
--   frequency: string,     -- Ex: "3 fois par jour"
--   duration: string,      -- Ex: "7 jours"
--   quantity: string,      -- Ex: "2 boîtes"
--   instructions: string   -- Ex: "Prendre après les repas"
-- }]

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  
  appointment_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  reason TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','confirmed','completed','cancelled','no_show')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lab results table
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
  consultation_id UUID REFERENCES consultations(id),
  
  result_date DATE NOT NULL,
  lab_name TEXT,
  result_type TEXT,                    -- Bilan sanguin, Radio, Echo, etc.
  file_url TEXT,                       -- Supabase Storage URL (PDF/image)
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) — CRITICAL: doctors only see their own data
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;

-- Doctors policy
CREATE POLICY "Doctors can manage own profile"
ON doctors FOR ALL
USING (auth_user_id = auth.uid());

-- Patients policy
CREATE POLICY "Doctors see only their patients"
ON patients FOR ALL
USING (doctor_id = (SELECT id FROM doctors WHERE auth_user_id = auth.uid()));

-- Consultations policy
CREATE POLICY "Doctors see only their consultations"
ON consultations FOR ALL
USING (doctor_id = (SELECT id FROM doctors WHERE auth_user_id = auth.uid()));

-- Prescriptions policy
CREATE POLICY "Doctors see only their prescriptions"
ON prescriptions FOR ALL
USING (doctor_id = (SELECT id FROM doctors WHERE auth_user_id = auth.uid()));

-- Appointments policy
CREATE POLICY "Doctors see only their appointments"
ON appointments FOR ALL
USING (doctor_id = (SELECT id FROM doctors WHERE auth_user_id = auth.uid()));

-- Lab results policy
CREATE POLICY "Doctors see only their lab results"
ON lab_results FOR ALL
USING (doctor_id = (SELECT id FROM doctors WHERE auth_user_id = auth.uid()));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patients_updated_at
BEFORE UPDATE ON patients
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate prescription number
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Simple placeholder if sequence logic is not complex enough for year-based resets
  -- Re-using nextval is standard
  NEW.prescription_number = 'ORD-' || EXTRACT(YEAR FROM NOW()) || '-' || 
    LPAD(nextval('prescription_seq')::TEXT, 5, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS prescription_seq START 1;
CREATE TRIGGER set_prescription_number
BEFORE INSERT ON prescriptions
FOR EACH ROW EXECUTE FUNCTION generate_prescription_number();
