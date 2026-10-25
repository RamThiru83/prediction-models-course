registerModule({
  id: 'm12',
  num: 12,
  part: 'Validation',
  title: 'Clinical usefulness: thresholds, net benefit and decision curves',
  book: 'Ch. 16',
  minutes: 75,
  summary: 'How to judge whether decisions based on a prediction model are better than treating everyone or no one: decision thresholds from harms and benefits, weighted accuracy, net benefit and decision curves, and the path from prediction model to decision rule.',
  objectives: [
    'Derive a decision threshold from the harm and benefit of treatment and convert it to threshold odds',
    'Explain why accuracy and the 50% cutoff are misleading measures of clinical usefulness',
    'Calculate weighted accuracy and net benefit for a model and for the default policies treat all and treat none',
    'Interpret a decision curve over a range of plausible thresholds',
    'Explain how discrimination, calibration and the distribution of predictions around the threshold together determine usefulness',
    'Describe the levels of evidence from derivation to broad impact analysis of a decision rule'
  ],
  sections: [
    {
      id: 's1',
      title: 'From predicted risk to a decision',
      html: `
<p>A prediction model gives a probability. A clinician must decide: refer or not, treat or not, test further or not. To act on a probability, we need a <b>decision threshold</b> (also called a classification cutoff): patients with predicted risk at or above the threshold are classified as positive (for example, treated), those below as negative.</p>
<p>The book uses the term <b>clinical usefulness</b> for the ability of a model to make such classifications better than a <b>default policy</b> that does not use the model, such as treating everyone or treating no one.</p>
<h3>Why the 50% cutoff is usually wrong</h3>
<p>Classifying at 50% implies that a false-positive and a false-negative classification are equally bad. In medicine this is seldom true. Often missing a patient with the outcome is much worse than unnecessarily treating a patient without it.</p>
<ul>
<li><b>Low threshold</b>: bacterial meningitis is usually treatable if antibiotics start early but devastating if missed, so a low threshold is appropriate in order not to miss cases.</li>
<li><b>High threshold</b>: for withdrawing treatment after severe traumatic brain injury, the threshold for a poor outcome is set close to 100%, because we would only refrain from treatment with near certainty.</li>
</ul>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>Antenatal referral to a centre with a neonatal intensive care unit for women at high risk of preterm birth: an unnecessary referral costs the family travel and disruption, while failing to refer a woman who then delivers very preterm in a district hospital can cost the baby's life. The threshold for referral should therefore be well below 50%.</p></div>
<div class="callout key"><b>Key idea</b><p>The threshold is determined by the decision context (the consequences of each type of error), not by statistical criteria. Choosing it is independent of developing or validating the model; it is "not in the hands of the modeller".</p></div>
<p class="src">Source: Ch. 16, introduction, §16.1, §16.1.1, §16.4</p>
`
    },
    {
      id: 's2',
      title: 'The decision-analytic threshold: harm and benefit',
      html: `
<p>Consider the four possible classifications and their "costs" in the broad sense (mortality, morbidity, quality of life, economic costs):</p>
<table class="data">
<thead><tr><th></th><th>Event (would occur without treatment)</th><th>No event</th></tr></thead>
<tbody>
<tr><td>Treat (risk ≥ threshold)</td><td>c<sub>TP</sub></td><td>c<sub>FP</sub></td></tr>
<tr><td>Do not treat (risk &lt; threshold)</td><td>c<sub>FN</sub></td><td>c<sub>TN</sub></td></tr>
</tbody></table>
<p><b>Benefit</b> of treatment applies to those who would have the event: c<sub>FN</sub> − c<sub>TP</sub>. <b>Harm</b> applies to those who would not: c<sub>FP</sub> − c<sub>TN</sub>, the cost of overtreatment. Only these differences matter. The optimal threshold p<sub>t</sub> satisfies</p>
<div class="formula">Odds(p<sub>t</sub>) = p<sub>t</sub> / (1 − p<sub>t</sub>) = harm / benefit = (c<sub>FP</sub> − c<sub>TN</sub>) / (c<sub>FN</sub> − c<sub>TP</sub>)</div>
<p>Equivalently <span class="m">p<sub>t</sub> = harm / (harm + benefit)</span>. At this threshold, the expected benefit of treating equals the expected harm; above it, treatment is expected to do more good than harm.</p>
<div class="callout eg"><b>Worked example: thresholds from harm:benefit ratios</b>
<table class="data">
<thead><tr><th>Harm : benefit</th><th>Threshold p<sub>t</sub> = harm/(harm + benefit)</th><th>Threshold odds w = p<sub>t</sub>/(1 − p<sub>t</sub>)</th></tr></thead>
<tbody>
<tr><td>1 : 1</td><td>50%</td><td>1</td></tr>
<tr><td>3 : 7</td><td>30%</td><td>0.429</td></tr>
<tr><td>1 : 4</td><td>20%</td><td>0.25</td></tr>
<tr><td>1 : 9</td><td>10%</td><td>0.111</td></tr>
<tr><td>1 : 19</td><td>5%</td><td>0.053</td></tr>
</tbody></table>
<p>A 10% threshold means that one unnecessary treatment (FP) is valued at 1/9 of one necessary treatment (TP): we accept treating 9 women without the event to treat 1 with it.</p></div>
<div class="callout book"><b>Book example</b><p>Testicular cancer: resection of residual masses. A decision analysis suggested a threshold of 70% for the probability of benign tissue, i.e. 30% for residual tumour. Unnecessary surgery (harm) versus necessary surgery (benefit) has a ratio of 3:7, so w = 3/7.</p></div>
<p>In practice the threshold is often uncertain at population level, and individuals may weigh harms and benefits differently. Experts can usually give an order of magnitude, sometimes as lower and upper thresholds with a grey zone in between (the book's example: surgery below 30% and active surveillance above 60% probability of indolent prostate cancer). Decision curves (section 5) address this uncertainty.</p>
<p class="src">Source: Ch. 16, §16.1.2, §16.1.5, §16.1.7; Table 16.1; Ch. 2</p>
`
    },
    {
      id: 's3',
      title: 'Error rate, accuracy and weighted accuracy',
      html: `
<p>Once a threshold is set, classifications can be counted:</p>
<div class="formula">Error rate = (FN + FP) / N     Accuracy = (TP + TN) / N</div>
<p>Accuracy implicitly weights FP and FN equally, i.e. assumes a 50% threshold. It is also high for any rare (or very frequent) outcome without any model.</p>
<div class="callout book"><b>Book example</b><p>If mortality after acute myocardial infarction is 7%, classifying everyone as a survivor gives 93% accuracy.</p></div>
<h3>Weighted accuracy</h3>
<p>The harm:benefit weight w can be built in. Expressing true negatives in units of true positives:</p>
<div class="formula">Weighted accuracy = (TP + w × TN) / (N<sub>event</sub> + w × N<sub>no event</sub>)</div>
<p>and the weighted error rate = (FN + w × FP) / (N<sub>event</sub> + w × N<sub>no event</sub>). These are calculated for the model and for the default policies; the gain from the model is its weighted accuracy minus that of the better default policy.</p>
<div class="callout book"><b>Book example (Table 16.4)</b><p>Development (n = 544: 299 tumour, 245 necrosis), threshold 30% for tumour, w = 3/7. Model: 275 tumours resected (TP), 143 unnecessary resections (FP), 24 tumours missed (FN), 102 necroses spared (TN). Sensitivity 92%, specificity 42%, accuracy (275 + 102)/544 = 69%.<br>Weighted accuracy: resect all = 299/(299 + 3/7 × 245) = 74%; model = (275 + 3/7 × 102)/(299 + 3/7 × 245) = 79%.<br>Validation (n = 273: 197 tumour, 76 necrosis): accuracy 75%, weighted accuracy 86% for the model and 86% for resect all.</p></div>
<div class="callout warn"><b>Pitfall</b><p>A model can have higher accuracy at validation than at development (75% versus 69% here) and still be useless clinically. Accuracy and error rates at an arbitrary cutoff should not be used to judge clinical usefulness.</p></div>
<p>Sensitivity and specificity can also be reported at the clinically chosen threshold, but they do not combine into a single judgement of whether using the model is better than the default policy.</p>
<p class="src">Source: Ch. 16, §16.1.3-16.1.4, §16.1.7; Tables 16.2, 16.4</p>
`
    },
    {
      id: 's4',
      title: 'Net benefit',
      html: `
<p><b>Net benefit (NB)</b> counts true positives and subtracts false positives weighted by the threshold odds:</p>
<div class="formula">NB = (TP − w × FP) / N,   w = p<sub>t</sub> / (1 − p<sub>t</sub>)</div>
<p>NB is expressed in units of true positives: it is the proportion of patients correctly treated, net of the harm of unnecessary treatment, valued at the exchange rate set by the threshold. An NB of 0.03 equals 3 net true positives per 100 patients. Compare with the two default policies:</p>
<ul>
<li><b>Treat none</b>: TP = FP = 0, so NB = 0.</li>
<li><b>Treat all</b>: TP = N<sub>event</sub>, FP = N<sub>no event</sub>, so NB = incidence − w × (1 − incidence). It depends on incidence and threshold, is 0 when the threshold equals the incidence, and is negative for thresholds above the incidence.</li>
</ul>
<p>If the model requires a burdensome, invasive or costly test, its harm can be subtracted: <span class="m">NB = (TP − w × FP)/N − test harm</span>, with test harm per patient in units of a true positive.</p>
<div class="callout eg"><b>Worked example (synthetic preterm-birth referral)</b><p>Validation cohort N = 1000, 120 preterm births (12%). Threshold for referral 20% (harm:benefit 1:4), w = 0.20/0.80 = 0.25.<br>Model at 20%: TP = 72, FP = 158, FN = 48, TN = 722 (230 women referred).<br>NB model = (72 − 0.25 × 158)/1000 = (72 − 39.5)/1000 = 0.0325.<br>NB treat all = (120 − 0.25 × 880)/1000 = (120 − 220)/1000 = −0.100.<br>NB treat none = 0.<br>The model gives 3.25 net true positives per 100 women more than referring no one, and is far better than referring everyone.<br>Accuracy of the model = (72 + 722)/1000 = 79.4%, lower than the 88% of "refer no one": accuracy would wrongly favour doing nothing.<br>Weighted accuracy: model (72 + 0.25 × 722)/(120 + 0.25 × 880) = 252.5/340 = 74.3%; treat none 220/340 = 64.7%; treat all 120/340 = 35.3%.<br>If obtaining the model's inputs carried a test harm of 0.005 per woman, NB would be 0.0325 − 0.005 = 0.0275.</p></div>
<div class="callout book"><b>Book example</b><p>Testicular development data, w = 3/7: NB model = (275 − 3/7 × 143)/544 = 0.393; resect all = (299 − 3/7 × 245)/544 = 0.357; gain 0.036. Validation: model (190 − 3/7 × 60)/273 = 0.602; resect all (197 − 3/7 × 76)/273 = 0.602; gain 0. Sparing 16 men with necrosis did not compensate for missing 7 tumours, when a tumour is weighted 7/3 times a necrosis.</p></div>
<h3>Calculate it</h3>
<div data-widget="nbCalculator"></div>
<ul class="try">
<li>Enter TP 72, FP 158, FN 48, TN 722 and threshold 20%. Check the NB of the model and of treat all against the worked example.</li>
<li>Keep the counts and change the threshold to 10% and then 30%. Note how w changes and how the gap between model and treat all changes.</li>
<li>Enter the testicular validation counts with tumour as the outcome (TP 190, FP 60, FN 7, TN 16) and threshold 30%. Confirm that the model and treat all have equal NB.</li>
</ul>
<p class="src">Source: Ch. 16, §16.1.5, §16.1.7; Table 16.4; Question 16.1</p>
`
    },
    {
      id: 's5',
      title: 'Decision curves',
      html: `
<p>Because the threshold is often uncertain, Vickers and Elkin proposed the <b>decision curve</b>: net benefit plotted against the threshold probability over the range 0 to 100%, for the model, for treat all and for treat none (the horizontal line at 0). The reader identifies the range of plausible thresholds and checks whether the model has the highest NB throughout that range. If so, the model can be recommended for clinical use in that context.</p>
<h3>Features of decision curves</h3>
<ul>
<li>Treat all starts at NB = incidence at threshold 0% and falls, crossing 0 at threshold = incidence and staying negative above it. At 50% incidence it is negative for all thresholds above 50%, where w &gt; 1.</li>
<li>A model with c = 0.5 has the same NB as treat all; no gain.</li>
<li>For a well-calibrated model, the maximum gain over both default policies occurs at threshold = incidence, where both default policies have NB = 0.</li>
<li>NB increases strongly with the c statistic.</li>
</ul>
<div class="callout book"><b>Book example (Table 16.3): maximum NB at threshold = incidence</b>
<table class="data">
<thead><tr><th>Model</th><th>1%</th><th>10%</th><th>50%</th><th>90%</th></tr></thead>
<tbody>
<tr><td>c = 0.60</td><td>0.0028</td><td>0.019</td><td>0.073</td><td>0.150</td></tr>
<tr><td>c = 0.70</td><td>0.0048</td><td>0.036</td><td>0.149</td><td>0.324</td></tr>
<tr><td>c = 0.83</td><td>0.0071</td><td>0.059</td><td>0.250</td><td>0.511</td></tr>
<tr><td>c = 0.98</td><td>0.0096</td><td>0.092</td><td>0.429</td><td>0.817</td></tr>
</tbody></table>
<p>With a rare outcome (1%) even a near-perfect model gains less than 1 net true positive per 100 patients.</p></div>
<div class="callout book"><b>Book example</b><p>Testicular decision curves: the model was useful for tumour thresholds above 20% in the development data but only between 55% and 95% at validation, confirming no usefulness at the 30% threshold there. Treat all and treat none crossed at the tumour frequencies (55% and 72%).</p></div>
<h3>Explore it</h3>
<div data-widget="decisionCurveLab"></div>
<ul class="try">
<li>Set incidence 12%, c = 0.75, no miscalibration. Find where the model's curve rises furthest above both default lines and compare that threshold with the incidence.</li>
<li>Lower c to 0.55 and observe the model curve approach the treat-all curve at low thresholds and the zero line at high thresholds.</li>
<li>Restore c = 0.75 and set calibration-in-the-large to +1.0 (systematic error) and then the slope to 0.6. Note thresholds where the model's NB drops below a default policy, including below zero.</li>
<li>Enter a harm:benefit ratio of 1:4 and read the NB and net true positives per 100 at the implied 20% threshold.</li>
</ul>
<p class="src">Source: Ch. 16, §16.1.5-16.1.8; Fig. 16.1-16.2; Table 16.3; Question 16.2</p>
`
    },
    {
      id: 's6',
      title: 'Discrimination, calibration and usefulness together',
      html: `
<p>Some argue that discrimination is the primary property, since miscalibration can be corrected in a new setting. But when a model is applied, its miscalibration in that setting is not yet known. Clinical usefulness depends on the combination of three things:</p>
<ol>
<li><b>Discrimination</b>: some is needed for any usefulness.</li>
<li><b>Calibration</b>: miscalibrated risks give biased information, which can make decisions worse than a default policy, i.e. a <b>negative</b> gain in NB. A well-calibrated model with limited discrimination gives a limited, but never negative, gain.</li>
<li><b>The distribution of predictions around the threshold</b>: if all predictions lie on one side of the threshold, the model changes no decision and is not useful, even with a "good" c of 0.8.</li>
</ol>
<div class="callout warn"><b>Critical:</b><p>Labels such as "c &gt; 0.7 acceptable, &gt; 0.8 good, &gt; 0.9 excellent" do not establish clinical usefulness. No minimum c guarantees usefulness, because c ignores calibration and the consequences of decisions. Good calibration and discrimination are necessary but not sufficient.</p></div>
<div class="callout book"><b>Book example (Table 16.5)</b><p>The testicular model looked satisfactory at validation (c 0.79, calibration slope 0.74, miscalibration test p = 0.13), yet its NB gain at the 30% threshold was 0. Sensitivity was high (96%) but specificity low (21%), so few men could be spared surgery.</p></div>
<h3>Aim of the model determines which measure matters most</h3>
<table class="data">
<thead><tr><th>Application</th><th>Primary requirement</th></tr></thead>
<tbody>
<tr><td>Targeting scarce preventive resources to a high-risk group</td><td>Discrimination (ranking)</td></tr>
<tr><td>Informing patients and making clinical decisions</td><td>Calibration, together with discrimination and the distribution around the threshold</td></tr>
<tr><td>Selecting high-risk patients for an RCT</td><td>Calibration</td></tr>
<tr><td>Covariate adjustment in an RCT</td><td>Discrimination</td></tr>
<tr><td>Confounder adjustment</td><td>Inclusion of all relevant confounders; very high c is suspicious (adjusting for something too close to the outcome or exposure)</td></tr>
</tbody></table>
<div class="callout mch"><b>Illustrative (synthetic)</b><p>A gestational diabetes model with c = 0.80 is proposed to decide who needs an oral glucose tolerance test at a 10% threshold. In a clinic where nearly all women have predicted risks above 10%, the model would send everyone for testing: the same as "test all", so no gain, however good its c.</p></div>
<p class="src">Source: Ch. 16, §16.2-16.2.2; Table 16.5; §16.4</p>
`
    },
    {
      id: 's7',
      title: 'From prediction model to decision rule and impact',
      html: `
<p>A prediction model gives probabilities and leaves the action to the clinician, which allows for patient-specific thresholds. A <b>decision rule</b> attaches an explicit action to predictions, which may increase impact on practice. Rules are most useful when decisions are complex, stakes are high, or savings are possible without compromising care. Few rules have been formally tested for their effect on patient outcomes; the impact of most is unknown.</p>
<p>Some diagnostic rules aim at 100% sensitivity (for example the Ottawa ankle rules and CT head rules), accepting false positives; this implies that a false negative is treated as infinitely costly.</p>
<h3>Levels of evidence (Reilly and Evans)</h3>
<table class="data">
<thead><tr><th>Level</th><th>Study</th><th>Standard</th><th>Implication</th></tr></thead>
<tbody>
<tr><td>1</td><td>Derivation</td><td>Identification of predictors; blinded outcome assessment</td><td>Needs validation before use</td></tr>
<tr><td>2</td><td>Narrow validation</td><td>Prospective test in one setting</td><td>Use cautiously in similar patients</td></tr>
<tr><td>3</td><td>Broad validation</td><td>Varied settings, wide spectrum of patients and physicians</td><td>Predictions can be used with confidence; needs impact analysis</td></tr>
<tr><td>4</td><td>Narrow impact analysis</td><td>Prospective demonstration in one setting that the rule improves decisions</td><td>Use cautiously in similar settings</td></tr>
<tr><td>5</td><td>Broad impact analysis</td><td>Demonstration in varied settings</td><td>Use with confidence that care improves</td></tr>
</tbody></table>
<p>Validation shows the <b>efficacy</b> of a rule (what 100% adherence could achieve); impact analysis shows its <b>effectiveness</b>, which depends on clinicians' adherence. Clinicians may overrule a rule, which can improve or dilute its effect. Barriers include scepticism, doubts about clinical sense, confidence in own judgement, medicolegal fears, and practical availability and ease of use. An impact analysis is ideally a randomised trial, often randomised by centre, with a risk of contamination between arms.</p>
<h3>Verification bias</h3>
<p>If the outcome is only verified in selected patients (in the testicular example, men with masses ≤ 10 mm were usually not resected, so their histology is unknown), sensitivity, specificity and clinical usefulness measures are affected, and the evaluation says nothing about the unverified group. Model coefficients remain valid if the selection criterion is a predictor in the model.</p>
<div class="callout key"><b>Key idea</b><p>Decision curves are simple graphs that summarise a model's usefulness over all plausible thresholds. A model that is calibrated, discriminates and spreads predictions across the threshold is useful; whether it actually improves care is a separate question answered by impact studies.</p></div>
<p class="src">Source: Ch. 16, §16.1.9, §16.3-16.4; Table 16.6; Ch. 15, §15.2.9</p>
`
    }
  ],
  keyPoints: [
    'The decision threshold comes from the harm:benefit ratio of treatment: odds(p_t) = harm/benefit; it is not a statistical choice.',
    'A 50% cutoff assumes false positives and false negatives are equally bad, which is rarely true in medicine.',
    'Accuracy can favour doing nothing for a rare outcome; weighted accuracy and net benefit include the harm:benefit weight.',
    'Net benefit = (TP − w × FP)/N with w = p_t/(1 − p_t), in units of true positives; compare with treat none (0) and treat all.',
    'Treat all has NB = incidence − w(1 − incidence); it is 0 at threshold = incidence and negative at higher thresholds.',
    'A decision curve plots NB over thresholds; a model is useful if it beats both defaults across the plausible threshold range.',
    'Usefulness requires discrimination, calibration and predictions on both sides of the threshold; miscalibration can make NB worse than default.',
    'Validation shows efficacy; impact analysis (ideally randomised) shows whether a decision rule improves care in practice.'
  ],
  quiz: [
    {
      q: 'Clinicians judge that one unnecessary course of antenatal corticosteroids is one-ninth as bad as failing to give steroids before a preterm birth. What threshold risk follows?',
      options: ['5%', '10%', '11%', '90%'],
      answer: 1,
      why: 'Harm:benefit = 1:9, so p_t = 1/(1 + 9) = 10%, with threshold odds 1/9. Choosing 11% confuses the odds (0.111) with the probability; 90% inverts the ratio.'
    },
    {
      q: 'In a cohort with 6% incidence of postpartum haemorrhage, a model is compared with "treat none" on accuracy. Which statement is correct?',
      options: ['Treat none achieves 94% accuracy without any model, so accuracy is a poor guide to usefulness', 'A model with 90% accuracy is clinically useful', 'Accuracy accounts for the harm:benefit ratio', 'Accuracy equals net benefit when the threshold is 6%'],
      answer: 0,
      why: 'Accuracy implicitly assumes equal weights for FP and FN (a 50% threshold) and is high for rare outcomes by default. The misconception is that high accuracy implies usefulness; a model at 90% accuracy is worse on this measure than doing nothing.'
    },
    {
      q: 'At a 25% threshold, a model applied to 500 children with suspected pneumonia gives TP = 60 and FP = 90. What is the net benefit?',
      options: ['0.030', '0.075', '0.060', '−0.060'],
      answer: 2,
      why: 'w = 0.25/0.75 = 1/3; NB = (60 − 90/3)/500 = 30/500 = 0.060. Using w = 0.25 (the probability, not the odds) gives (60 − 22.5)/500 = 0.075, the commonest error.'
    },
    {
      q: 'In a setting with 50% incidence, why is the net benefit of "treat all" negative for every threshold above 50%?',
      options: ['Because sensitivity falls below 50%', 'Because the model becomes miscalibrated', 'Because treat none then has positive net benefit', 'Because the threshold odds w exceed 1, so with equal numbers of TP and FP the weighted false positives outweigh the true positives'],
      answer: 3,
      why: 'Treat all gives TP = FP = N/2, so NB = 0.5 − 0.5w, which is negative once w > 1, i.e. for thresholds above 50%. More generally, treat all has negative NB at any threshold above the incidence. Treat none always has NB = 0, and treat all involves no model, so calibration is irrelevant.'
    },
    {
      q: 'A preeclampsia model has c = 0.82 in a new hospital, but every woman there has a predicted risk below the treatment threshold of 15%. What is its clinical usefulness at that threshold?',
      options: ['None, because the model classifies everyone as negative, identical to treat none', 'High, because c exceeds 0.8', 'Moderate, because c is between 0.7 and 0.9', 'It cannot be judged without the Hosmer-Lemeshow test'],
      answer: 0,
      why: 'Usefulness requires predictions on both sides of the threshold. With all predictions below it, NB = 0, the same as treat none. The belief that a "good" c guarantees usefulness is explicitly rejected in the book.'
    },
    {
      q: 'Which statement best describes the role of calibration for clinical usefulness?',
      options: ['Calibration is irrelevant if discrimination is high', 'A poorly calibrated model can have lower net benefit than a default policy, whereas a well-calibrated model with weak discrimination gives a small but never negative gain', 'Calibration only matters for covariate adjustment in RCTs', 'Miscalibration always increases sensitivity'],
      answer: 1,
      why: 'Miscalibrated risks place patients on the wrong side of the threshold, which can make decisions worse than treating all or none. For covariate adjustment in an RCT, discrimination is what matters, so that distractor reverses the book.'
    }
  ],
  tasks: [
    {
      id: 't1',
      title: 'Net benefit of a neonatal sepsis model by hand',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). In a newborn unit, 700 neonates with suspected early-onset sepsis are assessed; 92 have sepsis. Neonatologists consider that starting antibiotics unnecessarily is one-ninth as harmful as missing sepsis. A model is applied at the corresponding threshold and gives: TP = 78, FP = 230, FN = 14, TN = 378.</p>`,
      questions: [
        '<b>(a)</b> Derive the threshold probability and the weight w.',
        '<b>(b)</b> Calculate sensitivity, specificity and accuracy of the model, and the accuracy of "treat none".',
        '<b>(c)</b> Calculate the net benefit of the model, of treat all and of treat none. Express the model\'s advantage in net true positives per 100 neonates.',
        '<b>(d)</b> Calculate the weighted accuracy of the model and of treat all, and state which policy is preferable and why accuracy would mislead.'
      ],
      answer: `<p><b>(a)</b> Harm:benefit = 1:9; p<sub>t</sub> = 1/(1 + 9) = 10%; w = 0.10/0.90 = 1/9 = 0.111.</p>
<p><b>(b)</b> N<sub>event</sub> = 92, N<sub>no event</sub> = 608. Sensitivity = 78/92 = 84.8%; specificity = 378/608 = 62.2%; accuracy = (78 + 378)/700 = 65.1%. Treat none: accuracy = 608/700 = 86.9%.</p>
<p><b>(c)</b> NB model = (78 − 230/9)/700 = (78 − 25.56)/700 = 0.0749. NB treat all = (92 − 608/9)/700 = (92 − 67.56)/700 = 0.0349. NB treat none = 0. The model exceeds the better default (treat all) by 0.0400, i.e. 4.0 net true positives per 100 neonates; equivalently, at the same number of true positives it avoids many unnecessary antibiotic courses.</p>
<p><b>(d)</b> Denominator = 92 + 608/9 = 159.56. Weighted accuracy model = (78 + 378/9)/159.56 = (78 + 42.0)/159.56 = 75.2%; treat all = 92/159.56 = 57.7%; treat none = 67.56/159.56 = 42.3%. The model is preferable. Unweighted accuracy favours treat none (86.9%) because it weights a missed septic baby the same as an unnecessary antibiotic course, contrary to the clinicians' 1:9 judgement.</p>`
    },
    {
      id: 't2',
      title: 'Decision Curve Lab: how calibration and incidence change usefulness',
      level: 'Analyze',
      scenario: `<p>Use the Decision Curve Lab (section 5). Start with c = 0.75, incidence 12%, calibration-in-the-large 0 and slope 1.</p>`,
      questions: [
        '<b>(a)</b> Describe the three curves. At what threshold is the model\'s advantage over both defaults largest, and why there?',
        '<b>(b)</b> Change incidence to 40%. How do the treat-all curve and the model curve change?',
        '<b>(c)</b> Return to 12%. Set the slope to 0.6 and then calibration-in-the-large to +1.0 (with slope 1). For each, describe where the model loses its advantage.',
        '<b>(d)</b> Relate your findings to the book\'s statement that a well-calibrated model with limited discrimination has limited but never negative NB.'
      ],
      answer: `<p><b>(a)</b> Treat none is the horizontal line at 0. Treat all starts at 0.12 at threshold 0 and crosses 0 at 12%, becoming negative above. The model curve lies above both over a range of low-to-moderate thresholds and approaches 0 at high thresholds. Its advantage is largest near threshold = incidence (12%), where both default policies have NB = 0.</p>
<p><b>(b)</b> Treat all starts higher (0.40) and crosses zero at 40%. The model curve rises, and its maximum advantage moves to about 40%; maximum NB is larger at higher incidence, as in Table 16.3.</p>
<p><b>(c)</b> With slope 0.6 (predictions too extreme), high-risk predictions are overstated and low-risk understated; at some thresholds the model treats the wrong women and its NB falls below the better default, potentially below zero. With calibration-in-the-large shifted, all risks are systematically off, so the effective threshold is wrong: the model may classify too many (or too few) women as positive, and it can lose to treat all at low thresholds or to treat none at higher thresholds. The exact crossing points depend on settings.</p>
<p><b>(d)</b> With perfect calibration, lowering c only shrinks the model's advantage towards the better default policy. Miscalibration is what produces NB below the default policies. Calibration should therefore be checked, and if necessary the model updated, before use for decisions in a new setting.</p>`
    },
    {
      id: 't3',
      title: 'Critique: a "clinically useful" anaemia-in-pregnancy model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). Investigators developed a model to predict moderate-to-severe anaemia at 28 weeks from booking characteristics, intended to decide which women receive intravenous iron. Their abstract states: "At the optimal cutoff (chosen by maximising sensitivity + specificity, 41%), the model had 86% accuracy, AUC 0.84 and was well calibrated (Hosmer-Lemeshow p = 0.52 in the development data). The model is therefore clinically useful and ready for implementation in all district hospitals." No decision curve was shown. Incidence in the development data was 14%.</p>`,
      questions: [
        '<b>(a)</b> Critique the choice of cutoff.',
        '<b>(b)</b> Critique the evidence offered for usefulness (accuracy, AUC, calibration).',
        '<b>(c)</b> What analysis would show clinical usefulness, and what information is needed to set the threshold?',
        '<b>(d)</b> Using the Reilly and Evans levels, where is this model, and what is required before implementation in all district hospitals?'
      ],
      answer: `<p><b>(a)</b> The cutoff was chosen by a statistical criterion (Youden index) rather than the harm:benefit of intravenous iron (infusion reactions, cost, clinic time) versus the benefit of preventing anaemia. The decision threshold should come from the decision context. A 41% threshold implies harm:benefit of about 0.41/0.59 = 0.69, i.e. an unnecessary infusion valued at about 70% of a necessary one, which needs clinical justification.</p>
<p><b>(b)</b> Accuracy of 86% is unremarkable: treating no one gives 86% accuracy at 14% incidence. AUC 0.84 says nothing about usefulness at a threshold, since c ignores calibration and decision consequences. A non-significant Hosmer-Lemeshow test in development data has no scientific meaning about calibration in new women. Critical: no internal or external validation is reported, so all measures are apparent and optimistic.</p>
<p><b>(c)</b> Net benefit at a threshold derived from harm:benefit elicited from clinicians and women, compared with treat all and treat none, and a decision curve across the plausible threshold range, preferably in validation data. Also report calibration-in-the-large and slope, and the distribution of predictions around the threshold.</p>
<p><b>(d)</b> Level 1 (derivation). Required: narrow and then broad validation (levels 2-3) in district hospitals with different case-mix, recalibration if needed, and an impact analysis (levels 4-5), ideally a cluster-randomised trial by hospital, before routine implementation.</p>`
    }
  ]
});
