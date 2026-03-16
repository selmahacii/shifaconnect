/**
 * Common Medications Available in Algeria
 * Data for autocomplete in prescription forms
 */

export interface MedicationData {
  name: string
  nameAr?: string
  dosages: string[]
  forms: MedicationForm[]
  category?: string
}

export type MedicationForm =
  | 'Comprimé'
  | 'Gélule'
  | 'Sirop'
  | 'Injectable'
  | 'Sachet'
  | 'Suppositoire'
  | 'Pommade'
  | 'Collyre'
  | 'Spray'
  | 'Patch'
  | 'Solution'
  | 'Aérosol'
  | 'Crème'
  | 'Gouttes'
  | 'Granulés'
  | 'Pastille'

export const MEDICATION_FORMS: MedicationForm[] = [
  'Comprimé',
  'Gélule',
  'Sirop',
  'Injectable',
  'Sachet',
  'Suppositoire',
  'Pommade',
  'Collyre',
  'Spray',
  'Patch',
  'Solution',
  'Aérosol',
  'Crème',
  'Gouttes',
  'Granulés',
  'Pastille',
]

export const MEDICATION_FORMS_AR: Record<MedicationForm, string> = {
  'Comprimé': 'قرص',
  'Gélule': 'كبسولة',
  'Sirop': 'شراب',
  'Injectable': 'حقنة',
  'Sachet': 'كيس',
  'Suppositoire': 'تحميلة',
  'Pommade': 'مرهم',
  'Collyre': 'قطرة عين',
  'Spray': 'بخاخ',
  'Patch': 'لصقة',
  'Solution': 'محلول',
  'Aérosol': 'بخاخ',
  'Crème': 'كريم',
  'Gouttes': 'قطرات',
  'Granulés': 'محببات',
  'Pastille': 'حبة مص',
}

// Common dosages
export const COMMON_DOSAGES = [
  '100mg', '125mg', '200mg', '250mg', '300mg', '400mg', '500mg',
  '600mg', '750mg', '800mg', '850mg', '1g', '1.5g', '2g',
  '5mg', '10mg', '15mg', '20mg', '25mg', '30mg', '40mg', '50mg', '75mg', '80mg',
  '0.5mg', '1mg', '2mg', '2.5mg', '3mg', '4mg', '6mg', '7.5mg',
  '0.25mg', '0.5g', '2mg/ml', '5mg/ml', '10mg/ml', '100mg/ml',
]

// Common frequencies
export const COMMON_FREQUENCIES = [
  '1 fois par jour',
  '2 fois par jour',
  '3 fois par jour',
  '4 fois par jour',
  'Matin et soir',
  'Matin, midi et soir',
  'Toutes les 4 heures',
  'Toutes les 6 heures',
  'Toutes les 8 heures',
  'Toutes les 12 heures',
  'Au coucher',
  'Au réveil',
  'Avant les repas',
  'Après les repas',
  'Pendant les repas',
  'Si besoin',
  '1 comprimé le matin',
  '2 comprimés le matin',
  '1 comprimé matin et soir',
]

// Common durations
export const COMMON_DURATIONS = [
  '3 jours',
  '5 jours',
  '7 jours',
  '10 jours',
  '14 jours',
  '15 jours',
  '21 jours',
  '1 mois',
  '2 mois',
  '3 mois',
  '6 mois',
  'En continu',
  'À vie',
  'À renouveler',
]

// Common instructions
export const COMMON_INSTRUCTIONS = [
  'À prendre avec un grand verre d\'eau',
  'À prendre après les repas',
  'À prendre avant les repas',
  'À prendre pendant les repas',
  'À prendre au coucher',
  'À prendre le matin à jeun',
  'Ne pas manger de pamplemousse',
  'Éviter l\'alcool',
  'Ne pas conduire',
  'Peut causer de la somnolence',
  'À conserver au réfrigérateur',
  'Agiter avant usage',
  'Ne pas avaler',
  'À sucer lentement',
  'À dissoudre dans un verre d\'eau',
  'À appliquer sur la peau propre et sèche',
]

/**
 * Complete list of medications available in Algeria
 */
export const ALGERIAN_MEDICATIONS: MedicationData[] = [
  // ============== ANALGESICS / ANTIPYRETICS ==============
  { name: 'Paracétamol', dosages: ['500mg', '1g'], forms: ['Comprimé', 'Sirop', 'Suppositoire'], category: 'Antalgique' },
  { name: 'Paracétamol Codeine', dosages: ['500mg/30mg', '400mg/20mg'], forms: ['Comprimé'], category: 'Antalgique' },
  { name: 'Ibuprofène', dosages: ['200mg', '400mg', '600mg'], forms: ['Comprimé', 'Sirop'], category: 'Anti-inflammatoire' },
  { name: 'Kétoprofène', dosages: ['100mg', '200mg'], forms: ['Gélule', 'Injectable'], category: 'Anti-inflammatoire' },
  { name: 'Diclofénac', dosages: ['25mg', '50mg', '75mg'], forms: ['Comprimé', 'Injectable', 'Pommade'], category: 'Anti-inflammatoire' },
  { name: 'Acide acétylsalicylique', dosages: ['100mg', '250mg', '500mg'], forms: ['Comprimé'], category: 'Antalgique' },
  { name: 'Tramadol', dosages: ['50mg', '100mg'], forms: ['Comprimé', 'Gélule', 'Injectable'], category: 'Antalgique' },
  { name: 'Codéine', dosages: ['15mg', '30mg'], forms: ['Comprimé', 'Sirop'], category: 'Antalgique' },
  { name: 'Niflumique Acide', dosages: ['250mg'], forms: ['Comprimé', 'Suppositoire'], category: 'Anti-inflammatoire' },
  { name: 'Célécoxib', dosages: ['100mg', '200mg'], forms: ['Gélule'], category: 'Anti-inflammatoire' },
  { name: 'Méloxicam', dosages: ['7.5mg', '15mg'], forms: ['Comprimé'], category: 'Anti-inflammatoire' },
  { name: 'Piroxicam', dosages: ['10mg', '20mg'], forms: ['Gélule'], category: 'Anti-inflammatoire' },
  
  // ============== ANTIBIOTICS ==============
  { name: 'Amoxicilline', dosages: ['250mg', '500mg', '1g'], forms: ['Gélule', 'Sirop', 'Sachet', 'Injectable'], category: 'Antibiotique' },
  { name: 'Amoxicilline Acide Clavulanique', dosages: ['500mg/125mg', '1g/125mg'], forms: ['Comprimé', 'Sachet', 'Injectable'], category: 'Antibiotique' },
  { name: 'Azithromycine', dosages: ['250mg', '500mg'], forms: ['Comprimé', 'Sirop'], category: 'Antibiotique' },
  { name: 'Ciprofloxacine', dosages: ['250mg', '500mg', '750mg'], forms: ['Comprimé', 'Injectable'], category: 'Antibiotique' },
  { name: 'Clarithromycine', dosages: ['250mg', '500mg'], forms: ['Comprimé'], category: 'Antibiotique' },
  { name: 'Doxycycline', dosages: ['100mg'], forms: ['Gélule'], category: 'Antibiotique' },
  { name: 'Erythromycine', dosages: ['250mg', '500mg'], forms: ['Comprimé', 'Sirop'], category: 'Antibiotique' },
  { name: 'Metronidazole', dosages: ['250mg', '500mg'], forms: ['Comprimé', 'Injectable'], category: 'Antibiotique' },
  { name: 'Ceftriaxone', dosages: ['500mg', '1g', '2g'], forms: ['Injectable'], category: 'Antibiotique' },
  { name: 'Cefixime', dosages: ['100mg', '200mg', '400mg'], forms: ['Comprimé', 'Sirop'], category: 'Antibiotique' },
  { name: 'Cefuroxime', dosages: ['250mg', '500mg'], forms: ['Comprimé', 'Injectable'], category: 'Antibiotique' },
  { name: 'Gentamicine', dosages: ['40mg', '80mg', '160mg'], forms: ['Injectable', 'Collyre', 'Pommade'], category: 'Antibiotique' },
  { name: 'Amikacine', dosages: ['250mg', '500mg'], forms: ['Injectable'], category: 'Antibiotique' },
  { name: 'Spiramycine', dosages: ['1.5M UI', '3M UI'], forms: ['Comprimé'], category: 'Antibiotique' },
  { name: 'Spiramycine Metronidazole', dosages: ['1.5M UI/250mg'], forms: ['Comprimé'], category: 'Antibiotique' },
  { name: 'Clindamycine', dosages: ['150mg', '300mg', '600mg'], forms: ['Gélule', 'Injectable'], category: 'Antibiotique' },
  { name: 'Rifampicine', dosages: ['150mg', '300mg', '600mg'], forms: ['Gélule', 'Sirop'], category: 'Antibiotique' },
  { name: 'Isoniazide', dosages: ['100mg', '300mg'], forms: ['Comprimé'], category: 'Antibiotique' },
  { name: 'Sulfamethoxazole Trimethoprime', dosages: ['400mg/80mg', '800mg/160mg'], forms: ['Comprimé', 'Sirop'], category: 'Antibiotique' },
  { name: 'Fosfomycine', dosages: ['3g'], forms: ['Sachet'], category: 'Antibiotique' },
  { name: 'Ofloxacine', dosages: ['200mg', '400mg'], forms: ['Comprimé', 'Collyre'], category: 'Antibiotique' },
  { name: 'Levofloxacine', dosages: ['250mg', '500mg', '750mg'], forms: ['Comprimé', 'Injectable'], category: 'Antibiotique' },
  { name: 'Moxifloxacine', dosages: ['400mg'], forms: ['Comprimé', 'Injectable'], category: 'Antibiotique' },
  { name: 'Norfloxacine', dosages: ['400mg'], forms: ['Comprimé'], category: 'Antibiotique' },
  { name: 'Nitrofurantoine', dosages: ['50mg', '100mg'], forms: ['Gélule'], category: 'Antibiotique' },
  
  // ============== CARDIOVASCULAR ==============
  { name: 'Amlodipine', dosages: ['5mg', '10mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Aténolol', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Bisoprolol', dosages: ['2.5mg', '5mg', '10mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Carvédilol', dosages: ['3.125mg', '6.25mg', '12.5mg', '25mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Captopril', dosages: ['25mg', '50mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Enalapril', dosages: ['5mg', '10mg', '20mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Lisinopril', dosages: ['5mg', '10mg', '20mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Ramipril', dosages: ['2.5mg', '5mg', '10mg'], forms: ['Gélule'], category: 'Antihypertenseur' },
  { name: 'Losartan', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Irbesartan', dosages: ['150mg', '300mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Valsartan', dosages: ['40mg', '80mg', '160mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Hydrochlorothiazide', dosages: ['12.5mg', '25mg', '50mg'], forms: ['Comprimé'], category: 'Diurétique' },
  { name: 'Furosémide', dosages: ['20mg', '40mg'], forms: ['Comprimé', 'Injectable'], category: 'Diurétique' },
  { name: 'Spironolactone', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Diurétique' },
  { name: 'Atorvastatine', dosages: ['10mg', '20mg', '40mg', '80mg'], forms: ['Comprimé'], category: 'Hypolipémiant' },
  { name: 'Simvastatine', dosages: ['10mg', '20mg', '40mg'], forms: ['Comprimé'], category: 'Hypolipémiant' },
  { name: 'Rosuvastatine', dosages: ['5mg', '10mg', '20mg', '40mg'], forms: ['Comprimé'], category: 'Hypolipémiant' },
  { name: 'Fénofibrate', dosages: ['100mg', '145mg', '200mg'], forms: ['Comprimé', 'Gélule'], category: 'Hypolipémiant' },
  { name: 'Aspirine Cardio', dosages: ['75mg', '100mg'], forms: ['Comprimé'], category: 'Antiagrégant' },
  { name: 'Clopidogrel', dosages: ['75mg'], forms: ['Comprimé'], category: 'Antiagrégant' },
  { name: 'Diltiazem', dosages: ['30mg', '60mg', '90mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Nitroglycérine', dosages: ['0.5mg', '5mg'], forms: ['Comprimé', 'Patch'], category: 'Anti-angineux' },
  { name: 'Digoxine', dosages: ['0.25mg'], forms: ['Comprimé', 'Injectable'], category: 'Cardiotonique' },
  { name: 'Amiodarone', dosages: ['100mg', '200mg'], forms: ['Comprimé', 'Injectable'], category: 'Antiarythmique' },
  { name: 'Metoprolol', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antihypertenseur' },
  { name: 'Nifédipine', dosages: ['10mg', '20mg', '30mg'], forms: ['Gélule', 'Comprimé'], category: 'Antihypertenseur' },
  
  // ============== DIABETES ==============
  { name: 'Metformine', dosages: ['500mg', '850mg', '1000mg'], forms: ['Comprimé', 'Gélule'], category: 'Antidiabétique' },
  { name: 'Glibenclamide', dosages: ['2.5mg', '5mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Gliclazide', dosages: ['30mg', '60mg', '80mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Glimepiride', dosages: ['1mg', '2mg', '3mg', '4mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Sitagliptine', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Vildagliptine', dosages: ['50mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Linagliptine', dosages: ['5mg'], forms: ['Comprimé'], category: 'Antidiabétique' },
  { name: 'Insuline NPH', dosages: ['100UI/ml'], forms: ['Injectable'], category: 'Insuline' },
  { name: 'Insuline Rapide', dosages: ['100UI/ml'], forms: ['Injectable'], category: 'Insuline' },
  { name: 'Insuline Glargine', dosages: ['100UI/ml'], forms: ['Injectable'], category: 'Insuline' },
  { name: 'Insuline Detemir', dosages: ['100UI/ml'], forms: ['Injectable'], category: 'Insuline' },
  
  // ============== RESPIRATORY ==============
  { name: 'Salbutamol', dosages: ['100µg', '200µg', '4mg'], forms: ['Aérosol', 'Sirop', 'Comprimé'], category: 'Bronchodilatateur' },
  { name: 'Terbutaline', dosages: ['2.5mg', '5mg'], forms: ['Comprimé', 'Sirop'], category: 'Bronchodilatateur' },
  { name: 'Budésonide', dosages: ['100µg', '200µg', '400µg'], forms: ['Aérosol'], category: 'Corticoïde' },
  { name: 'Fluticasone', dosages: ['50µg', '125µg', '250µg'], forms: ['Aérosol', 'Spray'], category: 'Corticoïde' },
  { name: 'Salmétérol/Fluticasone', dosages: ['25µg/50µg', '25µg/125µg'], forms: ['Aérosol'], category: 'Bronchodilatateur' },
  { name: 'Ipratropium', dosages: ['20µg', '40µg'], forms: ['Aérosol', 'Solution'], category: 'Bronchodilatateur' },
  { name: 'Tiotropium', dosages: ['18µg'], forms: ['Gélule', 'Spray'], category: 'Bronchodilatateur' },
  { name: 'Théophylline', dosages: ['100mg', '200mg', '300mg'], forms: ['Comprimé', 'Gélule'], category: 'Bronchodilatateur' },
  { name: 'Ambroxol', dosages: ['30mg', '75mg'], forms: ['Comprimé', 'Sirop'], category: 'Mucolytique' },
  { name: 'Acétylcystéine', dosages: ['100mg', '200mg', '600mg'], forms: ['Sachet', 'Comprimé'], category: 'Mucolytique' },
  { name: 'Bromhexine', dosages: ['4mg', '8mg'], forms: ['Comprimé', 'Sirop'], category: 'Mucolytique' },
  { name: 'Loratadine', dosages: ['10mg'], forms: ['Comprimé', 'Sirop'], category: 'Antihistaminique' },
  { name: 'Cétirizine', dosages: ['10mg'], forms: ['Comprimé', 'Sirop'], category: 'Antihistaminique' },
  { name: 'Desloratadine', dosages: ['5mg'], forms: ['Comprimé', 'Sirop'], category: 'Antihistaminique' },
  { name: 'Lévocétirizine', dosages: ['5mg'], forms: ['Comprimé'], category: 'Antihistaminique' },
  { name: 'Fexofénadine', dosages: ['60mg', '120mg', '180mg'], forms: ['Comprimé'], category: 'Antihistaminique' },
  { name: 'Chlorphénamine', dosages: ['4mg'], forms: ['Comprimé', 'Sirop'], category: 'Antihistaminique' },
  { name: 'Prednisone', dosages: ['5mg', '10mg', '20mg'], forms: ['Comprimé'], category: 'Corticoïde' },
  { name: 'Prednisolone', dosages: ['5mg', '10mg', '20mg'], forms: ['Comprimé', 'Sirop'], category: 'Corticoïde' },
  { name: 'Méthylprednisolone', dosages: ['4mg', '16mg', '40mg'], forms: ['Comprimé', 'Injectable'], category: 'Corticoïde' },
  { name: 'Hydrocortisone', dosages: ['10mg', '100mg'], forms: ['Comprimé', 'Injectable'], category: 'Corticoïde' },
  
  // ============== GASTROINTESTINAL ==============
  { name: 'Oméprazole', dosages: ['10mg', '20mg', '40mg'], forms: ['Gélule', 'Injectable'], category: 'Antiulcéreux' },
  { name: 'Esoméprazole', dosages: ['20mg', '40mg'], forms: ['Gélule', 'Injectable'], category: 'Antiulcéreux' },
  { name: 'Pantoprazole', dosages: ['20mg', '40mg'], forms: ['Gélule', 'Injectable'], category: 'Antiulcéreux' },
  { name: 'Lansoprazole', dosages: ['15mg', '30mg'], forms: ['Gélule'], category: 'Antiulcéreux' },
  { name: 'Ranitidine', dosages: ['150mg', '300mg'], forms: ['Comprimé', 'Injectable'], category: 'Antiulcéreux' },
  { name: 'Famotidine', dosages: ['20mg', '40mg'], forms: ['Comprimé'], category: 'Antiulcéreux' },
  { name: 'Phosphalugel', dosages: ['10.4g'], forms: ['Sachet'], category: 'Anti-acide' },
  { name: 'Dompéridone', dosages: ['10mg'], forms: ['Comprimé', 'Sirop', 'Suppositoire'], category: 'Antiemétique' },
  { name: 'Métopimazine', dosages: ['5mg', '10mg'], forms: ['Comprimé', 'Sirop', 'Suppositoire'], category: 'Antiemétique' },
  { name: 'Ondansétron', dosages: ['4mg', '8mg'], forms: ['Comprimé', 'Injectable'], category: 'Antiemétique' },
  { name: 'Métoclopramide', dosages: ['10mg'], forms: ['Comprimé', 'Sirop', 'Injectable'], category: 'Antiemétique' },
  { name: 'Spasfon (Phloroglucinol)', dosages: ['80mg', '160mg'], forms: ['Comprimé', 'Injectable'], category: 'Antispasmodique' },
  { name: 'Drotavérine', dosages: ['40mg', '80mg'], forms: ['Comprimé', 'Injectable'], category: 'Antispasmodique' },
  { name: 'Trimebutine', dosages: ['100mg', '200mg'], forms: ['Comprimé', 'Sirop'], category: 'Antispasmodique' },
  { name: 'Lopéramide', dosages: ['2mg'], forms: ['Gélule', 'Sirop'], category: 'Antidiarrhéique' },
  { name: 'Smectite', dosages: ['3g'], forms: ['Sachet'], category: 'Antidiarrhéique' },
  { name: 'Lactulose', dosages: ['10g/15ml'], forms: ['Sirop'], category: 'Laxatif' },
  { name: 'Macrogol', dosages: ['3350mg', '4000mg'], forms: ['Sachet'], category: 'Laxatif' },
  { name: 'Bisacodyl', dosages: ['5mg', '10mg'], forms: ['Comprimé', 'Suppositoire'], category: 'Laxatif' },
  
  // ============== NEUROLOGICAL ==============
  { name: 'Carbamazépine', dosages: ['200mg', '400mg'], forms: ['Comprimé', 'Sirop'], category: 'Antiépileptique' },
  { name: 'Valproate de Sodium', dosages: ['200mg', '500mg'], forms: ['Comprimé', 'Sirop'], category: 'Antiépileptique' },
  { name: 'Phénytoïne', dosages: ['100mg'], forms: ['Comprimé', 'Injectable'], category: 'Antiépileptique' },
  { name: 'Lévétiracétam', dosages: ['250mg', '500mg', '750mg', '1000mg'], forms: ['Comprimé'], category: 'Antiépileptique' },
  { name: 'Lamotrigine', dosages: ['25mg', '50mg', '100mg', '200mg'], forms: ['Comprimé'], category: 'Antiépileptique' },
  { name: 'Topiramate', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antiépileptique' },
  { name: 'Gabapentine', dosages: ['100mg', '300mg', '400mg', '600mg'], forms: ['Gélule'], category: 'Antiépileptique' },
  { name: 'Pregabaline', dosages: ['25mg', '50mg', '75mg', '150mg', '300mg'], forms: ['Gélule'], category: 'Antiépileptique' },
  { name: 'Clonazépam', dosages: ['0.5mg', '1mg', '2mg'], forms: ['Comprimé', 'Sirop'], category: 'Anxiolytique' },
  { name: 'Diazépam', dosages: ['2mg', '5mg', '10mg'], forms: ['Comprimé', 'Sirop', 'Injectable'], category: 'Anxiolytique' },
  { name: 'Bromazépam', dosages: ['3mg', '6mg'], forms: ['Comprimé'], category: 'Anxiolytique' },
  { name: 'Alprazolam', dosages: ['0.25mg', '0.5mg', '1mg'], forms: ['Comprimé'], category: 'Anxiolytique' },
  { name: 'Lorazépam', dosages: ['1mg', '2.5mg'], forms: ['Comprimé', 'Injectable'], category: 'Anxiolytique' },
  { name: 'Fluoxétine', dosages: ['20mg'], forms: ['Gélule', 'Sirop'], category: 'Antidépresseur' },
  { name: 'Sertraline', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Paroxétine', dosages: ['20mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Citalopram', dosages: ['10mg', '20mg', '40mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Escitalopram', dosages: ['5mg', '10mg', '20mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Venlafaxine', dosages: ['37.5mg', '75mg', '150mg'], forms: ['Gélule'], category: 'Antidépresseur' },
  { name: 'Amitriptyline', dosages: ['10mg', '25mg', '50mg', '75mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Mirtazapine', dosages: ['15mg', '30mg', '45mg'], forms: ['Comprimé'], category: 'Antidépresseur' },
  { name: 'Halopéridol', dosages: ['1mg', '5mg', '10mg'], forms: ['Comprimé', 'Injectable'], category: 'Neuroleptique' },
  { name: 'Rispéridone', dosages: ['1mg', '2mg', '3mg', '4mg'], forms: ['Comprimé', 'Sirop'], category: 'Neuroleptique' },
  { name: 'Olanzapine', dosages: ['2.5mg', '5mg', '10mg', '20mg'], forms: ['Comprimé', 'Injectable'], category: 'Neuroleptique' },
  { name: 'Quetiapine', dosages: ['25mg', '100mg', '200mg', '300mg'], forms: ['Comprimé'], category: 'Neuroleptique' },
  { name: 'Lévodopa/Carbidopa', dosages: ['100mg/25mg', '250mg/25mg'], forms: ['Comprimé'], category: 'Antiparkinsonien' },
  { name: 'Lévothyrox', dosages: ['25µg', '50µg', '75µg', '100µg', '150µg'], forms: ['Comprimé'], category: 'Thyroïdien' },
  
  // ============== VITAMINS ==============
  { name: 'Vitamine B1', dosages: ['100mg', '250mg', '500mg'], forms: ['Comprimé', 'Injectable'], category: 'Vitamine' },
  { name: 'Vitamine B6', dosages: ['10mg', '50mg', '250mg'], forms: ['Comprimé', 'Injectable'], category: 'Vitamine' },
  { name: 'Vitamine B12', dosages: ['100µg', '250µg', '1000µg'], forms: ['Comprimé', 'Injectable'], category: 'Vitamine' },
  { name: 'Vitamine D3', dosages: ['400UI', '1000UI', '50000UI'], forms: ['Comprimé', 'Gouttes', 'Injectable'], category: 'Vitamine' },
  { name: 'Vitamine C', dosages: ['250mg', '500mg', '1g'], forms: ['Comprimé', 'Sirop'], category: 'Vitamine' },
  { name: 'Vitamine E', dosages: ['200mg', '400mg'], forms: ['Gélule'], category: 'Vitamine' },
  { name: 'Acide Folique', dosages: ['5mg'], forms: ['Comprimé'], category: 'Vitamine' },
  { name: 'Fer (Sulfate de Fer)', dosages: ['50mg', '100mg', '200mg'], forms: ['Comprimé', 'Sirop'], category: 'Supplément' },
  { name: 'Calcium', dosages: ['500mg', '1000mg'], forms: ['Comprimé', 'Sachet'], category: 'Supplément' },
  { name: 'Calcium/Vitamine D3', dosages: ['500mg/400UI', '1000mg/880UI'], forms: ['Comprimé', 'Sachet'], category: 'Supplément' },
  { name: 'Magnésium', dosages: ['100mg', '300mg', '500mg'], forms: ['Comprimé', 'Sachet'], category: 'Supplément' },
  { name: 'Zinc', dosages: ['10mg', '15mg', '20mg'], forms: ['Comprimé', 'Sirop'], category: 'Supplément' },
  { name: 'Multivitamines', dosages: ['Standard'], forms: ['Comprimé', 'Sirop'], category: 'Vitamine' },
  { name: 'Complex B', dosages: ['Standard'], forms: ['Comprimé', 'Injectable'], category: 'Vitamine' },
  
  // ============== DERMATOLOGICAL ==============
  { name: 'Bétaméthasone Crème', dosages: ['0.05%'], forms: ['Crème', 'Pommade'], category: 'Corticoïde topique' },
  { name: 'Hydrocortisone Crème', dosages: ['0.1%', '1%'], forms: ['Crème', 'Pommade'], category: 'Corticoïde topique' },
  { name: 'Clobétasol', dosages: ['0.05%'], forms: ['Crème', 'Pommade'], category: 'Corticoïde topique' },
  { name: 'Clotrimazole', dosages: ['1%'], forms: ['Crème', 'Solution'], category: 'Antifongique' },
  { name: 'Kétoconazole', dosages: ['2%'], forms: ['Crème', 'Shampooing'], category: 'Antifongique' },
  { name: 'Nystatine', dosages: ['100000 UI/g'], forms: ['Pommade', 'Sirop'], category: 'Antifongique' },
  { name: 'Acyclovir Topique', dosages: ['5%'], forms: ['Crème', 'Pommade'], category: 'Antiviral' },
  { name: 'Mupirocine', dosages: ['2%'], forms: ['Pommade'], category: 'Antibiotique topique' },
  { name: 'Fusidique Acide', dosages: ['2%'], forms: ['Crème', 'Pommade'], category: 'Antibiotique topique' },
  { name: 'Permethrine', dosages: ['1%', '5%'], forms: ['Crème', 'Solution'], category: 'Antiparasitaire' },
  
  // ============== OPHTHALMOLOGY ==============
  { name: 'Tobramycine Collyre', dosages: ['0.3%'], forms: ['Collyre'], category: 'Antibiotique ophtalmique' },
  { name: 'Ciprofloxacine Collyre', dosages: ['0.3%'], forms: ['Collyre'], category: 'Antibiotique ophtalmique' },
  { name: 'Chloramphénicol Collyre', dosages: ['0.5%'], forms: ['Collyre'], category: 'Antibiotique ophtalmique' },
  { name: 'Dexaméthasone Collyre', dosages: ['0.1%'], forms: ['Collyre'], category: 'Corticoïde ophtalmique' },
  { name: 'Tobramycine/Dexaméthasone Collyre', dosages: ['0.3%/0.1%'], forms: ['Collyre'], category: 'Association ophtalmique' },
  { name: 'Cyclopentolate', dosages: ['0.5%', '1%'], forms: ['Collyre'], category: 'Mydriatique' },
  { name: 'Tropicamide', dosages: ['0.5%', '1%'], forms: ['Collyre'], category: 'Mydriatique' },
  { name: 'Atropine Collyre', dosages: ['0.5%', '1%'], forms: ['Collyre'], category: 'Mydriatique' },
  { name: 'Timolol Collyre', dosages: ['0.25%', '0.5%'], forms: ['Collyre'], category: 'Antiglaucomateux' },
  { name: 'Latanoprost', dosages: ['0.005%'], forms: ['Collyre'], category: 'Antiglaucomateux' },
  { name: 'Larmes Artificielles', dosages: ['0.5%', '1%'], forms: ['Collyre'], category: 'Lubrifiant' },
  
  // ============== ANTHELMINTICS ==============
  { name: 'Albendazole', dosages: ['200mg', '400mg'], forms: ['Comprimé', 'Sirop'], category: 'Antiparasitaire' },
  { name: 'Mébendazole', dosages: ['100mg', '500mg'], forms: ['Comprimé', 'Sirop'], category: 'Antiparasitaire' },
  { name: 'Ivermectine', dosages: ['3mg', '6mg'], forms: ['Comprimé'], category: 'Antiparasitaire' },
  
  // ============== GYNECOLOGY ==============
  { name: 'Progestérone', dosages: ['100mg', '200mg', '400mg'], forms: ['Gélule', 'Injectable'], category: 'Hormone' },
  { name: 'Dydrogestérone', dosages: ['10mg'], forms: ['Comprimé'], category: 'Hormone' },
  { name: 'Utrogestan', dosages: ['100mg', '200mg'], forms: ['Gélule'], category: 'Hormone' },
  { name: 'Clomid (Clomifène)', dosages: ['50mg'], forms: ['Comprimé'], category: 'Inducteur ovulation' },
  { name: 'Ocytocine', dosages: ['5UI/ml', '10UI/ml'], forms: ['Injectable'], category: 'Ocytocique' },
  { name: 'Misoprostol', dosages: ['200µg'], forms: ['Comprimé'], category: 'Prostaglandine' },
  
  // ============== UROLOGY ==============
  { name: 'Tamsulosine', dosages: ['0.4mg'], forms: ['Gélule'], category: 'Alpha-bloquant' },
  { name: 'Alfuzosine', dosages: ['2.5mg', '10mg'], forms: ['Comprimé'], category: 'Alpha-bloquant' },
  { name: 'Finastéride', dosages: ['1mg', '5mg'], forms: ['Comprimé'], category: 'Anti-androgène' },
  { name: 'Solifénacine', dosages: ['5mg', '10mg'], forms: ['Comprimé'], category: 'Anticholinergique' },
  { name: 'Toltérodine', dosages: ['1mg', '2mg', '4mg'], forms: ['Comprimé'], category: 'Anticholinergique' },
  { name: 'Oxybutynine', dosages: ['2.5mg', '5mg'], forms: ['Comprimé', 'Sirop'], category: 'Anticholinergique' },
  { name: 'Sildénafil', dosages: ['25mg', '50mg', '100mg'], forms: ['Comprimé'], category: 'Dysfonction érectile' },
  { name: 'Tadalafil', dosages: ['2.5mg', '5mg', '10mg', '20mg'], forms: ['Comprimé'], category: 'Dysfonction érectile' },
  
  // ============== ANTIGOUT ==============
  { name: 'Allopurinol', dosages: ['100mg', '300mg'], forms: ['Comprimé'], category: 'Antigoutteux' },
  { name: 'Colchicine', dosages: ['0.5mg', '1mg'], forms: ['Comprimé'], category: 'Antigoutteux' },
  
  // ============== OSTEOPOROSIS ==============
  { name: 'Alendronate', dosages: ['10mg', '70mg'], forms: ['Comprimé'], category: 'Biphosphonate' },
  { name: 'Risédrônate', dosages: ['5mg', '35mg'], forms: ['Comprimé'], category: 'Biphosphonate' },
  
  // ============== ANTICOAGULANTS ==============
  { name: 'Héparine', dosages: ['2500UI', '5000UI'], forms: ['Injectable'], category: 'Anticoagulant' },
  { name: 'Enoxaparine', dosages: ['2000UI', '4000UI', '6000UI'], forms: ['Injectable'], category: 'Anticoagulant' },
  { name: 'Warfarine', dosages: ['1mg', '2mg', '3mg', '5mg'], forms: ['Comprimé'], category: 'Anticoagulant' },
  { name: 'Rivaroxaban', dosages: ['10mg', '15mg', '20mg'], forms: ['Comprimé'], category: 'Anticoagulant' },
  { name: 'Apixaban', dosages: ['2.5mg', '5mg'], forms: ['Comprimé'], category: 'Anticoagulant' },
  { name: 'Dabigatran', dosages: ['75mg', '110mg', '150mg'], forms: ['Gélule'], category: 'Anticoagulant' },
  
  // ============== ANESTHETICS ==============
  { name: 'Lidocaïne', dosages: ['1%', '2%', '5%'], forms: ['Injectable', 'Pommade', 'Spray'], category: 'Anesthésique' },
  { name: 'Bupivacaïne', dosages: ['0.25%', '0.5%'], forms: ['Injectable'], category: 'Anesthésique' },
  
  // ============== ORL ==============
  { name: 'Xylométazoline', dosages: ['0.05%', '0.1%'], forms: ['Spray', 'Gouttes'], category: 'Décongestionnant' },
  { name: 'Pseudoéphédrine', dosages: ['30mg', '60mg'], forms: ['Comprimé', 'Sirop'], category: 'Décongestionnant' },
  
  // ============== ANTIMALARIAL ==============
  { name: 'Chloroquine', dosages: ['100mg', '250mg', '500mg'], forms: ['Comprimé', 'Sirop', 'Injectable'], category: 'Antipaludéen' },
  { name: 'Hydroxychloroquine', dosages: ['200mg', '400mg'], forms: ['Comprimé'], category: 'Antipaludéen' },
  { name: 'Artéméther/Luméfantrine', dosages: ['20mg/120mg', '40mg/240mg'], forms: ['Comprimé', 'Sirop'], category: 'Antipaludéen' },
  { name: 'Quinine', dosages: ['250mg', '500mg'], forms: ['Comprimé', 'Injectable'], category: 'Antipaludéen' },
]

/**
 * Search medications by name
 */
export function searchMedications(query: string, limit: number = 10): MedicationData[] {
  if (!query || query.length < 2) return []
  
  const normalizedQuery = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  
  return ALGERIAN_MEDICATIONS
    .filter(med => {
      const normalizedName = med.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      return normalizedName.includes(normalizedQuery)
    })
    .slice(0, limit)
}

/**
 * Get medications by category
 */
export function getMedicationsByCategory(category: string): MedicationData[] {
  return ALGERIAN_MEDICATIONS.filter(med => 
    med.category?.toLowerCase() === category.toLowerCase()
  )
}

/**
 * Get all unique categories
 */
export function getMedicationCategories(): string[] {
  const categories = new Set<string>()
  ALGERIAN_MEDICATIONS.forEach(med => {
    if (med.category) categories.add(med.category)
  })
  return Array.from(categories).sort()
}

export default ALGERIAN_MEDICATIONS
