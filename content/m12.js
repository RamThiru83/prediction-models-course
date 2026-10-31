registerModule({
  id: 'm12',
  num: 12,
  part: 'Validation',
  title: 'Clinical usefulness: thresholds, net benefit and decision curves',
  book: 'Ch. 16',
  minutes: 75,
  summary: 'How to judge whether decisions based on a prediction model are better than treating everyone or no one: decision thresholds from harms and benefits, weighted accuracy, net benefit and decision curves, and the path from prediction model to decision rule.',
  objectives: [
    'Set a threshold from harm and benefit',
    'Explain why plain accuracy misleads',
    'Calculate weighted accuracy and net benefit',
    'Compare a model with treat all, treat none',
    'Read a decision curve over plausible thresholds',
    'Place a decision rule on evidence levels'
  ],
  format: 'cases',
  reading: [
    { cite: "Vickers AJ, Elkin EB (2006). Decision curve analysis: a novel method for evaluating prediction models. Medical Decision Making 26:565-574.", url: "https://doi.org/10.1177/0272989X06295361", note: "The original paper introducing decision curves and net benefit across threshold probabilities." },
    { cite: "Vickers AJ, Van Calster B, Steyerberg EW (2016). Net benefit approaches to the evaluation of prediction models, molecular markers, and diagnostic tests. BMJ 352:i6.", url: "https://doi.org/10.1136/bmj.i6", note: "A concise, worked explanation of net benefit and decision curves for readers who do not know decision analysis." },
    { cite: "Vickers AJ, van Calster B, Steyerberg EW (2019). A simple, step-by-step guide to interpreting decision curve analysis. Diagnostic and Prognostic Research 3:18.", url: "https://doi.org/10.1186/s41512-019-0064-7", note: "A didactic guide to reading a decision curve and answering the usual questions about it." },
    { cite: "Van Calster B, Wynants L, Verbeek JFM, et al. (2018). Reporting and interpreting decision curve analysis: a guide for investigators. European Urology 74:796-804.", url: "https://doi.org/10.1016/j.eururo.2018.08.038", note: "Gives practical recommendations on choosing risk thresholds and reporting decision curves, with a worked example." }
  ],
  essentials: `
<ul>
<li>A model gives a risk. A clinician must make a yes or no decision. To turn the risk into a decision you need a <b>decision threshold</b>: act if the risk is at or above it.</li>
<li>The threshold comes from the consequences of the decision, not from statistics. If harm is the cost of an unnecessary treatment and benefit is the gain from a necessary one, the threshold odds equal harm ÷ benefit.</li>
<li>A 50% cutoff treats a false positive and a false negative as equally bad. In medicine that is rarely true.</li>
<li>Plain <b>accuracy</b> is misleading. With a rare outcome, doing nothing is already highly accurate. <b>Weighted accuracy</b> and <b>net benefit</b> build the harm to benefit ratio in.</li>
<li>Net benefit counts correct treatments and subtracts unnecessary ones, each weighted by the threshold odds. Always compare it with the two <b>default policies</b>: treat all and treat none.</li>
<li>A <b>decision curve</b> shows net benefit over a range of thresholds. A model is useful if it beats both default policies over the range of thresholds that clinicians find reasonable.</li>
<li>Usefulness needs three things together: discrimination, good calibration, and predictions that fall on both sides of the threshold. A poorly calibrated model can be worse than doing nothing.</li>
<li>Validation shows what a rule could achieve. Only an impact study shows whether it improves care in practice.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team now has a validated booking-visit model for preterm birth before 37 weeks. In this module it asks whether the model should be used to decide which women to refer to the tertiary centre for specialist antenatal care. It sets a referral threshold, counts the gains and losses of using the model, draws a decision curve, and reviews a report that claims a model is ready for use. You do not need the earlier modules for this story.',
  defs: {
    'decision threshold': 'The predicted risk at or above which you take the action, for example refer the woman.',
    'threshold odds': 'The threshold written as odds, p ÷ (1 − p); it equals harm divided by benefit.',
    'default policy': 'A way of deciding that does not use the model, such as treating everyone or treating no one.',
    'accuracy': 'The share of all people classified correctly, which treats every kind of mistake as equally bad.',
    'weighted accuracy': 'Accuracy in which correct decisions for people without the outcome are given the weight set by the threshold odds.',
    'net benefit': 'Correct treatments minus unnecessary treatments weighted by the threshold odds, per person.',
    'decision curve': 'A graph of net benefit against the threshold, for the model, for treat all and for treat none.',
    'decision rule': 'A model with a fixed action attached to its predictions, such as "refer if the risk is 20% or more".',
    'impact analysis': 'A study, ideally randomised, of whether using a rule actually changes decisions and improves outcomes.'
  },
  explainers: [
    {
      id: 'dca',
      title: 'How a decision curve is built',
      scenes: [
        { svg: EX.svg(EX.text(40, 40, '1,000 women, refer if the risk is 20% or more', { size: 'm', bold: true }) +
            EX.text(40, 92, 'Correct referrals (54)', { d: 0.3 }) + EX.rect(240, 76, 270, 22, { role: 'obs', grow: true, d: 0.4 }) +
            EX.text(40, 142, 'Unnecessary (123 ÷ 4 = 31)', { d: 1.2 }) + EX.rect(240, 126, 155, 22, { role: 'err', grow: true, d: 1.3 }) +
            EX.text(40, 192, 'Net benefit (54 − 31 = 23)', { bold: true, d: 2.2 }) + EX.rect(240, 176, 115, 22, { role: 'muted', grow: true, d: 2.3 }) +
            EX.text(40, 250, 'Net benefit 0.023: about 2.3 net correct referrals per 100 women', { size: 's', d: 3.0 })),
          say: 'At a threshold of 20 per cent the model refers 177 of 1,000 women. About 54 will deliver early, and 123 will not. Each unnecessary referral counts as one quarter, so the net gain is 54 minus 31, or 23 per 1,000.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 430, h: 200, xlim: [0, 0.4], ylim: [-0.05, 0.12], xticks: [0, 0.1, 0.2, 0.3, 0.4], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yticks: [-0.04, 0, 0.04, 0.08, 0.12], yfmt: function (v) { return v.toFixed(2); }, xlabel: 'Threshold for referral', ylabel: 'Net benefit' });
            var all = [], i; for (i = 0; i <= 16; i++) { var t = i / 100; all.push([B.X(t), B.Y(0.12 - t / (1 - t) * 0.88)]); }
            return B.s + EX.line([[B.X(0), B.Y(0)], [B.X(0.4), B.Y(0)]], { role: 'muted', d: 0.5 }) + EX.text(B.X(0.4) - 4, B.Y(0) - 8, 'Refer no one', { size: 's', anchor: 'end', d: 0.8 }) +
              EX.line(all, { role: 'obs', d: 1.4, t: 1.5 }) + EX.text(B.X(0.02) + 6, B.Y(0.115), 'Refer everyone', { size: 's', d: 2.6 }) + EX.text(B.X(0.12), B.Y(0) + 18, '12%', { size: 's', anchor: 'middle', d: 3.0 });
          })()),
          say: 'Now compare two policies that need no model. Referring no one always gives zero. Referring everyone gives 0.12 at a very low threshold, then falls, and crosses zero where the threshold equals the preterm rate of 12 per cent.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 430, h: 200, xlim: [0, 0.4], ylim: [-0.05, 0.12], xticks: [0, 0.1, 0.2, 0.3, 0.4], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yticks: [-0.04, 0, 0.04, 0.08, 0.12], yfmt: function (v) { return v.toFixed(2); }, xlabel: 'Threshold for referral', ylabel: 'Net benefit' });
            var cal = [0.12, 0.1111, 0.1024, 0.0942, 0.0865, 0.0794, 0.0729, 0.0669, 0.0615, 0.0565, 0.052, 0.0478, 0.044, 0.0405, 0.0373, 0.0344, 0.0317, 0.0292, 0.0269, 0.0248, 0.0229, 0.0211, 0.0195, 0.018, 0.0166, 0.0153, 0.0141, 0.013, 0.0119, 0.011, 0.0101, 0.0093, 0.0086, 0.0079, 0.0072, 0.0066, 0.0061, 0.0056, 0.0051, 0.0047, 0.0043];
            var all = [], i; for (i = 0; i <= 16; i++) { var t = i / 100; all.push([B.X(t), B.Y(0.12 - t / (1 - t) * 0.88)]); }
            return B.s + EX.line([[B.X(0), B.Y(0)], [B.X(0.4), B.Y(0)]], { role: 'muted', draw: false }) + EX.line(all, { role: 'obs', draw: false }) +
              EX.line(cal.map(function (v, k) { return [B.X(k / 100), B.Y(v)]; }), { role: 'pred', d: 0.4, t: 2.5 }) +
              EX.pts(B, [[0.2, 0.0229]], { role: 'pred', d: 3.0 }) + EX.text(B.X(0.2) + 8, B.Y(0.0229) - 10, 'the 20% example: 0.023', { size: 's', d: 3.2 }) +
              EX.text(B.X(0.21), B.Y(0.07), 'Model (c statistic 0.75)', { size: 's', d: 2.8 });
          })()),
          say: 'Repeat the count at every threshold and join the points. That gives the model curve. The point at 20 per cent is the 0.023 we just worked out. Where the model curve is above both other lines, using the model is better.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 430, h: 200, xlim: [0, 0.4], ylim: [-0.05, 0.12], xticks: [0, 0.1, 0.2, 0.3, 0.4], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yticks: [-0.04, 0, 0.04, 0.08, 0.12], yfmt: function (v) { return v.toFixed(2); }, xlabel: 'Threshold for referral', ylabel: 'Net benefit' });
            var cal = [0.12, 0.1111, 0.1024, 0.0942, 0.0865, 0.0794, 0.0729, 0.0669, 0.0615, 0.0565, 0.052, 0.0478, 0.044, 0.0405, 0.0373, 0.0344, 0.0317, 0.0292, 0.0269, 0.0248, 0.0229, 0.0211, 0.0195, 0.018, 0.0166, 0.0153, 0.0141, 0.013, 0.0119, 0.011, 0.0101, 0.0093, 0.0086, 0.0079, 0.0072, 0.0066, 0.0061, 0.0056, 0.0051, 0.0047, 0.0043];
            var all = [], i; for (i = 0; i <= 16; i++) { var t = i / 100; all.push([B.X(t), B.Y(0.12 - t / (1 - t) * 0.88)]); }
            return B.s + EX.line([[B.X(0), B.Y(0)], [B.X(0.4), B.Y(0)]], { role: 'muted', draw: false }) + EX.line(all, { role: 'obs', draw: false }) +
              EX.line(cal.map(function (v, k) { return [B.X(k / 100), B.Y(v)]; }), { role: 'pred', draw: false }) +
              EX.line([[B.X(0.12), B.Y(0)], [B.X(0.12), B.Y(0.044)]], { role: 'muted', d: 0.4, w: 4 }) +
              EX.text(B.X(0.13), B.Y(0.085), 'Largest gain at 12%:', { size: 's', d: 0.8 }) + EX.text(B.X(0.13), B.Y(0.072), '4.4 net referrals per 100', { size: 's', d: 1.0 }) +
              EX.text(B.X(0.22), B.Y(0.045), 'Gain shrinks at high thresholds', { size: 's', d: 2.0 });
          })()),
          say: 'The gap over the best policy without a model is largest at 12 per cent, the preterm rate, where both simple policies give zero. There the model adds about 4.4 net correct referrals per 100 women. At high thresholds the gain becomes small.' },
        { svg: EX.svg((function () {
            var B = EX.box({ l: 80, t: 40, w: 430, h: 200, xlim: [0, 0.4], ylim: [-0.05, 0.12], xticks: [0, 0.1, 0.2, 0.3, 0.4], xfmt: function (v) { return Math.round(v * 100) + '%'; }, yticks: [-0.04, 0, 0.04, 0.08, 0.12], yfmt: function (v) { return v.toFixed(2); }, xlabel: 'Threshold for referral', ylabel: 'Net benefit' });
            var cal = [0.12, 0.1111, 0.1024, 0.0942, 0.0865, 0.0794, 0.0729, 0.0669, 0.0615, 0.0565, 0.052, 0.0478, 0.044, 0.0405, 0.0373, 0.0344, 0.0317, 0.0292, 0.0269, 0.0248, 0.0229, 0.0211, 0.0195, 0.018, 0.0166, 0.0153, 0.0141, 0.013, 0.0119, 0.011, 0.0101, 0.0093, 0.0086, 0.0079, 0.0072, 0.0066, 0.0061, 0.0056, 0.0051, 0.0047, 0.0043];
            var mis = [0.0516, 0.0421, 0.0332, 0.0253, 0.0186, 0.0131, 0.0078, 0.0044, 0.0013, -0.002, -0.0047, -0.0067, -0.0082, -0.0091, -0.0095, -0.0096, -0.011, -0.0104, -0.0113, -0.012, -0.0126, -0.0111, -0.0113, -0.0114, -0.0114, -0.0113, -0.0111, -0.0108, -0.0105, -0.0101, -0.0097, -0.0092, -0.0088, -0.0083, -0.0078, -0.0073, -0.0067, -0.0075, -0.0069, -0.0064, -0.0059];
            return B.s + EX.line([[B.X(0), B.Y(0)], [B.X(0.4), B.Y(0)]], { role: 'muted', draw: false }) +
              EX.line(cal.map(function (v, k) { return [B.X(k / 100), B.Y(v)]; }), { role: 'muted', draw: false }) +
              EX.line(mis.map(function (v, k) { return [B.X(k / 100), B.Y(v)]; }), { role: 'pred', d: 0.4, t: 2.5 }) +
              EX.text(B.X(0.15), B.Y(0.09), 'Same ranking, but risks set too high', { size: 's', d: 1.5 }) +
              EX.text(B.X(0.15), B.Y(-0.025), 'Below zero: worse than referring no one', { size: 's', d: 2.6 });
          })()),
          say: 'Now use the same model in a hospital where it overestimates every risk. It ranks women just as well, but too many cross the threshold. Above about 9 per cent its net benefit is below zero: worse than referring no one.' },
        { svg: EX.svg(EX.text(280, 110, 'Read the curve over the plausible thresholds', { size: 'l', bold: true, anchor: 'middle' }) +
            EX.text(280, 150, 'Ask clinicians for a range, for example 10% to 30%', { anchor: 'middle', d: 0.6 }) +
            EX.text(280, 176, 'Useful only if the model beats both lines across it', { anchor: 'middle', d: 1.2 }) +
            EX.text(280, 202, 'Check calibration in the new setting first', { anchor: 'middle', d: 1.8 })),
          say: 'So ask clinicians for a range of reasonable thresholds, say 10 to 30 per cent. The model is useful if its curve beats both simple policies across that whole range, and only if it is calibrated in the setting where it is used.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Where should the referral threshold be?',
      aim: 'derive a decision threshold from the harm and benefit of a decision, and write it as threshold odds.',
      minutes: 15,
      need: `
<p>A model gives a probability. The team must decide: refer the woman or not. To act on a risk you need a <b>decision threshold</b>. Women with a predicted risk at or above it are classified as positive (referred); the rest are negative. The book calls a model <b>clinically useful</b> if decisions made with it are better than a <b>default policy</b> that ignores the model, such as referring everyone or no one.</p>
<p><b>Harm and benefit.</b> Each decision can go right or wrong. Referring a woman who would deliver early brings a <b>benefit</b>: the gain compared with not referring her. Referring a woman who would not deliver early causes <b>harm</b>: travel, cost and worry with no gain. Only these two differences matter. The best threshold p<sub>t</sub> is the risk at which the expected benefit and the expected harm are equal:</p>
<div class="formula">threshold odds w = p<sub>t</sub> ÷ (1 − p<sub>t</sub>) = harm ÷ benefit, so p<sub>t</sub> = harm ÷ (harm + benefit)</div>
<p><b>Worked example.</b> Suppose missing a woman who needed referral is 4 times as bad as one unnecessary referral. Harm : benefit = 1 : 4, so p<sub>t</sub> = 1 ÷ (1 + 4) = 20%, and w = 0.20 ÷ 0.80 = 0.25. In words: the team accepts 4 unnecessary referrals to make 1 necessary one. Out of every 5 women referred at exactly 20% risk, 1 delivers early and 4 do not.</p>
<p><b>Why not 50%?</b> A 50% cutoff means harm = benefit: a false positive is as bad as a false negative. For referral before a likely preterm birth, missing a woman is far worse, so the threshold should be well below 50%. The threshold is set by the decision, not by the modeller. Experts often give only a rough range, and individual women may weigh things differently.</p>`,
      scenario: `<p>Illustrative (synthetic). The obstetricians argue that a woman who delivers very early in the district hospital, without the tertiary centre's specialist care, faces a serious loss, while an unnecessary referral costs a family a long trip and some days away from home. The midwives are more worried about the families' costs. The team must agree a referral threshold before it can test the model.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'The threshold comes from the ratio of harm to benefit, with threshold odds equal to harm ÷ benefit; it is a clinical choice, not a statistical one.'
    },
    {
      id: 'c2',
      title: 'Why accuracy points the wrong way',
      aim: 'see why accuracy misleads for a rare outcome, and calculate weighted accuracy.',
      minutes: 15,
      need: `
<p>Once the threshold is set, every woman falls into one of four cells: true positive (TP, referred and delivered early), false positive (FP, referred, did not), false negative (FN, not referred, delivered early) and true negative (TN).</p>
<div class="formula">accuracy = (TP + TN) ÷ N      error rate = (FN + FP) ÷ N</div>
<p><b>The problem.</b> Accuracy counts every mistake as equally bad, which is the same as using a 50% threshold. It is also high for any rare outcome without any model. <b>Worked example:</b> of 1,000 women, 120 deliver early. If the team refers no one, it is right about the 880 who deliver at term: accuracy 880 ÷ 1,000 = 88%, with no model at all.</p>
<p><b>Weighted accuracy.</b> Build the threshold odds w into the count. Each correct "do not refer" counts w times as much as a correct referral:</p>
<div class="formula">weighted accuracy = (TP + w × TN) ÷ (N<sub>event</sub> + w × N<sub>no event</sub>)</div>
<p>Continue the example at a 20% threshold (w = 0.25). The denominator is 120 + 0.25 × 880 = 340. Refer no one: TP = 0 and TN = 880, so weighted accuracy = 220 ÷ 340 = 64.7%. Refer everyone: TP = 120 and TN = 0, so 120 ÷ 340 = 35.3%. A model is useful only if its weighted accuracy beats the better of these two. Sensitivity and specificity at the threshold can be reported too, but they do not by themselves say whether using the model beats the default policy.</p>`,
      scenario: `<p>Illustrative (synthetic). Two versions of the booking model are offered to the team. A colleague prefers version A "because it has the highest accuracy, 89%". The team wants a measure that reflects its 1 : 4 judgement of harm and benefit.</p>`,
      widgets: '',
      tasks: [2, 3],
      takeaway: 'Plain accuracy favours doing nothing when the outcome is rare; weighted accuracy uses the threshold odds and compares the model with the default policies.'
    },
    {
      id: 'c3',
      title: 'Counting net benefit',
      aim: 'calculate the net benefit of the model and of the two default policies, including the harm of a test.',
      minutes: 15,
      need: `
<p><b>Net benefit</b> counts the correct referrals and subtracts the unnecessary ones, each weighted by the threshold odds w:</p>
<div class="formula">net benefit = (TP − w × FP) ÷ N</div>
<p>It is measured in units of true positives. A net benefit of 0.03 means 3 net correct referrals per 100 women, after paying for the unnecessary ones at the exchange rate set by the threshold.</p>
<p><b>Worked example (illustrative, synthetic).</b> 1,000 women, 120 deliver early. At a 20% threshold (w = 0.25) the model gives TP = 72, FP = 158, FN = 48, TN = 722, so 230 women are referred.</p>
<ul>
<li>Model: (72 − 0.25 × 158) ÷ 1,000 = (72 − 39.5) ÷ 1,000 = 0.0325.</li>
<li><b>Treat none</b> (refer no one): TP = FP = 0, so net benefit = 0.</li>
<li><b>Treat all</b> (refer everyone): (120 − 0.25 × 880) ÷ 1,000 = (120 − 220) ÷ 1,000 = −0.100. In general treat all = incidence − w × (1 − incidence). It is 0 when the threshold equals the incidence and negative above it.</li>
</ul>
<p>The model gives 3.25 net correct referrals per 100 women more than referring no one. Its plain accuracy, (72 + 722) ÷ 1,000 = 79.4%, is lower than the 88% of referring no one, which shows again why accuracy misleads.</p>
<p><b>Harm of a test.</b> If the model needs a costly or unpleasant test in every woman, subtract that harm per woman, in units of true positives: net benefit = (TP − w × FP) ÷ N − test harm.</p>`,
      scenario: `<p>Illustrative (synthetic). The team applies the model to 1,000 women in its validation data and counts the referrals at several thresholds. It also considers adding a cervical length scan at booking for every woman, which makes the model sharper but costs scanning time and travel.</p>`,
      widgets: `<div data-widget="nbCalculator" data-try="Keep the default counts at a 20% threshold and read the net benefit of 0.0325, then enter TP 110, FP 366, FN 10, TN 514 with the threshold at 10% and watch the better default switch to treat all."></div>`,
      tasks: [4, 5],
      takeaway: 'Net benefit is correct treatments minus weighted unnecessary ones, per person; a model is useful at a threshold only if it beats both treat all and treat none.'
    },
    {
      id: 'c4',
      title: 'The decision curve, and what makes a model useful',
      aim: 'read a decision curve, see how calibration and the spread of predictions change usefulness, and judge a claim of readiness.',
      minutes: 20,
      need: `
<p>The threshold is often uncertain. Vickers and Elkin proposed the <b>decision curve</b>: net benefit plotted against the threshold, for the model, for treat all and for treat none (the line at 0). The reader picks the range of thresholds clinicians find reasonable and checks whether the model is highest across that range.</p>
<div data-explainer="dca"></div>
<p><b>Features to look for.</b> Treat all starts at the incidence and crosses 0 when the threshold equals the incidence. A well calibrated model with no discrimination (c = 0.5) gives every woman the incidence, so it is no better than the better default policy. For a well calibrated model the largest gain over both default policies is at threshold = incidence. Net benefit rises strongly with the c statistic.</p>
<p><b>Three things together decide usefulness.</b></p>
<ol>
<li><b>Discrimination</b>: some is needed for any gain.</li>
<li><b>Calibration</b>: a well calibrated model with weak discrimination gives a small, but never negative, gain. A miscalibrated model can be worse than a default policy.</li>
<li><b>The spread of predictions around the threshold</b>: if every woman's risk is below (or above) the threshold, the model changes no decision, however good its c statistic.</li>
</ol>
<p>Labels such as "c above 0.8 is good" do not show usefulness. No minimum c guarantees it.</p>
<p><b>From model to decision rule.</b> A <b>decision rule</b> attaches an action to the risk ("refer if 20% or more"). Evidence builds in levels (Reilly and Evans): derivation, narrow validation, broad validation, then narrow and broad <b>impact analysis</b>. Validation shows what perfect use could achieve (efficacy). Only an impact study, ideally randomised by clinic, shows whether care actually improves (effectiveness), because clinicians may not follow the rule.</p>`,
      scenario: `<p>The team explores how its model's curve changes if the model is miscalibrated in a new hospital. Then the research committee forwards a report from another hospital that calls its preterm birth model "clinically useful and ready for all district hospitals".</p>`,
      widgets: `<div data-widget="decisionCurveLab" data-try="Set the c statistic to 0.75 and keep incidence 12% and threshold 20%, then move the calibration-in-the-large shift to −1.0 and watch the model curve drop below zero."></div>`,
      tasks: [6, 7],
      takeaway: 'A model is useful only if it is calibrated, discriminates and spreads women across the threshold, so that its decision curve beats both default policies over the plausible thresholds.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Thresholds from harm and benefit',
      html: `
<p>Clinical usefulness is the ability of a model to classify better than a default policy (treat all, treat none). Classification needs a threshold, and a 50% cutoff assumes false positives and false negatives are equally costly. <b>Book examples:</b> bacterial meningitis, treatable if antibiotics start early but devastating if missed, calls for a low threshold; withdrawing treatment after severe traumatic brain injury calls for a threshold for poor outcome close to 100%.</p>
<table class="data">
<thead><tr><th></th><th>Event</th><th>No event</th></tr></thead>
<tbody><tr><td>Treat</td><td>c<sub>TP</sub></td><td>c<sub>FP</sub></td></tr><tr><td>Do not treat</td><td>c<sub>FN</sub></td><td>c<sub>TN</sub></td></tr></tbody></table>
<p>Benefit = c<sub>FN</sub> − c<sub>TP</sub>; harm = c<sub>FP</sub> − c<sub>TN</sub>. Odds(p<sub>t</sub>) = harm ÷ benefit; p<sub>t</sub> = harm ÷ (harm + benefit). Harm : benefit 1 : 1 gives 50% (w = 1); 3 : 7 gives 30% (0.429); 1 : 4 gives 20% (0.25); 1 : 9 gives 10% (0.111); 1 : 19 gives 5% (0.053).</p>
<p><b>Book example:</b> resection of residual masses in testicular cancer. A decision analysis gave a threshold of 70% for benign tissue, i.e. 30% for residual tumour, so w = 3/7. Thresholds are often uncertain; experts can give an order of magnitude, sometimes as a grey zone (book example: surgery below 30% and active surveillance above 60% probability of indolent prostate cancer). Choosing the threshold is "not in the hands of the modeller".</p>
<p class="src">Source: Ch. 16, introduction, §16.1.1-16.1.2, §16.1.5, §16.4; Table 16.1</p>`
    },
    {
      id: 'n2',
      title: 'Accuracy and weighted accuracy',
      html: `
<p>Error rate = (FN + FP) ÷ N; accuracy = (TP + TN) ÷ N. Both weight FP and FN equally. <b>Book example:</b> with 7% mortality after acute myocardial infarction, calling everyone a survivor gives 93% accuracy.</p>
<p>Weighted accuracy = (TP + w × TN) ÷ (N<sub>event</sub> + w × N<sub>no event</sub>); weighted error rate = (FN + w × FP) ÷ (N<sub>event</sub> + w × N<sub>no event</sub>). Because TN = N<sub>no event</sub> − FP, weighted accuracy is a fixed increasing function of net benefit at a given threshold, so the two rank strategies the same way.</p>
<div class="callout book"><b>Book example (Table 16.4)</b><p>Development, n = 544 (299 tumour, 245 necrosis), threshold 30% for tumour, w = 3/7. Model: TP 275, FP 143, FN 24, TN 102; sensitivity 92%, specificity 42%, accuracy (275 + 102) ÷ 544 = 69%. Weighted accuracy: resect all 299 ÷ (299 + 3/7 × 245) = 74%; model (275 + 3/7 × 102) ÷ (299 + 3/7 × 245) = 79%. Validation, n = 273 (197 tumour, 76 necrosis): accuracy 75%, but weighted accuracy 86% for both the model and resect all.</p></div>
<div class="callout warn"><b>Critical</b><p>Accuracy was higher at validation (75% against 69%) while the clinical gain was zero. Accuracy or error rates at an arbitrary cutoff should not be used to judge usefulness.</p></div>
<p class="src">Source: Ch. 16, §16.1.3-16.1.4, §16.1.7; Tables 16.2, 16.4</p>`
    },
    {
      id: 'n3',
      title: 'Net benefit',
      html: `
<p>NB = (TP − w × FP) ÷ N, with w = p<sub>t</sub> ÷ (1 − p<sub>t</sub>), in units of true positives. Treat none: NB = 0. Treat all: NB = incidence − w × (1 − incidence), zero at threshold = incidence and negative above it. A burdensome test can be included: NB = (TP − w × FP) ÷ N − test harm.</p>
<div class="callout book"><b>Book example</b><p>Testicular development data, w = 3/7: model (275 − 3/7 × 143) ÷ 544 = 0.393; resect all (299 − 3/7 × 245) ÷ 544 = 0.357; gain 0.036. Validation: model (190 − 3/7 × 60) ÷ 273 = 0.602; resect all (197 − 3/7 × 76) ÷ 273 = 0.602; gain 0. Sparing 16 men with necrosis did not make up for missing 7 tumours, when a tumour weighs 7/3 times a necrosis.</p></div>
<p class="src">Source: Ch. 16, §16.1.5, §16.1.7; Table 16.4; Question 16.1</p>`
    },
    {
      id: 'n4',
      title: 'Decision curves',
      html: `
<p>Vickers and Elkin's decision curve plots NB against the threshold (0 to 100%) for the model, treat all and treat none. If the model has the highest NB across the plausible threshold range, it can be recommended in that context. A calibrated model with c = 0.5 equals the better default policy (treat all below the incidence, treat none above it). At 50% incidence, treat all is negative for every threshold above 50% (w &gt; 1). For a well calibrated model the largest gain is at threshold = incidence, and NB increases strongly with c.</p>
<div class="callout book"><b>Book example (Table 16.3): maximum NB at threshold = incidence</b>
<table class="data">
<thead><tr><th>Model</th><th>1%</th><th>10%</th><th>50%</th><th>90%</th></tr></thead>
<tbody>
<tr><td>c = 0.60</td><td>0.0028</td><td>0.019</td><td>0.073</td><td>0.150</td></tr>
<tr><td>c = 0.70</td><td>0.0048</td><td>0.036</td><td>0.149</td><td>0.324</td></tr>
<tr><td>c = 0.83</td><td>0.0071</td><td>0.059</td><td>0.250</td><td>0.511</td></tr>
<tr><td>c = 0.98</td><td>0.0096</td><td>0.092</td><td>0.429</td><td>0.817</td></tr>
</tbody></table>
<p>With a 1% outcome even a near-perfect model gains less than 1 net true positive per 100 patients.</p></div>
<p><b>Book example:</b> the testicular model was useful for tumour thresholds above 20% in development data but only between 55% and 95% at validation, so not at 30%. Treat all and treat none crossed at the tumour frequencies (55% and 72%).</p>
<p class="src">Source: Ch. 16, §16.1.5-16.1.8; Fig. 16.1-16.2; Table 16.3; Question 16.2</p>`
    },
    {
      id: 'n5',
      title: 'Discrimination, calibration and usefulness',
      html: `
<p>Some argue discrimination is primary because miscalibration can be fixed in a new setting; but when a model is applied, its miscalibration there is not yet known. Usefulness depends on discrimination, calibration (miscalibration can give a negative gain), and the distribution of predictions around the threshold (all on one side means no decision changes, even with c = 0.8). Good calibration and discrimination are necessary but not sufficient.</p>
<div class="callout book"><b>Book example (Table 16.5)</b><p>At validation the testicular model looked satisfactory (c 0.79, calibration slope 0.74, miscalibration test p = 0.13), yet its NB gain at 30% was 0: sensitivity 96%, specificity 21%, so few men could be spared surgery.</p></div>
<table class="data">
<thead><tr><th>Application</th><th>Primary requirement</th></tr></thead>
<tbody>
<tr><td>Targeting scarce preventive resources</td><td>Discrimination (ranking)</td></tr>
<tr><td>Informing patients, clinical decisions</td><td>Calibration, with discrimination and the distribution around the threshold</td></tr>
<tr><td>Selecting high-risk patients for an RCT</td><td>Calibration</td></tr>
<tr><td>Covariate adjustment in an RCT</td><td>Discrimination</td></tr>
<tr><td>Confounder adjustment</td><td>All relevant confounders; very high c is suspicious</td></tr>
</tbody></table>
<p><b>In the course story:</b> if nearly every woman at a clinic has a predicted preterm risk above the referral threshold, the model refers everyone, exactly like treat all, and adds nothing, however good its c.</p>
<p class="src">Source: Ch. 16, §16.2-16.2.2; Table 16.5; §16.4</p>`
    },
    {
      id: 'n6',
      title: 'Decision rules, impact and verification',
      html: `
<p>A prediction model leaves the action to the clinician and allows patient-specific thresholds; a decision rule attaches an explicit action, which may increase impact. Rules help most when decisions are complex, stakes are high, or savings are possible without harming care. Few have been tested for their effect on outcomes. Some diagnostic rules aim at 100% sensitivity (Ottawa ankle rules, CT head rules), treating a false negative as infinitely costly.</p>
<table class="data">
<thead><tr><th>Level</th><th>Study</th><th>Implication</th></tr></thead>
<tbody>
<tr><td>1</td><td>Derivation (predictors identified; blinded outcome)</td><td>Needs validation</td></tr>
<tr><td>2</td><td>Narrow validation, one setting, prospective</td><td>Use cautiously in similar patients</td></tr>
<tr><td>3</td><td>Broad validation, varied settings and clinicians</td><td>Predictions used with confidence; needs impact analysis</td></tr>
<tr><td>4</td><td>Narrow impact analysis, one setting</td><td>Use cautiously in similar settings</td></tr>
<tr><td>5</td><td>Broad impact analysis, varied settings</td><td>Use with confidence that care improves</td></tr>
</tbody></table>
<p>Validation shows efficacy (100% adherence); impact analysis shows effectiveness, which depends on adherence. Clinicians may overrule a rule, improving or diluting it. Barriers include scepticism, doubt about clinical sense, confidence in own judgement, medicolegal fears and ease of use. Impact studies are ideally randomised, often by centre, with a risk of contamination.</p>
<p><b>Verification bias:</b> if the outcome is verified only in selected patients (testicular masses ≤ 10 mm were usually not resected), sensitivity, specificity and usefulness measures are affected and say nothing about the unverified group; coefficients stay valid if the selection criterion is a model predictor.</p>
<p class="src">Source: Ch. 16, §16.1.9, §16.3-16.4; Table 16.6; Ch. 15, §15.2.9</p>`
    }
  ],
  keyPoints: [
    'The decision threshold comes from the harm : benefit ratio: odds(p_t) = harm ÷ benefit; it is not a statistical choice.',
    'A 50% cutoff assumes false positives and false negatives are equally bad, which is rarely true in medicine.',
    'Accuracy can favour doing nothing for a rare outcome; weighted accuracy and net benefit include the harm : benefit weight.',
    'Net benefit = (TP − w × FP) ÷ N with w = p_t ÷ (1 − p_t), in units of true positives; compare with treat none (0) and treat all.',
    'Treat all has net benefit = incidence − w × (1 − incidence); it is 0 at threshold = incidence and negative above it.',
    'A decision curve plots net benefit over thresholds; a model is useful if it beats both defaults across the plausible range.',
    'Usefulness needs discrimination, calibration and predictions on both sides of the threshold; miscalibration can make net benefit worse than a default.',
    'Validation shows efficacy; impact analysis, ideally randomised, shows whether a decision rule improves care.'
  ],
  quiz: [
    {
      q: 'The team judges that one unnecessary course of antenatal corticosteroids is one-ninth as bad as failing to give steroids before a preterm birth. What threshold risk follows?',
      options: ['5%', '10%', '11%', '90%'],
      answer: 1,
      why: 'Harm : benefit = 1 : 9, so p_t = 1 ÷ (1 + 9) = 10%, with threshold odds 1/9 = 0.111. Choosing 11% confuses the odds with the probability; 90% turns the ratio upside down; 5% would mean a ratio of 1 : 19.'
    },
    {
      q: 'In the booking cohort, 12% of women deliver preterm. A colleague reports that the model has 85% accuracy. What is the best response?',
      options: [
        'Referring no one already gives 88% accuracy, so accuracy says little about usefulness',
        'The model is clinically useful because 85% is high',
        'Accuracy is fine because it includes the harm : benefit ratio',
        'Accuracy equals net benefit when the threshold is 12%'
      ],
      answer: 0,
      why: 'Accuracy treats a missed preterm birth and an unnecessary referral as equally bad (a 50% threshold), and is high for a rare outcome by default. Here the model is less accurate than doing nothing, yet it could still have positive net benefit. Accuracy contains no harm : benefit weight, and it is not the same as net benefit at any threshold.'
    },
    {
      q: 'At a 25% referral threshold, the model applied to 500 women gives TP = 60 and FP = 90. What is the net benefit?',
      options: ['0.030', '0.075', '0.060', '−0.060'],
      answer: 2,
      why: 'w = 0.25 ÷ 0.75 = 1/3; net benefit = (60 − 90 ÷ 3) ÷ 500 = 30 ÷ 500 = 0.060. Using w = 0.25 (the probability, not the odds) gives (60 − 22.5) ÷ 500 = 0.075, the commonest error.'
    },
    {
      q: 'In a setting with 50% incidence, why is the net benefit of "treat all" negative for every threshold above 50%?',
      options: [
        'Because sensitivity falls below 50%',
        'Because the model becomes miscalibrated',
        'Because treat none then has positive net benefit',
        'Because the threshold odds w exceed 1, so with equal numbers of TP and FP the weighted false positives outweigh the true positives'
      ],
      answer: 3,
      why: 'Treat all gives TP = FP = N/2, so net benefit = 0.5 − 0.5w, negative once w > 1, i.e. above 50%. More generally treat all is negative above the incidence. Treat none always has net benefit 0, and treat all uses no model, so calibration does not apply.'
    },
    {
      q: 'The preterm model has c = 0.82 in a new hospital, but every woman there has a predicted risk below the referral threshold of 15%. How useful is the model at that threshold?',
      options: [
        'Not at all: it refers no one, exactly like treat none',
        'Very useful, because c is above 0.8',
        'Moderately useful, because c is between 0.7 and 0.9',
        'It cannot be judged without a Hosmer-Lemeshow test'
      ],
      answer: 0,
      why: 'Usefulness needs predictions on both sides of the threshold. With all risks below it, no decision changes and net benefit is 0, the same as treat none. The book rejects the idea that a "good" c guarantees usefulness, and a goodness-of-fit test would not change this.'
    },
    {
      q: 'The booking model ranks women well in a second hospital but overestimates everyone\'s risk there. What can happen to its net benefit?',
      options: [
        'Nothing, because net benefit depends only on discrimination',
        'It can fall below that of a default policy, even below zero, because too many women cross the threshold',
        'It always rises, because more women are referred',
        'It is unchanged if the c statistic is above 0.7'
      ],
      answer: 1,
      why: 'Miscalibrated risks put women on the wrong side of the threshold, so a model can do worse than treat all or treat none. A well calibrated model with weak discrimination gives a small but never negative gain. Referring more women adds false positives, and c ignores calibration.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Thresholds from harm : benefit ratios',
      level: 'Understand',
      scenario: `<p>The team lists possible views of harm (one unnecessary referral) against benefit (one necessary referral): 1 : 1, 3 : 7, 1 : 4, 1 : 9 and 1 : 19.</p>`,
      questions: [
        '<b>(a)</b> For each ratio, give the threshold p<sub>t</sub> and the threshold odds w.',
        '<b>(b)</b> Explain in plain words what a 10% threshold means about unnecessary referrals.',
        '<b>(c)</b> Why is the 50% cutoff used by many software packages a poor choice for referral before a likely preterm birth?'
      ],
      answer: `<p><b>(a)</b> p<sub>t</sub> = harm ÷ (harm + benefit); w = p<sub>t</sub> ÷ (1 − p<sub>t</sub>) = harm ÷ benefit.</p>
<table class="data"><tr><th>Harm : benefit</th><th>p<sub>t</sub></th><th>w</th></tr>
<tr><td>1 : 1</td><td>1 ÷ 2 = 50%</td><td>1</td></tr>
<tr><td>3 : 7</td><td>3 ÷ 10 = 30%</td><td>3 ÷ 7 = 0.429</td></tr>
<tr><td>1 : 4</td><td>1 ÷ 5 = 20%</td><td>0.25</td></tr>
<tr><td>1 : 9</td><td>1 ÷ 10 = 10%</td><td>0.111</td></tr>
<tr><td>1 : 19</td><td>1 ÷ 20 = 5%</td><td>0.053</td></tr></table>
<p><b>(b)</b> One unnecessary referral is valued at 1/9 of a necessary one. The team accepts referring 9 women who will not deliver early in order to refer 1 who will.</p>
<p><b>(c)</b> A 50% cutoff means harm = benefit: an unnecessary referral counts as much as a missed woman who then delivers very early without specialist care. The team judges a miss as far worse, so the threshold should be well below 50%. The threshold comes from the decision context, not from the software.</p>`
    },
    {
      id: 't1',
      title: 'Agree a referral threshold',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The obstetricians value the benefit of a necessary referral at 6 units and the harm of an unnecessary one at 1 unit. The midwives, weighing travel costs for families more heavily, say 3 units of benefit to 1 of harm. A woman's predicted risk of preterm birth is 18%.</p>`,
      questions: [
        '<b>(a)</b> Calculate the threshold and threshold odds for each group.',
        '<b>(b)</b> Under each threshold, is the woman referred?',
        '<b>(c)</b> The team cannot agree. How can it handle this uncertainty when it evaluates the model?',
        '<b>(d)</b> Why might the decision still differ for an individual woman?'
      ],
      answer: `<p><b>(a)</b> Obstetricians: p<sub>t</sub> = 1 ÷ (1 + 6) = 14.3%; w = 1 ÷ 6 = 0.167. Midwives: p<sub>t</sub> = 1 ÷ (1 + 3) = 25%; w = 1 ÷ 3 = 0.333.</p>
<p><b>(b)</b> 18% is above 14.3%, so the obstetricians would refer her. It is below 25%, so the midwives would not. She lies in a grey zone between the two thresholds.</p>
<p><b>(c)</b> Do not force one number. Evaluate the model over the whole plausible range, here about 14% to 25%, with a decision curve, and check that the model beats both treat all and treat none across that range. The book notes that experts can often give only an order of magnitude, sometimes as a lower and an upper threshold.</p>
<p><b>(d)</b> Harm and benefit depend on the woman's own situation and values: distance to the tertiary centre, family support, cost. A prediction model gives a risk and leaves room for her own threshold; a fixed decision rule would not.</p>`
    },
    {
      id: 't2',
      title: 'Accuracy against weighted accuracy',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). 1,000 women, 120 deliver early. The obstetricians' preferred threshold of 10% (harm : benefit 1 : 9) is used. The model gives TP = 110, FP = 366, FN = 10, TN = 514.</p>`,
      questions: [
        '<b>(a)</b> Calculate sensitivity, specificity and accuracy of the model, and the accuracy of referring no one.',
        '<b>(b)</b> Calculate w and the weighted accuracy of the model, of refer everyone and of refer no one.',
        '<b>(c)</b> Which policy is best, and why does plain accuracy point the other way?'
      ],
      answer: `<p><b>(a)</b> Sensitivity = 110 ÷ 120 = 91.7%. Specificity = 514 ÷ 880 = 58.4%. Accuracy = (110 + 514) ÷ 1,000 = 62.4%. Refer no one: 880 ÷ 1,000 = 88.0%.</p>
<p><b>(b)</b> w = 0.10 ÷ 0.90 = 0.111. Denominator = 120 + 880 ÷ 9 = 120 + 97.8 = 217.8. Model: (110 + 514 ÷ 9) ÷ 217.8 = (110 + 57.1) ÷ 217.8 = 76.7%. Refer everyone: 120 ÷ 217.8 = 55.1%. Refer no one: 97.8 ÷ 217.8 = 44.9%.</p>
<p><b>(c)</b> The model is best (76.7% against 55.1% for the better default). Plain accuracy prefers referring no one (88% against 62.4%) because it counts a missed preterm birth the same as an unnecessary referral, against the team's 1 : 9 judgement.</p>`
    },
    {
      id: 't3',
      title: 'Two versions of the model',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). 1,000 women, 120 deliver early; the team's threshold is 20% (harm : benefit 1 : 4). Version A: TP 30, FP 20, FN 90, TN 860. Version B: TP 72, FP 158, FN 48, TN 722.</p>`,
      questions: [
        '<b>(a)</b> Calculate the accuracy, sensitivity and specificity of each version.',
        '<b>(b)</b> Calculate the weighted accuracy of each version, and of the two default policies.',
        '<b>(c)</b> Which version should the team prefer? Explain why the colleague who chose A by accuracy was misled.'
      ],
      answer: `<p><b>(a)</b> A: accuracy (30 + 860) ÷ 1,000 = 89.0%; sensitivity 30 ÷ 120 = 25.0%; specificity 860 ÷ 880 = 97.7%. B: accuracy (72 + 722) ÷ 1,000 = 79.4%; sensitivity 72 ÷ 120 = 60.0%; specificity 722 ÷ 880 = 82.0%.</p>
<p><b>(b)</b> w = 0.25; denominator = 120 + 0.25 × 880 = 340. A: (30 + 0.25 × 860) ÷ 340 = (30 + 215) ÷ 340 = 72.1%. B: (72 + 0.25 × 722) ÷ 340 = (72 + 180.5) ÷ 340 = 74.3%. Refer no one: 220 ÷ 340 = 64.7%. Refer everyone: 120 ÷ 340 = 35.3%.</p>
<p><b>(c)</b> Version B. Both beat the default policies, but B has the higher weighted accuracy. A gains accuracy by referring very few women (50), which suits a 50% threshold, not the team's 20%. It misses 90 of the 120 women who deliver early. Accuracy rewards the many easy true negatives and ignores that a miss is 4 times as bad as an unnecessary referral.</p>`
    },
    {
      id: 't4',
      title: 'Net benefit at three thresholds',
      level: 'Apply',
      scenario: `<p>Illustrative (synthetic). The same 1,000 women (120 preterm births). The model's counts at three thresholds are:</p>
<table class="data"><tr><th>Threshold</th><th>TP</th><th>FP</th><th>FN</th><th>TN</th></tr>
<tr><td>10%</td><td>110</td><td>366</td><td>10</td><td>514</td></tr>
<tr><td>20%</td><td>72</td><td>158</td><td>48</td><td>722</td></tr>
<tr><td>30%</td><td>45</td><td>70</td><td>75</td><td>810</td></tr></table>
<p>Use the net benefit calculator in this case. Its defaults are the 20% row (TP 72, FP 158, FN 48, TN 722, threshold 20%).</p>`,
      questions: [
        '<b>(a)</b> By hand, calculate w and the net benefit of the model and of treat all at each threshold.',
        '<b>(b)</b> Express the model\'s gain over the better default policy in net correct referrals per 100 women.',
        '<b>(c)</b> Enter the 10% and 30% rows in the calculator (set the threshold slider to 10% and 30%) and check your answers.',
        '<b>(d)</b> Why must the counts change when the threshold changes?'
      ],
      answer: `<p><b>(a)</b></p>
<table class="data"><tr><th>Threshold</th><th>w</th><th>Model</th><th>Treat all</th></tr>
<tr><td>10%</td><td>0.10 ÷ 0.90 = 0.111</td><td>(110 − 366 ÷ 9) ÷ 1,000 = (110 − 40.7) ÷ 1,000 = 0.0693</td><td>(120 − 880 ÷ 9) ÷ 1,000 = (120 − 97.8) ÷ 1,000 = 0.0222</td></tr>
<tr><td>20%</td><td>0.25</td><td>(72 − 39.5) ÷ 1,000 = 0.0325</td><td>(120 − 220) ÷ 1,000 = −0.1000</td></tr>
<tr><td>30%</td><td>0.30 ÷ 0.70 = 0.429</td><td>(45 − 70 × 3 ÷ 7) ÷ 1,000 = (45 − 30) ÷ 1,000 = 0.0150</td><td>(120 − 0.429 × 880) ÷ 1,000 = −0.2571</td></tr></table>
<p><b>(b)</b> 10%: the better default is treat all (0.0222), gain 0.0693 − 0.0222 = 0.0471, or 4.71 per 100. 20%: better default is treat none (0), gain 3.25 per 100. 30%: gain 1.50 per 100.</p>
<p><b>(c)</b> The calculator shows the same net benefits (0.0693, 0.0222; 0.0150, −0.2571) and gains of 4.71 and 1.50 net true positives per 100.</p>
<p><b>(d)</b> A lower threshold refers more women, so TP and FP both rise. Net benefit must be calculated from the counts at the threshold actually used. Using the 20% counts with a 10% weight would mix two different decisions.</p>`
    },
    {
      id: 't5',
      title: 'Is a cervical length scan worth it?',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). At the 20% threshold, the booking model gives TP 72 and FP 158 among 1,000 women (net benefit 0.0325). Adding a cervical length scan for every woman gives TP 80, FP 150, FN 40, TN 730. The team estimates that the scan's cost, time and travel amount to a harm of 0.012 per woman, in units of one correct referral.</p>`,
      questions: [
        '<b>(a)</b> Calculate the net benefit of the model with the scan, before and after subtracting the test harm.',
        '<b>(b)</b> Should the scan be added for all women? At what test harm would the two be equal?',
        '<b>(c)</b> Explain in plain words what a test harm of 0.012 means.',
        '<b>(d)</b> Suggest one way the scan might still be worth using.'
      ],
      answer: `<p><b>(a)</b> Without the harm: (80 − 0.25 × 150) ÷ 1,000 = (80 − 37.5) ÷ 1,000 = 0.0425. With it: 0.0425 − 0.012 = 0.0305.</p>
<p><b>(b)</b> No: 0.0305 is below 0.0325 for the model without the scan. The two are equal when the test harm is 0.0425 − 0.0325 = 0.0100 per woman. The scan pays off only if its harm is below 0.010.</p>
<p><b>(c)</b> Scanning 1,000 women costs as much as 12 correct referrals would gain, or one correct referral for every 83 women scanned (1 ÷ 0.012 = 83).</p>
<p><b>(d)</b> Scan only women whose booking risk is near the threshold, where the result could change the decision. Fewer women pay the test harm, while most of the gain in true positives may be kept. This would need its own net benefit calculation.</p>`
    },
    {
      id: 't6',
      title: 'Decision Curve Lab: calibration and discrimination',
      level: 'Analyse',
      scenario: `<p>Use the Decision Curve Lab in this case. Set the c statistic to 0.75 and keep the other defaults: incidence 12%, calibration-in-the-large shift 0, calibration slope 1, threshold 20%. In this tool the shift and slope describe how the true risks in the setting differ from the model's predictions.</p>`,
      questions: [
        '<b>(a)</b> Read the net benefit of the model and of treat all at the 20% threshold. Then move the threshold to 12%. Where is the model\'s gain largest, and why there?',
        '<b>(b)</b> Return the threshold to 20% and set the shift to −1.0 (true risks lower than predicted, so the model overestimates). Record the true incidence, the net benefit of the model and the verdict.',
        '<b>(c)</b> Set the shift back to 0, the slope to 0.6 and the threshold to 10%. Record the true incidence and both net benefits. What has gone wrong?',
        '<b>(d)</b> Set the slope back to 1 and the c statistic to 0.60, threshold 20%. Compare with (b) and relate this to the book\'s statement about calibrated models.'
      ],
      answer: `<p><b>(a)</b> At 20%: model 0.0229, treat all −0.1000, gain +2.29 net true positives per 100. At 12%: model 0.0440, treat all 0.0000, gain +4.40 per 100. The gain is largest near threshold = incidence (12%), where both default policies give 0.</p>
<p><b>(b)</b> True incidence 5.2%. Model −0.0126, treat all −0.1855, so the best default is treat none (0) and the gain is −1.26 per 100. The verdict says the model does not beat the best default: it is worse than referring no one, because overestimated risks push too many women over the threshold.</p>
<p><b>(c)</b> True incidence 21.3%. Model 0.0996, treat all 0.1257, gain −2.61 per 100. With a slope of 0.6 the model's predictions are too extreme: low risks are too low, so women who need referral are left below the threshold, and referring everyone does better.</p>
<p><b>(d)</b> Model 0.0011, treat all −0.1000, gain +0.11 per 100: small but not negative. A well calibrated model with weak discrimination gives a limited but never negative gain; miscalibration is what produces net benefit below a default policy. Calibration should be checked, and the model updated if needed, before it is used for decisions in a new setting.</p>`
    },
    {
      id: 't7',
      title: 'Critique: a "clinically useful" preterm birth model',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A hospital team developed a model to predict preterm birth from booking information, to decide which women receive vaginal progesterone. Incidence in its data was 12%. The abstract says: "At the standard cutoff of 50%, the model had 89% accuracy, AUC 0.84, and was well calibrated (Hosmer-Lemeshow p = 0.52 in the development data). The model is clinically useful and ready for implementation in all district hospitals." Only 3% of women had a predicted risk of 50% or more. No decision curve was shown.</p>`,
      questions: [
        '<b>(a)</b> Critique the choice of cutoff.',
        '<b>(b)</b> Critique the evidence offered for usefulness: accuracy, AUC and calibration.',
        '<b>(c)</b> What analysis would show clinical usefulness, and what information is needed to set the threshold?',
        '<b>(d)</b> Where is this model on the Reilly and Evans levels, and what is needed before use in all district hospitals?'
      ],
      answer: `<p><b>(a)</b> A 50% cutoff assumes that giving progesterone to a woman who would deliver at term is as bad as failing to treat one who delivers early. The threshold should come from the harms (side effects, cost, clinic visits) and benefits of progesterone, judged by clinicians and women. With only 3% of women above 50%, the model would treat almost no one, close to treat none.</p>
<p><b>(b)</b> <b>Critical:</b> 89% accuracy is barely above the 88% of treating no one at 12% incidence. An AUC of 0.84 says nothing about usefulness at a threshold, because it ignores calibration and consequences. A non-significant Hosmer-Lemeshow test in the development data says nothing about calibration in new women. No internal or external validation is reported, so all measures are apparent and optimistic.</p>
<p><b>(c)</b> Net benefit at a threshold derived from harm : benefit, compared with treat all and treat none, and a decision curve across the plausible range, preferably in validation data. Report calibration-in-the-large and slope, and the distribution of predictions around the threshold.</p>
<p><b>(d)</b> Level 1 (derivation). Needed: narrow, then broad validation (levels 2 and 3) in district hospitals with a different case-mix, recalibration if needed, and an impact analysis (levels 4 and 5), ideally a trial randomised by hospital, before routine use.</p>`
    }
  ]
});
