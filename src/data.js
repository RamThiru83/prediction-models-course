/* Synthetic maternal & child health datasets. All records are simulated; no real participants. */
var PM = (typeof PM !== 'undefined') ? PM : {};
PM.data = {};

/* ===== 1. Preterm birth (prognostic; antenatal booking -> delivery <37 weeks) ===== */
PM.data.ptbTruth = { // true data-generating coefficients (log-odds) in the DEVELOPMENT setting
  age_u: 0.015,        // 0.015*(age-27)^2  (U-shape around 27 y)
  prior_ptb: 1.50, chronic_htn: 0.90, bacteriuria: 0.90, tobacco: 0.60, short_interval: 0.70, primigravida: 0.35,
  low_hb_per_g: 0.45,  // 0.45*max(0, 11-hb)
  low_bmi_per_unit: 0.12, // 0.12*max(0, 20-bmi)
  ses_low: 0.12,
  anc_visits: 0, female_fetus: 0, conception_monsoon: 0, height_cm: 0
};
PM.data.ptbInterceptDev = -3.6006;
PM.data.ptbInterceptVal = -2.8159;
PM.data.ptbGen = function (n, seed, setting) {
  var R = PM.rng(seed), T = PM.data.ptbTruth, val = setting === 'val', rows = [];
  var slopeScale = val ? 0.8 : 1;
  for (var i = 0; i < n; i++) {
    var age = Math.round(PM.clip(R.norm(val ? 28 : 26, val ? 5.5 : 5), 15, 44));
    var bmi = PM.round(PM.clip(R.norm(val ? 23.2 : 22.4, 3.9), 14, 42), 1);
    var hb = PM.round(PM.clip(R.norm(val ? 11.3 : 10.9, 1.3), 6, 15), 1);
    var primi = R.bern(val ? 0.38 : 0.42);
    var prior = primi ? 0 : R.bern(val ? 0.14 : 0.09);
    var shortInt = primi ? 0 : R.bern(0.12);
    var htn = R.bern(PM.clip((val ? 0.11 : 0.06) + 0.002 * (age - 26) + (bmi > 27 ? 0.03 : 0), 0.01, 0.4));
    var tob = R.bern(0.10), bact = R.bern(val ? 0.10 : 0.08), ses = R.bern(val ? 0.35 : 0.45);
    var anc = Math.round(PM.clip(R.norm(5 - 1.2 * ses, 2), 0, 12));
    var fem = R.bern(0.49), mons = R.bern(0.3), ht = PM.round(PM.clip(R.norm(153, 6), 135, 175), 0);
    var lp = (val ? PM.data.ptbInterceptVal : PM.data.ptbInterceptDev) + slopeScale * (
      T.age_u * (age - 27) * (age - 27) + T.prior_ptb * prior + T.chronic_htn * htn + T.bacteriuria * bact +
      T.tobacco * tob + T.short_interval * shortInt + T.primigravida * primi +
      T.low_hb_per_g * Math.max(0, 11 - hb) + T.low_bmi_per_unit * Math.max(0, 20 - bmi) + T.ses_low * ses);
    var y = R.bern(PM.plogis(lp));
    // missingness: Hb MAR (fewer ANC visits, low SES) in development, MCAR 5% in validation; BMI MCAR
    var pHb = val ? 0.05 : PM.plogis(-2.3 + 0.35 * (5 - anc) + 0.5 * ses);
    var hbm = R.bern(pHb) ? null : hb, bmim = R.bern(val ? 0.03 : 0.08) ? null : bmi;
    rows.push({ id: i + 1, age: age, bmi: bmim, hb: hbm, primigravida: primi, prior_ptb: prior, short_interval: shortInt, chronic_htn: htn,
      tobacco: tob, bacteriuria: bact, ses_low: ses, anc_visits: anc, female_fetus: fem, conception_monsoon: mons, height_cm: ht, preterm: y });
  }
  return rows;
};
PM.data.ptbCols = ['id', 'age', 'bmi', 'hb', 'primigravida', 'prior_ptb', 'short_interval', 'chronic_htn', 'tobacco', 'bacteriuria', 'ses_low', 'anc_visits', 'female_fetus', 'conception_monsoon', 'height_cm', 'preterm'];
PM.data.ptbLabels = {
  age: 'Maternal age (years)', bmi: 'Booking BMI (kg/m²)', hb: 'Booking haemoglobin (g/dL)', primigravida: 'First pregnancy (1 = yes)',
  prior_ptb: 'Previous preterm birth (1 = yes)', short_interval: 'Inter-pregnancy interval < 6 months (1 = yes)', chronic_htn: 'Chronic hypertension (1 = yes)',
  tobacco: 'Tobacco use, smoked or smokeless (1 = yes)', bacteriuria: 'Asymptomatic bacteriuria at booking (1 = yes)', ses_low: 'Low socio-economic status (1 = yes)',
  anc_visits: 'Antenatal visits before 28 weeks (count)', female_fetus: 'Female fetus (1 = yes)', conception_monsoon: 'Conceived in monsoon season (1 = yes)',
  height_cm: 'Maternal height (cm)', preterm: 'Preterm birth < 37 weeks (outcome, 1 = yes)'
};

/* ===== 2. Neonatal sepsis (diagnostic, cross-sectional; small sample) ===== */
PM.data.sepsisTruth = { abs_temp_dev: 0.9, resp_rate_per_bpm: 0.05, poor_feeding: 1.0, lethargy: 1.4, prom_18h: 0.8, maternal_fever: 0.7, log_crp: 0.55, birthweight_per_kg: -0.5, outborn: 0.5, male: 0, caesarean: 0 };
PM.data.sepsisIntercept = -3.9449;
PM.data.sepsisGen = function (n, seed) {
  var R = PM.rng(seed), T = PM.data.sepsisTruth, rows = [];
  for (var i = 0; i < n; i++) {
    var bw = PM.round(PM.clip(R.norm(2.7, 0.55), 1.0, 4.5), 2);
    var temp = PM.round(PM.clip(R.norm(37.0, 0.55), 34, 40), 1);
    var rr = Math.round(PM.clip(R.norm(48, 9), 25, 90));
    var pf = R.bern(0.2), let_ = R.bern(0.1), prom = R.bern(0.12), mf = R.bern(0.08), ob = R.bern(0.25);
    var crp = PM.round(Math.exp(R.norm(1.0, 1.0)), 1);
    var male = R.bern(0.52), cs = R.bern(0.3);
    var lp = PM.data.sepsisIntercept + T.abs_temp_dev * Math.abs(temp - 37) + T.resp_rate_per_bpm * (rr - 48) + T.poor_feeding * pf + T.lethargy * let_ +
      T.prom_18h * prom + T.maternal_fever * mf + T.log_crp * Math.log(crp + 1) + T.birthweight_per_kg * (bw - 2.7) + T.outborn * ob;
    rows.push({ id: i + 1, temp_c: temp, resp_rate: rr, poor_feeding: pf, lethargy: let_, prom_18h: prom, maternal_fever: mf, crp_mg_l: crp, birthweight_kg: bw, outborn: ob, male: male, caesarean: cs, sepsis: R.bern(PM.plogis(lp)) });
  }
  return rows;
};
PM.data.sepsisCols = ['id', 'temp_c', 'resp_rate', 'poor_feeding', 'lethargy', 'prom_18h', 'maternal_fever', 'crp_mg_l', 'birthweight_kg', 'outborn', 'male', 'caesarean', 'sepsis'];
PM.data.sepsisLabels = {
  temp_c: 'Axillary temperature (°C)', resp_rate: 'Respiratory rate (breaths/min)', poor_feeding: 'Poor feeding (1 = yes)', lethargy: 'Lethargy (1 = yes)',
  prom_18h: 'Membranes ruptured > 18 h (1 = yes)', maternal_fever: 'Maternal fever in labour (1 = yes)', crp_mg_l: 'C-reactive protein (mg/L)',
  birthweight_kg: 'Birthweight (kg)', outborn: 'Born outside the hospital (1 = yes)', male: 'Male (1 = yes)', caesarean: 'Caesarean delivery (1 = yes)',
  sepsis: 'Culture-proven sepsis (outcome, 1 = yes)'
};

/* ===== 3. Gestational diabetes (first-trimester risk) ===== */
PM.data.gdmTruth = { age_per_year: 0.05, bmi_per_unit: 0.09, family_dm: 0.6, prior_gdm: 1.3, fasting_glucose_per_mgdl: 0.06, hb: 0, height_cm: 0, ses_low: 0 };
PM.data.gdmIntercept = -10.7347;
PM.data.gdmGen = function (n, seed) {
  var R = PM.rng(seed), T = PM.data.gdmTruth, rows = [];
  for (var i = 0; i < n; i++) {
    var age = Math.round(PM.clip(R.norm(28, 4.5), 18, 44));
    var bmi = PM.round(PM.clip(R.norm(24.5, 4), 15, 42), 1);
    var fam = R.bern(0.25), prior = R.bern(0.05);
    var fpg = Math.round(PM.clip(R.norm(84 + 0.4 * (bmi - 24), 8), 60, 125));
    var hb = PM.round(PM.clip(R.norm(11.2, 1.2), 7, 15), 1), ht = Math.round(PM.clip(R.norm(155, 6), 138, 175)), ses = R.bern(0.4);
    var lp = PM.data.gdmIntercept + T.age_per_year * age + T.bmi_per_unit * bmi + T.family_dm * fam + T.prior_gdm * prior + T.fasting_glucose_per_mgdl * fpg;
    rows.push({ id: i + 1, age: age, bmi: bmi, family_dm: fam, prior_gdm: prior, fasting_glucose: fpg, hb: hb, height_cm: ht, ses_low: ses, gdm: R.bern(PM.plogis(lp)) });
  }
  return rows;
};
PM.data.gdmCols = ['id', 'age', 'bmi', 'family_dm', 'prior_gdm', 'fasting_glucose', 'hb', 'height_cm', 'ses_low', 'gdm'];
PM.data.gdmLabels = {
  age: 'Maternal age (years)', bmi: 'First-trimester BMI (kg/m²)', family_dm: 'Parent or sibling with diabetes (1 = yes)', prior_gdm: 'Gestational diabetes in a previous pregnancy (1 = yes)',
  fasting_glucose: 'Fasting plasma glucose at booking (mg/dL)', hb: 'Haemoglobin (g/dL)', height_cm: 'Height (cm)', ses_low: 'Low socio-economic status (1 = yes)',
  gdm: 'Gestational diabetes at 24-28 weeks (outcome, 1 = yes)'
};

/* ===== registry used by the app ===== */
PM.data.sets = {
  ptb_dev: { id: 'ptb_dev', file: 'ptb_development.csv', title: 'Preterm birth: development cohort', n: 2000, seed: 20261, cols: PM.data.ptbCols, labels: PM.data.ptbLabels, outcome: 'preterm', make: function () { return PM.data.ptbGen(2000, 20261, 'dev'); }, setting: 'District hospital antenatal clinic, booking to delivery' },
  ptb_val: { id: 'ptb_val', file: 'ptb_validation.csv', title: 'Preterm birth: validation cohort (referral hospital)', n: 1200, seed: 20262, cols: PM.data.ptbCols, labels: PM.data.ptbLabels, outcome: 'preterm', make: function () { return PM.data.ptbGen(1200, 20262, 'val'); }, setting: 'Tertiary referral hospital, later period' },
  sepsis: { id: 'sepsis', file: 'neonatal_sepsis.csv', title: 'Neonatal sepsis: diagnostic study', n: 700, seed: 20263, cols: PM.data.sepsisCols, labels: PM.data.sepsisLabels, outcome: 'sepsis', make: function () { return PM.data.sepsisGen(700, 20263); }, setting: 'Newborn unit, cross-sectional work-up of suspected sepsis' },
  gdm: { id: 'gdm', file: 'gestational_diabetes.csv', title: 'Gestational diabetes: first-trimester risk', n: 1500, seed: 20264, cols: PM.data.gdmCols, labels: PM.data.gdmLabels, outcome: 'gdm', make: function () { return PM.data.gdmGen(1500, 20264); }, setting: 'Antenatal clinic cohort, booking visit to 24-28 week screening' }
};
PM.data._cache = {};
PM.data.get = function (id) { if (!PM.data._cache[id]) PM.data._cache[id] = PM.data.sets[id].make(); return PM.data._cache[id]; };
PM.data.toCSV = function (id) {
  var s = PM.data.sets[id], rows = PM.data.get(id), lines = [s.cols.join(',')];
  rows.forEach(function (r) { lines.push(s.cols.map(function (c) { var v = r[c]; return (v === null || v === undefined) ? '' : v; }).join(',')); });
  return lines.join('\n') + '\n';
};
PM.data.codebook = function (id) {
  var s = PM.data.sets[id], L = ['CODEBOOK: ' + s.title, 'Setting (fictional): ' + s.setting, 'All records are SIMULATED for teaching. They describe no real person. Missing values are blank cells.', 'Rows: ' + s.n, ''];
  s.cols.forEach(function (c) { L.push(c + ' : ' + (c === 'id' ? 'Record number' : s.labels[c])); });
  return L.join('\n') + '\n';
};
if (typeof module !== 'undefined') module.exports = PM;
