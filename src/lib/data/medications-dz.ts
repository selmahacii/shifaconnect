
export interface MedicationData {
  name: string;
  dosages: string[];
  forms: string[];
}

export const MEDICATIONS_DZ: MedicationData[] = [
  {
    name: "Paracétamol",
    dosages: ["500mg", "1g", "150mg", "300mg"],
    forms: ["Comprimé", "Gélule", "Suppositoire", "Sirop", "Sachet"]
  },
  {
    name: "Amoxicilline",
    dosages: ["500mg", "1g", "250mg/5ml"],
    forms: ["Gélule", "Poudre pour suspension buvable", "Comprimé dispersible"]
  },
  {
    name: "Amoxicilline + Acide Clavulanique (Augmentin)",
    dosages: ["1g/125mg", "500/62.5mg", "100mg/12.5mg"],
    forms: ["Comprimé", "Sachet", "Sirop"]
  },
  {
    name: "Ibuprofène",
    dosages: ["200mg", "400mg", "600mg", "2% (sirop)"],
    forms: ["Comprimé", "Gel", "Sirop"]
  },
  {
    name: "Métformine (Glucophage)",
    dosages: ["500mg", "850mg", "1000mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Oméprazole",
    dosages: ["10mg", "20mg", "40mg"],
    forms: ["Gélule gastro-résistante"]
  },
  {
    name: "Amlodipine",
    dosages: ["5mg", "10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Atorvastatine (Tahor)",
    dosages: ["10mg", "20mg", "40mg", "80mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Diclofénac (Voltarène)",
    dosages: ["25mg", "50mg", "75mg", "100mg"],
    forms: ["Comprimé", "Suppositoire", "Injectable", "Gel"]
  },
  {
    name: "Loratadine (Clarityne)",
    dosages: ["10mg", "1mg/ml"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Salbutamol (Ventoline)",
    dosages: ["100µg/dose", "2mg", "0.5mg/ml"],
    forms: ["Spray inhalation", "Sirop", "Injectable"]
  },
  {
    name: "Ceftriaxone (Rocéphine)",
    dosages: ["500mg", "1g", "2g"],
    forms: ["Injectable (IM/IV)"]
  },
  {
    name: "Spasfon (Phloroglucinol)",
    dosages: ["80mg", "40mg/4ml"],
    forms: ["Comprimé", "Lyoc", "Injectable"]
  },
  {
    name: "Gaviscon",
    dosages: ["Sachet", "250mg/5ml"],
    forms: ["Suspension buvable", "Comprimé à croquer"]
  },
  {
    name: "Azithromycine (Zithromax)",
    dosages: ["250mg", "500mg", "200mg/5ml"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Ciprofloxacine",
    dosages: ["250mg", "500mg", "750mg"],
    forms: ["Comprimé", "Collyre"]
  },
  {
    name: "Furosémide (Lasilix)",
    dosages: ["20mg", "40mg", "500mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Bisoprolol (Detensiel)",
    dosages: ["1.25mg", "2.5mg", "5mg", "10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Lévothyroxine (Lévothyrox)",
    dosages: ["25µg", "50µg", "75µg", "100µg", "125µg", "150µg"],
    forms: ["Comprimé"]
  },
  {
    name: "Prednisolone (Solupred)",
    dosages: ["5mg", "20mg"],
    forms: ["Comprimé orodispersible"]
  },
  {
    name: "Mousline (Céfaclor)",
    dosages: ["250mg", "500mg", "125mg/5ml"],
    forms: ["Gélule", "Sirop"]
  },
  {
    name: "Doliprane",
    dosages: ["500mg", "1000mg", "150mg", "300mg"],
    forms: ["Comprimé", "Gélule", "Suppositoire", "Sirop", "Sachet"]
  },
  {
    name: "Efferalgan",
    dosages: ["500mg", "1g"],
    forms: ["Comprimé effervescent", "Gélule"]
  },
  {
    name: "Panadol",
    dosages: ["500mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Aspegic",
    dosages: ["100mg", "250mg", "500mg", "1000mg"],
    forms: ["Sachet", "Injectable"]
  },
  {
    name: "Clamoxyl",
    dosages: ["500mg", "1g"],
    forms: ["Gélule", "Poudre"]
  },
  {
    name: "Bristopen",
    dosages: ["500mg"],
    forms: ["Gélule", "Injectable"]
  },
  {
    name: "Zinnat",
    dosages: ["250mg", "500mg"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Flagyl (Métronidazole)",
    dosages: ["250mg", "500mg"],
    forms: ["Comprimé", "Ovule", "Sirop", "Injectable"]
  },
  {
    name: "Pyostacine",
    dosages: ["500mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Rulid",
    dosages: ["150mg", "300mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Josacine",
    dosages: ["500mg", "1000mg"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Zéclar",
    dosages: ["250mg", "500mg"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Oflocet",
    dosages: ["200mg"],
    forms: ["Comprimé", "Injectable", "Collyre"]
  },
  {
    name: "Tavanic",
    dosages: ["500mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Avelox",
    dosages: ["400mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Vibramycine",
    dosages: ["100mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Tétracycline",
    dosages: ["250mg", "500mg"],
    forms: ["Gélule", "Pommade ophtalmique"]
  },
  {
    name: "Erythromycine",
    dosages: ["500mg", "1000mg"],
    forms: ["Comprimé", "Sirop", "Solution cutanée"]
  },
  {
    name: "Bactrim",
    dosages: ["400/80mg", "800/160mg"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Nifuroxazide (Ercéfuryl)",
    dosages: ["200mg", "4% (sirop)"],
    forms: ["Gélule", "Sirop"]
  },
  {
    name: "Smecta",
    dosages: ["3g"],
    forms: ["Sachet"]
  },
  {
    name: "Météospasmyl",
    dosages: ["60mg/300mg"],
    forms: ["Gélule"]
  },
  {
    name: "Duspatalin",
    dosages: ["135mg", "200mg"],
    forms: ["Comprimé", "Gélule"]
  },
  {
    name: "Librax",
    dosages: ["5mg/2.5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Inexium (Esoméprazole)",
    dosages: ["20mg", "40mg"],
    forms: ["Comprimé", "Sachet", "Injectable"]
  },
  {
    name: "Mopral",
    dosages: ["10mg", "20mg"],
    forms: ["Gélule"]
  },
  {
    name: "Zantac (Ranitidine)",
    dosages: ["150mg", "300mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Maalox",
    dosages: ["400/400mg"],
    forms: ["Comprimé à croquer", "Sachet"]
  },
  {
    name: "Motilium (Dompéridone)",
    dosages: ["10mg", "1mg/ml"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Primpéran",
    dosages: ["10mg", "0.1% (sirop)"],
    forms: ["Comprimé", "Sirop", "Suppositoire", "Injectable"]
  },
  {
    name: "Vogalène",
    dosages: ["15mg", "0.1% (sirop)"],
    forms: ["Gélule", "Lyoc", "Sirop", "Suppositoire", "Injectable"]
  },
  {
    name: "Plavix (Clopidogrel)",
    dosages: ["75mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Kardegic",
    dosages: ["75mg", "160mg", "300mg"],
    forms: ["Sachet"]
  },
  {
    name: "Sintrom",
    dosages: ["4mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Previscan",
    dosages: ["20mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Lovenox",
    dosages: ["2000 UI", "4000 UI", "6000 UI", "8000 UI"],
    forms: ["Seringue pré-remplie"]
  },
  {
    name: "Innohep",
    dosages: ["10000 UI", "14000 UI", "18000 UI"],
    forms: ["Seringue pré-remplie"]
  },
  {
    name: "Diamicron",
    dosages: ["30mg", "60mg", "80mg"],
    forms: ["Comprimé à libération modifiée"]
  },
  {
    name: "Amaryl",
    dosages: ["1mg", "2mg", "3mg", "4mg", "6mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Januvia",
    dosages: ["25mg", "50mg", "100mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Galvus",
    dosages: ["50mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Eucreas",
    dosages: ["50/850mg", "50/1000mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Janumet",
    dosages: ["50/850mg", "50/1000mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Stagid",
    dosages: ["700mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Daonil",
    dosages: ["5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "NovoNorm",
    dosages: ["0.5mg", "1mg", "2mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Lantus (Insuline Glargine)",
    dosages: ["100 UI/ml"],
    forms: ["Stylo pré-rempli", "Flacon"]
  },
  {
    name: "NovoMix 30",
    dosages: ["100 UI/ml"],
    forms: ["Stylo pré-rempli"]
  },
  {
    name: "Actrapid",
    dosages: ["100 UI/ml"],
    forms: ["Flacon"]
  },
  {
    name: "Aprovel (Irbésartan)",
    dosages: ["75mg", "150mg", "300mg"],
    forms: ["Comprimé"]
  },
  {
    name: "CoAprovel",
    dosages: ["150/12.5mg", "300/12.5mg", "300/25mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Tareg (Valsartan)",
    dosages: ["40mg", "80mg", "160mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Cotareg",
    dosages: ["80/12.5mg", "160/12.5mg", "160/25mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Exforge",
    dosages: ["5/80mg", "5/160mg", "10/160mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Triplixam",
    dosages: ["5/1.25/5mg", "5/1.25/10mg", "10/2.5/5mg", "10/2.5/10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Conversyl (Périndopril)",
    dosages: ["2.5mg", "5mg", "10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Bi-Conversyl",
    dosages: ["2.5/0.625mg", "5/1.25mg", "10/2.5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Zestril (Lisinopril)",
    dosages: ["5mg", "10mg", "20mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Zestoretic",
    dosages: ["20/12.5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Cozaar",
    dosages: ["50mg", "100mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Hyzaar",
    dosages: ["50/12.5mg", "100/25mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Loxen (Nicardipine)",
    dosages: ["20mg", "50mg"],
    forms: ["Gélule", "Injectable"]
  },
  {
    name: "Adalate",
    dosages: ["10mg", "20mg", "30mg", "60mg"],
    forms: ["Comprimé", "Gélule"]
  },
  {
    name: "Tildiem",
    dosages: ["60mg", "120mg", "200mg", "300mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Isoptine (Vérapamil)",
    dosages: ["40mg", "120mg", "240mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Tenormine (Aténolol)",
    dosages: ["50mg", "100mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Sectral (Acébutolol)",
    dosages: ["200mg", "400mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Avlocardyl (Propranolol)",
    dosages: ["40mg", "160mg"],
    forms: ["Comprimé", "Gélule"]
  },
  {
    name: "Cardensiel",
    dosages: ["1.25mg", "2.5mg", "3.75mg", "5mg", "7.5mg", "10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Aldactone (Spironolactone)",
    dosages: ["25mg", "50mg", "75mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Esidrex",
    dosages: ["25mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Moduretic",
    dosages: ["50/5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Crestor (Rosuvastatine)",
    dosages: ["5mg", "10mg", "20mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Lipanthyl",
    dosages: ["145mg", "160mg", "200mg", "215mg"],
    forms: ["Comprimé", "Gélule"]
  },
  {
    name: "Zocor",
    dosages: ["10mg", "20mg", "40mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Vasten",
    dosages: ["20mg", "40mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Ezetrol",
    dosages: ["10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Inegy",
    dosages: ["10/20mg", "10/40mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Aerius (Desloratadine)",
    dosages: ["5mg", "0.5mg/ml"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Zyrtec (Cétirizine)",
    dosages: ["10mg", "10mg/ml"],
    forms: ["Comprimé", "Gouttes buvables"]
  },
  {
    name: "Kestin",
    dosages: ["10mg", "20mg"],
    forms: ["Comprimé", "Lyoc"]
  },
  {
    name: "Xyzall",
    dosages: ["5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Atarax",
    dosages: ["25mg", "100mg", "2mg/ml"],
    forms: ["Comprimé", "Sirop", "Injectable"]
  },
  {
    name: "Polaramine",
    dosages: ["2mg", "5mg", "0.4mg/ml"],
    forms: ["Comprimé", "Repetabs", "Sirop", "Injectable"]
  },
  {
    name: "Clamoxyl",
    dosages: ["500mg", "1g"],
    forms: ["Gélule", "Poudre"]
  },
  {
    name: "Seretide",
    dosages: ["50/100", "50/250", "50/500"],
    forms: ["Diskus", "Spray"]
  },
  {
    name: "Symbicort",
    dosages: ["100/6", "200/6", "400/12"],
    forms: ["Turbuhaler"]
  },
  {
    name: "Singulair (Montélukast)",
    dosages: ["4mg", "5mg", "10mg"],
    forms: ["Comprimé à croquer", "Comprimé"]
  },
  {
    name: "Miflasone",
    dosages: ["200µg", "400µg"],
    forms: ["Gélule pour inhalation"]
  },
  {
    name: "Bécotide",
    dosages: ["50µg", "250µg"],
    forms: ["Inhalateur"]
  },
  {
    name: "Hélicidine",
    dosages: ["10%"],
    forms: ["Sirop"]
  },
  {
    name: "Toplexil",
    dosages: ["0.33mg/ml"],
    forms: ["Sirop"]
  },
  {
    name: "Rhinathiol",
    dosages: ["2%", "5%"],
    forms: ["Sirop"]
  },
  {
    name: "Mucomyst",
    dosages: ["200mg"],
    forms: ["Poudre", "Solution pour nébulisation"]
  },
  {
    name: "Fluimucil",
    dosages: ["200mg", "600mg"],
    forms: ["Sachet", "Comprimé effervescent"]
  },
  {
    name: "Maxilase",
    dosages: ["3000 U", "20000 U"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Strepsils",
    dosages: ["Miel-Citron"],
    forms: ["Pastille"]
  },
  {
    name: "Angispray",
    dosages: ["Flacon 40ml"],
    forms: ["Collutoire"]
  },
  {
    name: "Bétadine",
    dosages: ["10%"],
    forms: ["Solution dermique", "Gargarisme", "Ovule"]
  },
  {
    name: "Biafine",
    dosages: ["Tube 186g"],
    forms: ["Émulsion"]
  },
  {
    name: "Madecassol",
    dosages: ["1%"],
    forms: ["Pommade", "Comprimé"]
  },
  {
    name: "Cicatryl",
    dosages: ["Sachet"],
    forms: ["Pommade"]
  },
  {
    name: "Fucidine",
    dosages: ["2%"],
    forms: ["Crème", "Pommade"]
  },
  {
    name: "Auréomycine",
    dosages: ["1%", "3%"],
    forms: ["Pommade ophtalmique", "Pommade dermique"]
  },
  {
    name: "Daktarin",
    dosages: ["2%"],
    forms: ["Crème", "Poudre", "Gel buccal"]
  },
  {
    name: "Pevaryl",
    dosages: ["1%"],
    forms: ["Crème", "Solution", "Lait"]
  },
  {
    name: "Mycohydralin",
    dosages: ["200mg", "500mg"],
    forms: ["Comprimé vaginal"]
  },
  {
    name: "Dermoval (Clobétasol)",
    dosages: ["0.05%"],
    forms: ["Crème", "Pommade", "Gel"]
  },
  {
    name: "Diprosone",
    dosages: ["0.05%"],
    forms: ["Crème", "Pommade", "Lotion"]
  },
  {
    name: "Tridesitit",
    dosages: ["0.1%"],
    forms: ["Crème"]
  },
  {
    name: "Econazole",
    dosages: ["1%"],
    forms: ["Crème", "Ovule"]
  },
  {
    name: "Ketoderm",
    dosages: ["2%"],
    forms: ["Gel", "Crème"]
  },
  {
    name: "Lamisil (Terbinafine)",
    dosages: ["250mg", "1%"],
    forms: ["Comprimé", "Crème", "Spray"]
  },
  {
    name: "Zovirax (Acyclovir)",
    dosages: ["200mg", "800mg", "5%"],
    forms: ["Comprimé", "Crème", "Pommade ophtalmique"]
  },
  {
    name: "Roaccutane (Isotrétinoïne)",
    dosages: ["5mg", "10mg", "20mg"],
    forms: ["Gélule"]
  },
  {
    name: "Différine (Adapalène)",
    dosages: ["0.1%"],
    forms: ["Crème", "Gel"]
  },
  {
    name: "Piasclédine",
    dosages: ["300mg"],
    forms: ["Gélule"]
  },
  {
    name: "Chondrosulf",
    dosages: ["400mg", "1200mg"],
    forms: ["Gélule", "Sachet"]
  },
  {
    name: "Stérogyl",
    dosages: ["2000 UI/g"],
    forms: ["Gouttes buvables"]
  },
  {
    name: "Uvedose",
    dosages: ["100000 UI"],
    forms: ["Ampoule buvable"]
  },
  {
    name: "Tardyferon",
    dosages: ["80mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Speciafoldine (Acide folique)",
    dosages: ["5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Mag 2",
    dosages: ["100mg", "1.5g"],
    forms: ["Comprimé", "Ampoule buvable"]
  },
  {
    name: "Azinc",
    dosages: ["Multivitamines"],
    forms: ["Gélule"]
  },
  {
    name: "Supradyn",
    dosages: ["Multivitamines"],
    forms: ["Comprimé effervescent"]
  },
  {
    name: "Becozyme",
    dosages: ["Vitamine B Complex"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Laroscorbine (Vitamine C)",
    dosages: ["500mg", "1g"],
    forms: ["Comprimé", "Comprimé effervescent", "Injectable"]
  },
  {
    name: "Neurobion (B1+B6+B12)",
    dosages: ["Standard"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Lexomil (Bromazépam)",
    dosages: ["6mg"],
    forms: ["Comprimé baguette"]
  },
  {
    name: "Xanax (Alprazolam)",
    dosages: ["0.25mg", "0.50mg", "1mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Valium (Diazépam)",
    dosages: ["1% (sirop)", "10mg (injectable)", "2mg", "5mg", "10mg"],
    forms: ["Comprimé", "Gouttes", "Injectable"]
  },
  {
    name: "Temesta (Lorazépam)",
    dosages: ["1mg", "2.5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Stilnox (Zolpidem)",
    dosages: ["10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Imovane (Zopiclone)",
    dosages: ["7.5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Deroxat (Paroxétine)",
    dosages: ["20mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Prozac (Fluoxétine)",
    dosages: ["20mg"],
    forms: ["Gélule"]
  },
  {
    name: "Seroplex (Escitalopram)",
    dosages: ["5mg", "10mg", "20mg"],
    forms: ["Comprimé", "Gouttes"]
  },
  {
    name: "Zoloft (Sertraline)",
    dosages: ["50mg"],
    forms: ["Gélule"]
  },
  {
    name: "Effexor (Venlafaxine)",
    dosages: ["37.5mg", "75mg"],
    forms: ["Gélule"]
  },
  {
    name: "Abilify (Aripiprazole)",
    dosages: ["5mg", "10mg", "15mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Zyprexa (Olanzapine)",
    dosages: ["5mg", "7.5mg", "10mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Risperdal (Rispéridone)",
    dosages: ["1mg", "2mg", "4mg", "1mg/ml"],
    forms: ["Comprimé", "Solution buvable"]
  },
  {
    name: "Haldol (Halopéridol)",
    dosages: ["1mg", "5mg", "2mg/ml"],
    forms: ["Comprimé", "Gouttes", "Injectable"]
  },
  {
    name: "Tegretol (Carbamazépine)",
    dosages: ["200mg", "400mg", "2% (sirop)"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Dépakine (Valproate de Sodium)",
    dosages: ["200mg", "500mg", "200mg/ml"],
    forms: ["Comprimé", "Sirop", "Solution buvable"]
  },
  {
    name: "Képpra (Lévétiracétam)",
    dosages: ["250mg", "500mg", "1000mg"],
    forms: ["Comprimé", "Sirop"]
  },
  {
    name: "Lamictal",
    dosages: ["25mg", "50mg", "100mg", "200mg"],
    forms: ["Comprimé dispersible"]
  },
  {
    name: "Vogalène",
    dosages: ["15mg", "0.1% (sirop)"],
    forms: ["Gélule", "Lyoc", "Sirop", "Suppositoire", "Injectable"]
  },
  {
    name: "Tanakan",
    dosages: ["40mg", "40mg/ml"],
    forms: ["Comprimé", "Gouttes buvables"]
  },
  {
    name: "Serc (Bétahistine)",
    dosages: ["8mg", "16mg", "24mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Tanganil (Acétylleucine)",
    dosages: ["500mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Artane (Trihéxyphénidyle)",
    dosages: ["2mg", "5mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Sinemet (Lévodopa+Carbidopa)",
    dosages: ["100/10mg", "250/25mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Tramadol (Topalgic)",
    dosages: ["50mg", "100mg", "100mg/ml", "100mg (injectable)"],
    forms: ["Gélule", "Comprimé LP", "Gouttes", "Injectable"]
  },
  {
    name: "Ixprim (Tramadol+Paracétamol)",
    dosages: ["37.5/325mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Di-Antalvic",
    dosages: ["30/325mg"],
    forms: ["Gélule"]
  },
  {
    name: "Lyrica (Prégabaline)",
    dosages: ["75mg", "150mg", "300mg"],
    forms: ["Gélule"]
  },
  {
    name: "Neurontin (Gabapentine)",
    dosages: ["300mg", "400mg", "600mg"],
    forms: ["Gélule"]
  },
  {
    name: "Anafranil (Clomipramine)",
    dosages: ["10mg", "25mg", "75mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Ludiomil",
    dosages: ["25mg", "75mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Sibutramine",
    dosages: ["10mg", "15mg"],
    forms: ["Gélule"]
  },
  {
    name: "Xenical (Orlistat)",
    dosages: ["120mg"],
    forms: ["Gélule"]
  },
  {
    name: "Colchicine",
    dosages: ["1mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Zyloric (Allopurinol)",
    dosages: ["100mg", "200mg", "300mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Adenuric",
    dosages: ["80mg", "120mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Feldène (Piroxicam)",
    dosages: ["20mg"],
    forms: ["Gélule", "Injectable", "Gel"]
  },
  {
    name: "Mobic (Méloxicam)",
    dosages: ["7.5mg", "15mg"],
    forms: ["Comprimé", "Injectable"]
  },
  {
    name: "Celebrex (Célécoxib)",
    dosages: ["100mg", "200mg"],
    forms: ["Gélule"]
  },
  {
    name: "Arcoxia (Étoricoxib)",
    dosages: ["30mg", "60mg", "90mg", "120mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Brexin",
    dosages: ["20mg"],
    forms: ["Comprimé", "Sachet"]
  },
  {
    name: "Apranax (Naproxène)",
    dosages: ["275mg", "550mg"],
    forms: ["Comprimé"]
  },
  {
    name: "Nifluril",
    dosages: ["250mg", "400mg", "700mg"],
    forms: ["Gélule", "Suppositoire", "Pommade"]
  },
  {
    name: "Profénid (Kétoprofène)",
    dosages: ["50mg", "100mg", "200mg", "100mg (injectable)"],
    forms: ["Gélule", "Comprimé", "Suppositoire", "Injectable", "Gel"]
  },
  {
    name: "Bi-Profénid",
    dosages: ["150mg"],
    forms: ["Comprimé sécable"]
  },
  {
    name: "Ketum",
    dosages: ["2.5%"],
    forms: ["Gel"]
  }
];
