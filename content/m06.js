registerModule({
  id: 'm06',
  num: 6,
  part: 'Development',
  title: 'Coding of predictors',
  book: 'Ch. 9',
  minutes: 70,
  summary: 'How categorical and continuous predictors should be coded before modelling: dummy variables, why dichotomising a continuous predictor loses information, flexible non-linear functions, outliers and truncation, and how to express effects on a scale readers can use.',
  objectives: [
    'Code categories with dummy variables',
    'Code an ordered predictor as a line',
    'Explain why cutting a measured predictor fails',
    'Choose a polynomial, spline or fractional polynomial',
    'Compare codings with chi-square minus 2 df',
    'Handle outliers and rescale odds ratios'
  ],
  format: 'cases',
  reading: [
    { cite: "Royston P, Altman DG, Sauerbrei W (2006). Dichotomizing continuous predictors in multiple regression: a bad idea. Stat Med 25:127-141.", url: "https://doi.org/10.1002/sim.2331", note: "The classic argument that dichotomising loses power, causes residual confounding and makes data-derived cutpoints biased." },
    { cite: "Bennette C, Vickers A (2012). Against quantiles: categorization of continuous variables in epidemiologic research, and its discontents. BMC Med Res Methodol 12:21.", url: "https://doi.org/10.1186/1471-2288-12-21", note: "An open-access argument against tertiles and quartiles, with practical alternatives for epidemiologists." },
    { cite: "Desquilbet L, Mariotti F (2010). Dose-response analyses using restricted cubic spline functions in public health research. Stat Med 29:1037-1057.", url: "https://doi.org/10.1002/sim.3841", note: "Explains restricted cubic splines for checking and modelling non-linear effects in linear, logistic and Cox models." },
    { cite: "Steyerberg EW, Eijkemans MJC, Harrell FE Jr, Habbema JDF (2001). Prognostic modeling with logistic regression analysis: in search of a sensible strategy in small data sets. Med Decis Making 21:45-56.", url: "https://doi.org/10.1177/0272989X0102100106", note: "Compares coding, stepwise selection and shrinkage in small samples and favours a well-coded full model with shrinkage." }
  ],
  essentials: `
<ul>
<li><b>Coding</b> means turning each recorded variable into the numeric columns that enter the model. Decide it before you look at how each predictor relates to the outcome, or borrow the coding used in earlier studies.</li>
<li>A category with k levels enters as k − 1 <b>dummy variables</b>, each compared with a <b>reference category</b>. The reference changes the coefficients but not the predicted risks. Pick a large group as the reference.</li>
<li>Merge small categories by their size or meaning, not by their outcome rates. An ordered predictor often works well as a single straight-line term.</li>
<li>Cutting a measured predictor into two groups (<b>dichotomising</b>) is a bad idea. It creates a false jump at the cut, treats very different women as the same, and throws information away. It fails completely when risk is U-shaped.</li>
<li>When a straight line is too stiff, let the predictor bend: a square term, a <b>fractional polynomial</b>, or a <b>restricted cubic spline</b>. Each extra bend costs a degree of freedom, which must be paid for with events.</li>
<li>Compare codings by model chi-square minus 2 × df (the AIC rule). Three knots suit small data; four or five suit large data.</li>
<li>Check outliers against the source record, set impossible values to missing, and pull plausible extremes back to a limit (<b>truncation</b>).</li>
<li>Report odds ratios for a useful step, such as per 2 g/dL or per interquartile range: OR = e<sup>k × coefficient</sup>.</li>
</ul>`,
  story: 'Throughout the course you follow the maternity team of a district hospital as it works on one problem: preterm birth. The hospital and its data are fictional and synthetic. The team has chosen its candidate predictors for the booking-visit model. In this module it decides how each one should enter the model: categories such as place of booking, measured values such as age and haemoglobin, odd values in the register, and the units in which effects are reported. You do not need the earlier modules for this story.',
  defs: {
    'dummy variable': 'A 0/1 column that marks whether a woman is in one category, compared with a chosen reference category.',
    'reference category': 'The category that the other categories are compared with; its own coefficient is fixed at zero.',
    'dichotomising': 'Splitting a measured predictor into two groups at a cut-point, such as age under 35 and 35 or over.',
    'degrees of freedom': 'The number of coefficients that a coding uses for one predictor.',
    'model chi-square': 'Twice the gain in log-likelihood when a predictor is added; a larger value means the predictor explains more of the outcome.',
    'restricted cubic spline': 'A smooth curve made of cubic pieces joined at knots, and forced to be a straight line beyond the outer knots.',
    'knot': 'A point on the predictor scale where two pieces of a spline are joined.',
    'fractional polynomial': 'A curve built from one or two powers of the predictor, such as the square, the square root or the logarithm, chosen from a fixed list.',
    'truncation': 'Pulling values beyond a chosen limit back to that limit, so that a few extreme values cannot steer the model.',
    'interquartile range': 'The distance between the 25th and 75th percentiles, which holds the middle half of the values.'
  },
  explainers: [
    {
      id: 'cutage',
      title: 'Why cutting age into two groups loses the pattern',
      scenes: [
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 40, w: 430, h: 190, xlim: [15, 39], ylim: [0, 0.4], xticks: [15, 20, 25, 30, 35], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Maternal age (years)', ylabel: 'Preterm risk' }); var P = [[16, 0.313], [19, 0.161], [22, 0.103], [25, 0.078], [28, 0.079], [31, 0.079], [34, 0.153], [37, 0.298]]; return EX.text(40, 24, 'Observed risk in 3-year age bands, 2,000 women', { size: 'm', bold: true }) + B.s + EX.pts(B, P, { role: 'obs', d: 0.3, stagger: 0.2 }); })()),
          say: 'Here is the development cohort of 2,000 women. Each dot shows the share of women in a three-year age band who delivered before 37 weeks. Risk is high in teenagers, lowest in the late twenties, and high again after 35.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 40, w: 430, h: 190, xlim: [15, 39], ylim: [0, 0.4], xticks: [15, 20, 25, 30, 35], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Maternal age (years)', ylabel: 'Preterm risk' }); var P = [[16, 0.313], [19, 0.161], [22, 0.103], [25, 0.078], [28, 0.079], [31, 0.079], [34, 0.153], [37, 0.298]]; var f = function (a) { return 1 / (1 + Math.exp(2.0233 + 0.014695 * (a - 25.906))); }; return EX.text(40, 24, 'Linear coding (1 df): chi-square 1.2', { size: 'm', bold: true }) + B.s + EX.pts(B, P, { role: 'obs' }) + EX.curve(B, f, 15, 38, { role: 'pred', d: 0.4 }) + EX.gaps(B, P.map(function (p) { return [p[0], p[1], f(p[0])]; }), { d: 1.6 }); })()),
          say: 'First, a straight line for age. A line can only rise or fall, so it lies almost flat at about 12 per cent. The red gaps show that it misses both ends of the U. Its chi-square is only about 1.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 40, w: 430, h: 190, xlim: [15, 39], ylim: [0, 0.4], xticks: [15, 20, 25, 30, 35], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Maternal age (years)', ylabel: 'Preterm risk' }); var P = [[16, 0.313], [19, 0.161], [22, 0.103], [25, 0.078], [28, 0.079], [31, 0.079], [34, 0.153], [37, 0.298]]; var f = function (a) { return a >= 35 ? 0.307 : 0.107; }; return EX.text(40, 24, 'Cut at 35: age 34 gets 11%, age 35 gets 31%', { size: 'm', bold: true }) + B.s + EX.pts(B, P, { role: 'obs' }) + EX.line([[B.X(15), B.Y(0.107)], [B.X(35), B.Y(0.107)], [B.X(35), B.Y(0.307)], [B.X(38), B.Y(0.307)]], { role: 'pred', d: 0.4 }) + EX.gaps(B, P.map(function (p) { return [p[0], p[1], f(p[0])]; }), { d: 1.6 }); })()),
          say: 'Next, cut age at 35. A woman of 34 is given 11 per cent and a woman of 35 is given 31 per cent. Teenagers are put in the same group as women of 30, so their high risk is lost.' },
        { svg: EX.svg((function () { var B = EX.box({ l: 80, t: 40, w: 430, h: 190, xlim: [15, 39], ylim: [0, 0.4], xticks: [15, 20, 25, 30, 35], yticks: [0, 0.1, 0.2, 0.3, 0.4], yfmt: function (v) { return Math.round(v * 100) + '%'; }, xlabel: 'Maternal age (years)', ylabel: 'Preterm risk' }); var P = [[16, 0.313], [19, 0.161], [22, 0.103], [25, 0.078], [28, 0.079], [31, 0.079], [34, 0.153], [37, 0.298]]; var f = function (a) { var z = a - 25.906; return 1 / (1 + Math.exp(2.5453 + 0.026393 * z - 0.015309 * z * z)); }; return EX.text(40, 24, 'Quadratic coding (2 df): chi-square 88', { size: 'm', bold: true }) + B.s + EX.pts(B, P, { role: 'obs' }) + EX.curve(B, f, 15, 38, { role: 'pred', d: 0.4 }) + EX.gaps(B, P.map(function (p) { return [p[0], p[1], f(p[0])]; }), { d: 1.6 }); })()),
          say: 'Now let age bend, with a square term that uses two degrees of freedom. The curve follows both arms of the U, the red gaps almost vanish, and the chi-square rises to 88.' },
        { svg: EX.svg((function () { var L = [['Linear', 1.2], ['Cut at 35', 27.8], ['Cut at 20', 31.6], ['Quadratic', 88.0], ['5-knot spline', 87.8]], s = EX.text(40, 30, 'Model chi-square for each coding of age', { size: 'm', bold: true }); L.forEach(function (b, i) { var h = b[1] * 2, x = 60 + i * 95; s += EX.rect(x, 240 - h, 60, Math.max(h, 2), { role: 'pred', op: 0.8, grow: true, d: 0.3 * i }) + EX.text(x + 30, 232 - h, String(b[1]), { size: 's', anchor: 'middle', d: 0.3 * i + 0.4 }) + EX.text(x + 30, 262, b[0], { size: 's', anchor: 'middle', d: 0.3 * i }); }); return s + EX.line([[50, 240], [530, 240]], { role: 'obs', w: 1, draw: false }); })()),
          say: 'The model chi-square shows how much each coding explains. The straight line explains almost nothing. A single cut explains about 30. The quadratic and the five-knot spline both explain about 88.' },
        { svg: EX.svg(EX.text(280, 110, 'Keep a measured predictor measured', { size: 'l', bold: true, anchor: 'middle' }) + EX.text(280, 150, 'Let it bend if the risk bends', { anchor: 'middle', d: 0.6 }) + EX.text(280, 178, 'A cut-point throws information away', { anchor: 'middle', d: 1.2 }) + EX.text(280, 206, 'and adds a jump that no biology has', { anchor: 'middle', d: 1.6 })),
          say: 'So keep a measured predictor measured, and let it bend if the risk bends. Cutting it into groups throws information away, and adds a jump in risk that no woman\'s biology has.' }
      ]
    }
  ],
  cases: [
    {
      id: 'c1',
      title: 'Categories: dummy variables and ordered groups',
      aim: 'code a categorical predictor with dummy variables, choose a reference category, and code an ordered predictor.',
      minutes: 15,
      need: `
<p>A regression model needs numbers. A category such as place of booking is entered as a set of <b>dummy variables</b>: 0/1 columns, one for each category except one. The category left out is the <b>reference category</b>. Each coefficient compares one category with the reference, as a log odds ratio. A category with k levels uses k − 1 coefficients, so it costs k − 1 <b>degrees of freedom</b> (df).</p>
<p><b>Worked example (Illustrative, synthetic).</b> Of 1,240 women who booked at a sub-centre, 135 delivered early (10.9 per 100). Of 600 at a primary health centre (PHC), 78 did (13.0 per 100). With the sub-centre as reference, the PHC coefficient is the log odds ratio between the two groups: ln[(78/522) ÷ (135/1,105)] = +0.20.</p>
<p><b>The reference changes the coefficients, not the predictions.</b> Every woman gets the same predicted risk whichever category is the reference. But if the reference is a small group, every comparison with it is imprecise and may look "not significant". Choose a large group.</p>
<p><b>Merging small categories.</b> Rare categories can be joined, but only on the grounds of size or meaning (for example, similar services), decided without looking at preterm rates. Merging the groups that happen to have similar outcome rates in your data makes the model look better than it is.</p>
<p><b>Ordered categories</b> (such as 0, 1, 2, 3 or more previous miscarriages) can be entered as dummies or as one straight-line term with scores 0, 1, 2, 3. In the book's GUSTO-I trial of heart attack (40,830 patients), Killip class (I to IV) gave a model chi-square of 1,388 as a line (1 df) and 1,389 with three dummies (3 df). Cutting it into two groups gave only 861. A line is a good start; a square term can then check for a bend.</p>`,
      scenario: `<p>The register records where each woman first booked: sub-centre (62%), PHC (30%), private clinic (7%) or tertiary hospital (1%). It also records the number of previous miscarriages. The data manager's software has picked the tertiary hospital as the reference category, because it has the highest code.</p>`,
      widgets: '',
      tasks: [0, 1],
      takeaway: 'Use k − 1 dummies with a large reference group, merge categories without looking at the outcome, and try a single line for an ordered predictor.'
    },
    {
      id: 'c2',
      title: 'Should age be cut at 35?',
      aim: 'see why dichotomising a measured predictor creates false steps and loses information, most of all when risk is U-shaped.',
      minutes: 20,
      need: `
<p>Splitting a measured predictor into "high" and "low" is common, because it is easy to present. For prediction it is a bad idea, for three reasons.</p>
<ul>
<li><b>The step is unnatural.</b> With age cut at 35, a woman who turns 35 tomorrow has a sudden jump in risk. A woman of 20 and a woman of 34 are given the same risk.</li>
<li><b>Information is lost.</b> In the book's GUSTO-I data, age cut at 65 years gave a model chi-square of 1,463, against 2,099 for a straight line: only 70% as much. Three age groups recovered 1,775 (85%).</li>
<li><b>A U-shape is lost completely.</b> If risk is high at both ends, any single cut misses one end.</li>
</ul>
<p><b>Model chi-square</b> is twice the gain in log-likelihood when the predictor is added. Bigger means the coding explains more of the outcome.</p>
<p><b>Worked example (ptb_dev, synthetic).</b> Per 100 women, about 31 teenagers aged 15 to 17 deliver early, about 8 women aged 24 to 32, and about 30 women aged 36 to 38. A cut at 35 gives every woman under 35 the same risk of 10.7 per 100, including the teenagers.</p>
<div class="callout warn"><b>Critical</b><p>Choosing the cut that gives the smallest p-value in your own data makes the effect look larger than it is, and it will not be repeated in new women. Groups such as quartiles are fine for looking at the data or for a figure, but not in the final model.</p></div>
<div data-explainer="cutage"></div>`,
      scenario: `<p>A senior obstetrician asks the team to enter age as "35 or over: yes or no", because "that is how we counsel women". The statistician opens the coding explorer to show what the cut does to the fit.</p>`,
      widgets: `<div data-widget="codingExplorer" data-try="Choose Dichotomised and move the cut from 30 to 35, then choose Quadratic and compare the LR χ² and AIC."></div>`,
      tasks: [2, 3],
      takeaway: 'Keep a measured predictor continuous: a cut-point adds false jumps, wastes information and cannot show a U-shaped risk.'
    },
    {
      id: 'c3',
      title: 'Letting haemoglobin bend',
      aim: 'choose a flexible coding for a continuous predictor, count its degrees of freedom, and compare codings fairly.',
      minutes: 20,
      need: `
<p>When a straight line is too stiff, a predictor can enter through a few terms that together make a curve. Each extra term costs one degree of freedom.</p>
<ul>
<li><b>Polynomials:</b> add a square term (2 df) or a square and a cube (3 df). Simple, but the ends of the curve can swing wildly.</li>
<li><b>Simple transformations:</b> log, square root or inverse (1 df). A log is often a good summary for a laboratory value.</li>
<li><b>Fractional polynomials (FP):</b> powers chosen from −2, −1, −0.5, 0 (the log), 0.5, 1, 2 and 3. One power (FP1) or two powers (FP2, 4 df in all including the search). FP2 is usually flexible enough.</li>
<li><b>Restricted cubic splines (RCS):</b> smooth cubic pieces joined at <b>knots</b>, kept straight beyond the outer knots, so the ends stay calm. Knots minus 1 = df. Use 3 knots in small data, 4 or 5 in large data. Knots are placed at set percentiles of the predictor.</li>
</ul>
<p><b>A fair comparison.</b> A term with no real effect adds about 1 to the chi-square by chance. So compare codings by <b>model chi-square − 2 × df</b> (Akaike's information criterion, AIC, written on the chi-square scale).</p>
<p><b>Worked example (Book example, GUSTO-I, number of ECG leads with ST elevation).</b> Cut at more than 4 leads: 259 − 2 × 1 = 257. Straight line: 281 − 2 = 279. Square term: 306 − 4 = 302. Five-knot spline: 350 − 8 = 342. The spline wins even after paying for its 4 df. Death rates fell from 7.1% at 0 leads to 4.7% at 3 leads, then rose to about 12%, a U-shape.</p>
<div class="callout warn"><b>Critical</b><p>Flexibility is paid for with events. Fix the df for each predictor in advance, and keep the total within what your events can support.</p></div>`,
      scenario: `<p>The team looks at booking haemoglobin (Hb). Clinicians expect risk to rise as Hb falls, perhaps more steeply in severe anaemia. Among the 1,693 women in ptb_dev with a recorded Hb, 201 delivered early. The statistician fits several codings of Hb, each on its own.</p>`,
      widgets: `<div data-widget="codingExplorer" data-try="This explorer codes maternal age: choose the 5-knot spline, then lower the random subsample size from 2000 to 200 and watch the chi-square, the AIC and the tails of the curve."></div>`,
      tasks: [4, 5],
      takeaway: 'Let a continuous predictor bend with a spline or polynomial, judge codings by chi-square minus 2 × df, and spend df only as far as the events allow.'
    },
    {
      id: 'c4',
      title: 'Odd values and useful units',
      aim: 'deal with outliers by checking, setting to missing or truncating, and express odds ratios per a useful step.',
      minutes: 15,
      need: `
<p><b>Outliers.</b> An outlier is a value far outside the usual range. One rule (Tukey's) uses the <b>interquartile range</b> (IQR), the gap between the 25th percentile (Q1) and the 75th (Q3):</p>
<div class="formula">lower fence = Q1 − 3 × IQR        upper fence = Q3 + 3 × IQR</div>
<p>Then work in three steps:</p>
<ol>
<li><b>Is it correct?</b> Check the source record for a typing error, and correct it if you can.</li>
<li><b>Is it possible?</b> Ask a clinician. An impossible value is treated as an error and set to <b>missing</b> (see Module 5). Do not delete the woman.</li>
<li><b>If it is possible, limit its pull.</b> <b>Truncation</b> moves values beyond a limit back to the limit. Choose limits from the distribution, not the outcome; the book suggests moving about 0.5% to 1% of values at each end.</li>
</ol>
<p><b>Useful units.</b> A coefficient refers to a one-unit step. One gram of weight or one year of age is often too small to mean much. For a step of k units, multiply the coefficient by k:</p>
<div class="formula">OR for k units = e<sup>k × coefficient</sup> = (OR per unit)<sup>k</sup></div>
<p><b>Worked example (Book example, GUSTO-I).</b> The coefficient for age was 0.084 per year, so the OR per year was e<sup>0.084</sup> = 1.088. Per 10 years: e<sup>0.84</sup> = 2.32, which equals 1.088<sup>10</sup>. The predictions and the p-value do not change. You can also report the OR per standard deviation, or per IQR (75th versus 25th percentile). A graph of risk against the predictor is the clearest way to show a curved effect.</p>`,
      scenario: `<p>Before fitting, the data manager runs range checks on booking Hb. In the women with a recorded Hb, Q1 is 10.0 and Q3 is 11.8 g/dL. A few entries look odd. Separately, the team must decide how to report the Hb effect in its paper.</p>`,
      widgets: '',
      tasks: [6, 7],
      takeaway: 'Check, then set impossible values to missing, then truncate plausible extremes; and report odds ratios per a step that clinicians can use.'
    }
  ],
  sections: [
    {
      id: 'n1',
      title: 'Coding categorical predictors',
      html: `
<p>Coding follows data inspection and comes before the choice of predictors. Choices made while looking at the predictor-outcome relationship in the development data add optimism; choices made blind to the outcome, or copied from earlier studies, do not.</p>
<p>A predictor with k categories uses k − 1 dummy variables against a reference category. The reference matters for interpretation (a small reference gives imprecise comparisons) but not for predictions. Small categories may be merged by frequency or meaning while blind to the outcome, or kept with shrinkage (Module 10).</p>
<div class="callout book"><b>Book example: GUSTO-I (n = 40,830), model χ² by coding</b>
<table class="data">
<tr><th>Predictor</th><th>Coding</th><th>df</th><th>χ²</th></tr>
<tr><td>Infarct location</td><td>Anterior vs other</td><td>1</td><td>343</td></tr>
<tr><td></td><td>Anterior / inferior / other</td><td>2</td><td>361</td></tr>
<tr><td>Killip class</td><td>Shock (3/4 vs 1/2)</td><td>1</td><td>861</td></tr>
<tr><td></td><td>Linear; linear + square</td><td>1; 2</td><td>1,388; 1,388</td></tr>
<tr><td></td><td>Factor (three dummies)</td><td>3</td><td>1,389</td></tr>
<tr><td>Smoking</td><td>Two dummies; linear</td><td>2; 1</td><td>483; 482</td></tr>
</table>
<p>The "other" location (3% of patients) still added information in this large trial.</p></div>
<p>Linear coding of an ordinal predictor is a reasonable start, with a square term as a check. Methods that force a monotone effect exist but are more flexible than a line.</p>
<p class="src">Source: Ch. 9, background, §9.1, Table 9.1</p>`
    },
    {
      id: 'n2',
      title: 'Dichotomising continuous predictors',
      html: `
<p>A dichotomised predictor assumes a jump at the cut and equal risk within each group; it agrees with the linear fit at only two points (Fig. 9.1), and its shape depends on the range of the sample, so it transports poorly.</p>
<div class="callout book"><b>Book example: GUSTO-I, Table 9.2</b>
<table class="data">
<tr><th>Predictor</th><th>Coding</th><th>df</th><th>χ²</th></tr>
<tr><td>Age</td><td>≤65 vs &gt;65</td><td>1</td><td>1,463</td></tr>
<tr><td></td><td>≤60, 61 to 70, ≥71</td><td>2</td><td>1,775</td></tr>
<tr><td></td><td>Linear; + square</td><td>1; 2</td><td>2,099; 2,112</td></tr>
<tr><td></td><td>RCS, 5 knots</td><td>4</td><td>2,122</td></tr>
<tr><td>ST elevation (leads)</td><td>&gt;4 vs ≤4</td><td>1</td><td>259</td></tr>
<tr><td></td><td>Linear; + square; + cubic</td><td>1; 2; 3</td><td>281; 306; 339</td></tr>
<tr><td></td><td>RCS, 5 knots</td><td>4</td><td>350</td></tr>
<tr><td></td><td>Factor</td><td>11</td><td>367</td></tr>
</table></div>
<p>Thirty-day mortality by leads with ST elevation, 0 to 9: 7.1, 6.9, 5.1, 4.7, 6.5, 7.4, 9.3, 12, 12, 12% (Table 9.3). The U-shape makes the dichotomy the worst coding. Searching for an "optimal" cut-point causes optimism (Chapter 5). Categories are for exploration or illustration only; even four or five categories remain a step function with arbitrary borders.</p>
<p class="src">Source: Ch. 9, §9.2, Tables 9.2-9.3</p>`
    },
    {
      id: 'n3',
      title: 'Flexible functions',
      html: `
<p><b>Polynomials and transformations:</b> X + X², X + X² + X³, or 1/X, X<sup>0.5</sup>, log X, exp X. Extensions can be tested in nested models; tails may be erratic.</p>
<p><b>Fractional polynomials:</b> powers p from {−2, −1, −0.5, 0, 0.5, 1, 2, 3}, X<sup>0</sup> = log X. Eight FP1 functions; 36 FP2 functions (28 pairs plus 8 of the form X<sup>p</sup> + X<sup>p</sup> log X), using 4 df. Limits: tail values can distort the shape, FPs are not invariant to a shift of origin, negative values need a shift, and confidence intervals are too narrow if the power search is ignored.</p>
<p><b>Restricted cubic splines:</b> linear beyond the outer knots; df = knots − 1. Three knots (2 df) for small data or no strong prior expectation of non-linearity; 4 knots (3 df) intermediate; 5 knots (4 df) for large data. Knot positions, set by percentiles, are not critical. A 2-df RCS covers more shapes than X + X².</p>
<p><b>GAM smoothing splines</b> use a penalty to limit wiggliness; without it they overfit (Module 10).</p>
<p>RCS with different knots are not nested; compare codings by χ² − 2 × df (AIC). For ST elevation: 257, 279, 302, 333 (cubic) and 342 (RCS).</p>
<table class="data">
<tr><th>Option</th><th>Book's verdict (Table 9.4)</th></tr>
<tr><td>Dichotomisation</td><td>Bad idea</td></tr>
<tr><td>More categories</td><td>Primarily for illustration</td></tr>
<tr><td>Linear</td><td>Often reasonable as a start</td></tr>
<tr><td>Polynomials</td><td>Reasonable as checks for non-linearity</td></tr>
<tr><td>Transformations</td><td>May give robust summaries</td></tr>
<tr><td>FP; RCS</td><td>Flexible descriptions (RCS robust in the tails)</td></tr>
<tr><td>GAM splines</td><td>Highly flexible</td></tr>
</table>
<p class="src">Source: Ch. 9, §9.3, Table 9.4</p>`
    },
    {
      id: 'n4',
      title: 'How much flexibility to allow',
      html: `
<p>A middle course: find a simple transformation that captures most of the non-linearity, then check it with RCS terms of the transformed variable. Book example: PSA was linearly related to outcome after a log transformation, where the original model used a 5-knot RCS. A restricted form may lower apparent fit slightly but limits optimism.</p>
<p><b>FP or RCS?</b> Empirical comparisons are lacking; differences arise in the tails (FP captures real tail curvature, RCS resists spurious curvature). Book example: in about 800 GUSTO-I patients the FP2 for age (AGE<sup>−2</sup> + AGE<sup>3</sup>, 4 df) had no more than two bends, which a 4-knot RCS (3 df) can reproduce; no significant non-linearity was found. In the full data the best transformation was AGE<sup>2</sup>; weight and height showed no significant non-linearity.</p>
<p><b>Extrapolation:</b> the RCS extrapolates linearly; for ST elevation the cubic polynomial curved down at 10 leads, which is implausible.</p>
<p><b>Allocating df:</b> Harrell fixes the df per predictor from univariate analyses and keeps them whatever the significance; an alternative gives every continuous predictor, say, 5 df and reduces df by partial R². Both avoid testing-then-estimating bias (Module 4). The affordable df are set by events, not patients (Module 2).</p>
<p class="src">Source: Ch. 9, §9.3.4-9.3.5, §9.6</p>`
    },
    {
      id: 'n5',
      title: 'Outliers and truncation',
      html: `
<p>Tukey's rule: outliers lie at least 3 × IQR beyond Q1 or Q3. Practically, any value with a large influence on the coefficients is a concern. Steps: verify against the source record; judge biological plausibility with experts (a systolic pressure of 250 mmHg may be plausible in acute brain-injury care but not in a clinic); set implausible values to missing (Module 5); truncate plausible extremes: if X &gt; X<sub>max</sub> then X = X<sub>max</sub>, and likewise at X<sub>min</sub>, shifting about 0.5% to 1% at each end, chosen from the distribution.</p>
<div class="callout book"><b>Book example: glucose after traumatic brain injury</b><p>Of 4,831 admission glucose values, 3 were above 100 mmol/L and set to missing. In 2,096 Tirilazad trial patients with glucose and 6-month outcome, glucose was truncated to 3 to 20 mmol/L, and the relation with outcome became slightly more linear.</p></div>
<p class="src">Source: Ch. 9, §9.4, Table 9.5, Figs 9.4-9.5</p>`
    },
    {
      id: 'n6',
      title: 'Interpretable scales',
      html: `
<p>Binary predictors have no scaling problem. For continuous ones, rescale: OR for k units = exp(k × β). GUSTO-I age: β = 0.084 per year (OR 1.088), 0.84 per decade (OR 2.32). Standardise per SD, or compare the 75th with the 25th percentile (equal to dividing by the IQR for a linear term). Standardising does not apply to categorical, polynomial or other non-linear codings; for those compare predictions at the two percentiles, or show a graph. Dummies for &lt;25th and &gt;75th percentile (middle 50% as reference) can illustrate a curve but lose information and should not be used for prediction.</p>
<div class="callout book"><b>Book example: systolic blood pressure after brain injury</b><p>U-shaped relation, modelled with a 3-knot RCS (2 df). OR for predictions at 141 versus 121 mmHg (75th versus 25th percentile): 1.39 (95% CI 1.25 to 1.54). Categories &lt;120 and &gt;150 mmHg (reference 120 to 150) gave ORs of 0.50 and 0.76 for a good outcome. R² was 2.4% for the categories against 4.8% for the continuous coding.</p></div>
<p class="src">Source: Ch. 9, §9.5, Table 9.6</p>`
    }
  ],
  keyPoints: [
    'The reference category of a dummy-coded predictor changes the coefficients but not the predictions; choose a reasonably large reference group.',
    'Merge small categories on frequency or meaning while blind to the outcome, or use codings from earlier studies; merging by outcome rates makes the model optimistic.',
    'A linear term for an ordered predictor often keeps nearly all the information (Killip class: χ² 1,388 linear against 1,389 with three dummies), while a dichotomy loses much (861).',
    'Dichotomising a continuous predictor creates false steps, loses information (age at 65: χ² 1,463 against 2,099 linear) and fails completely for U-shaped relations.',
    'Restricted cubic splines (k knots, k − 1 df, linear in the tails) and fractional polynomials give smooth flexible fits; use 3 knots in small data, 4 or 5 in large data.',
    'Compare non-nested codings with model χ² − 2 × df, and fix the flexibility of each predictor in advance, within what the events allow.',
    'Check outliers for errors and plausibility, set impossible values to missing, and truncate plausible extremes (about 0.5% to 1% at each end).',
    'Express effects per a useful step with OR = exp(k × β); rescaling changes the unit, not the predictions.'
  ],
  quiz: [
    {
      q: 'The team codes place of booking with three dummy variables. It changes the reference category from the tertiary hospital (1% of women) to the sub-centre (62%). What happens?',
      options: [
        'Every woman\'s predicted risk of preterm birth changes, because the baseline group is different.',
        'The coefficients and their p-values change, but every woman\'s predicted risk stays the same.',
        'Nothing changes, not even the coefficients, because dummy variables are symmetric.',
        'The model chi-square for place of booking falls, because fewer comparisons are made.'
      ],
      answer: 1,
      why: 'Changing the reference only changes which comparisons the coefficients describe. The model still gives each place of booking its own risk, so predictions and the overall chi-square are unchanged. Comparisons against a 1% group are imprecise, so the large group is the better reference. The coefficients do change, so the third option is wrong.'
    },
    {
      q: 'In the booking model the coefficient for haemoglobin is −0.21 per g/dL. What is the odds ratio for a woman whose Hb is 2 g/dL higher than another woman\'s, other predictors equal?',
      options: [
        '0.81',
        '1.62',
        '0.66',
        '0.58'
      ],
      answer: 2,
      why: 'The log odds change by 2 × (−0.21) = −0.42, so the OR is e^(−0.42) = 0.66. The value 0.81 is the OR for 1 g/dL. Multiplying the OR by 2 (1.62) is the common error: odds ratios multiply across steps (0.81 × 0.81 = 0.66), they do not add. 0.58 comes from 1 − 0.42, without exponentiating.'
    },
    {
      q: 'Illustrative (synthetic): the register records household socio-economic class in four ordered groups (I to IV). Added to the booking model, it gives a model chi-square of 14 as lowest class versus the rest (1 df), 30 as a linear term with scores 1 to 4 (1 df) and 31 with three dummies (3 df). What does this show?',
      options: [
        'The dummy coding is wasteful, because it has the lowest chi-square.',
        'The yes/no split is best, because it is easiest to explain to clinicians.',
        'The order of the classes should be ignored, because dummies are the most flexible.',
        'A linear term keeps almost all the information of the dummies with 1 df instead of 3, while the yes/no split loses much of it.'
      ],
      answer: 3,
      why: 'Linear and dummy codings fit almost equally well (30 against 31; chi-square minus 2 × df is 28 against 25), so the 2 extra df buy nothing, and the yes/no split keeps less than half the information (14 of 30). The first option misreads the numbers: the dummies have the highest chi-square. Being easy to explain does not make up for lost prediction. The book\'s GUSTO-I example shows the same pattern for Killip class (861, 1,388 and 1,389).'
    },
    {
      q: 'Which description fits a restricted cubic spline with 4 knots?',
      options: [
        'A single cubic polynomial over the whole range, using 3 df.',
        'Cubic pieces joined at the knots, straight beyond the outer knots, using 3 df.',
        'Straight-line pieces joined at the knots, using 4 df.',
        'Cubic pieces joined at the knots with no limit on the tails, using 4 df.'
      ],
      answer: 1,
      why: 'A restricted cubic spline has cubic pieces between knots and is linear in the tails, and k knots use k − 1 df. Without the tail restriction the curve can swing where data are sparse. A single global cubic is a polynomial, not a spline. Straight-line pieces would be a linear spline.'
    },
    {
      q: 'In the register, one woman has a booking Hb of 19.5 g/dL. Q1 is 10.0 and Q3 is 11.8 g/dL. What should the team do first?',
      options: [
        'Delete the woman from the dataset, because outliers distort regression.',
        'Truncate all Hb values at the 1st and 99th percentiles and carry on.',
        'Check the source record for a typing error and judge whether the value is possible; set it to missing if it is not.',
        'Take the log of Hb, so that the value no longer looks extreme.'
      ],
      answer: 2,
      why: 'The upper fence is 11.8 + 3 × 1.8 = 17.2, so 19.5 is an outlier. The order is: check the record (perhaps 9.5 was typed), judge plausibility, set impossible values to missing, and only then truncate plausible extremes. Deleting the woman wastes her other data. Truncating first can hide a typing error. A log changes the shape for every woman, which is a separate decision.'
    },
    {
      q: 'A published preterm model cut maternal age at the value, between 18 and 40, that gave the smallest p-value in its own data. What is the main problem?',
      options: [
        'The effect of age looks larger than it is, and the cut will not be repeated in new women.',
        'A p-value cannot be calculated for a dichotomised predictor.',
        'There is no problem, as long as the chosen cut is reported.',
        'The search always picks the median, which wastes the search.'
      ],
      answer: 0,
      why: 'Searching for the "optimal" cut uses the outcome in the same data, so the chosen split fits chance features and the effect is exaggerated. It also keeps all the problems of a dichotomy, and with a U-shaped risk a single cut misses one end. Reporting the cut does not remove the bias, and the search does not tend towards the median.'
    }
  ],
  tasks: [
    {
      id: 't0',
      title: 'Which category should be the reference?',
      level: 'Understand',
      scenario: `<p>Illustrative (synthetic). Place of booking in 2,000 women:</p>
<table class="data">
<tr><th>Place</th><th>Women</th><th>Preterm</th><th>Risk</th></tr>
<tr><td>Sub-centre</td><td>1,240</td><td>135</td><td>10.9%</td></tr>
<tr><td>PHC</td><td>600</td><td>78</td><td>13.0%</td></tr>
<tr><td>Private clinic</td><td>140</td><td>14</td><td>10.0%</td></tr>
<tr><td>Tertiary hospital</td><td>20</td><td>3</td><td>15.0%</td></tr>
</table>
<p>With the tertiary hospital as reference, the software reports: intercept −1.73; sub-centre −0.37 (SE 0.63); PHC −0.17 (SE 0.64); private −0.46 (SE 0.69). None is "significant".</p>`,
      questions: [
        '<b>(a)</b> How many dummy variables, and how many df, does place of booking use?',
        '<b>(b)</b> Refit with the sub-centre as reference. Give the intercept and the three coefficients, using the log odds of each group.',
        '<b>(c)</b> Calculate the predicted risk for a woman booked at a PHC under both choices of reference.',
        '<b>(d)</b> Why are the standard errors so large with the tertiary reference? Which reference would you use, and could the tertiary group be merged?'
      ],
      answer: `<p><b>(a)</b> Four categories, so 4 − 1 = 3 dummies and 3 df.</p>
<p><b>(b)</b> Log odds of each group: sub-centre ln(135/1,105) = −2.10; PHC ln(78/522) = −1.90; private ln(14/126) = −2.20; tertiary ln(3/17) = −1.73. With the sub-centre as reference: intercept −2.10; PHC −1.90 − (−2.10) = +0.20; private −2.20 − (−2.10) = −0.10; tertiary −1.73 − (−2.10) = +0.37.</p>
<p><b>(c)</b> Tertiary reference: lp = −1.73 + (−0.17) = −1.90. Sub-centre reference: lp = −2.10 + 0.20 = −1.90. Both give risk = 1 / (1 + e<sup>1.90</sup>) = 13.0%, the observed PHC risk. The predictions do not depend on the reference.</p>
<p><b>(d)</b> Every comparison is made against a group of only 20 women with 3 events, so each comparison is imprecise (SE about 0.63 or more). With the sub-centre as reference the SE of the PHC comparison is about 0.15. Use the sub-centre, the largest group. The tertiary group could be merged with the private clinics on the grounds of a similar level of service, decided without looking at the preterm rates (merged: 17 of 160, 10.6%). Merging it with the PHC "because both have high rates" would use the outcome and make the model optimistic.</p>`
    },
    {
      id: 't1',
      title: 'Coding an ordered predictor',
      level: 'Analyse',
      scenario: `<p>Illustrative (synthetic). The number of previous miscarriages is recorded as 0, 1, 2, or 3 or more. The statistician adds four codings of it, in turn, to a model without it:</p>
<table class="data">
<tr><th>Coding</th><th>df</th><th>Model χ²</th></tr>
<tr><td>Any previous miscarriage vs none</td><td>1</td><td>9</td></tr>
<tr><td>Linear (scores 0, 1, 2, 3)</td><td>1</td><td>21</td></tr>
<tr><td>Linear + square</td><td>2</td><td>22</td></tr>
<tr><td>Three dummy variables</td><td>3</td><td>23</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Calculate χ² − 2 × df for each coding.',
        '<b>(b)</b> What share of the linear coding\'s chi-square does the yes/no coding keep?',
        '<b>(c)</b> Which coding would you use, and what does the linear + square row tell you?',
        '<b>(d)</b> Compare the pattern with the book\'s Killip class example.'
      ],
      answer: `<p><b>(a)</b> Any vs none: 9 − 2 = 7. Linear: 21 − 2 = 19. Linear + square: 22 − 4 = 18. Dummies: 23 − 6 = 17.</p>
<p><b>(b)</b> 9 / 21 = 0.43, so the yes/no coding keeps only about 43% of the information.</p>
<p><b>(c)</b> The linear term: it has the highest χ² − 2 × df, and uses 1 df. The square term adds only 1 to the chi-square, about what a term with no real effect adds by chance, so there is no sign of a bend. The dummies gain 2 more for 2 more df, which is not worth paying.</p>
<p><b>(d)</b> The same pattern as Killip class in GUSTO-I: dichotomy 861, line 1,388, three dummies 1,389. A straight line keeps nearly all the information of the full factor coding, while a yes/no split throws much of it away.</p>`
    },
    {
      id: 't2',
      title: 'What a cut at 35 does to each woman',
      level: 'Understand',
      scenario: `<p>In ptb_dev (synthetic, 2,000 women, 234 preterm births), age cut at 35 gives a predicted risk of 10.7% for every woman under 35 and 30.7% for every woman aged 35 or more. The observed risks in 3-year age groups are: 15 to 17 years, 31.3%; 18 to 20, 16.1%; 21 to 23, 10.3%; 24 to 26, 7.8%; 27 to 29, 7.9%; 30 to 32, 7.9%; 33 to 35, 15.3%; 36 to 38, 29.8%.</p>`,
      questions: [
        '<b>(a)</b> Give the predicted risk for women aged 16, 30, 34, 35 and 42 under the cut model.',
        '<b>(b)</b> Which women are badly served by the cut? Use the observed risks.',
        '<b>(c)</b> The obstetrician says "35 is where risk starts". Explain in two sentences why a smooth curve is more believable than a step.'
      ],
      answer: `<p><b>(a)</b> Ages 16, 30 and 34: 10.7%. Ages 35 and 42: 30.7%.</p>
<p><b>(b)</b> Teenagers: women aged 15 to 17 have an observed risk of 31.3% but are given 10.7%, about a third of their real risk, so they would not be flagged for extra care. Women aged 33 and 34 are given 10.7% while women of 35 get 30.7%, almost three times as much (30.7 / 10.7 = 2.9) for one year of age. Women in their late twenties (about 8%) are overpredicted at 10.7%.</p>
<p><b>(c)</b> Risk does not jump on a birthday; the observed risks rise gradually after about 30 and fall gradually through the teenage years. A step forces one risk on women aged 15 and 34, and another on women aged 35 and 44, which matches neither end of the U.</p>`
    },
    {
      id: 't3',
      title: 'Compare codings of maternal age in the explorer',
      level: 'Analyse',
      scenario: `<p>Use the coding explorer in this case. It fits maternal age alone to <b>ptb_dev</b> (synthetic, <span data-live="ptb_dev_n"></span> women, <span data-live="ptb_dev_events"></span> preterm births). Leave the random subsample size at 2000.</p>`,
      questions: [
        '<b>(a)</b> Record the LR χ², model df and AIC for: Linear; Dichotomised with the cut at 20, 25, 30 and 35; Quadratic; and the splines with 3, 4 and 5 knots.',
        '<b>(b)</b> Which coding has the lowest AIC? Why is the linear coding the worst of all?',
        '<b>(c)</b> Suppose the team had picked the best of all the cuts from 18 to 40. Why would its chi-square be misleading?',
        '<b>(d)</b> The splines fit no better than the quadratic here. What does that tell you about these data?'
      ],
      answer: `<p><b>(a)</b></p>
<table class="data">
<tr><th>Coding</th><th>LR χ²</th><th>df</th><th>AIC</th></tr>
<tr><td>Linear</td><td>1.2</td><td>1</td><td>1446.4</td></tr>
<tr><td>Cut at 20</td><td>31.6</td><td>1</td><td>1416.0</td></tr>
<tr><td>Cut at 25</td><td>5.5</td><td>1</td><td>1442.2</td></tr>
<tr><td>Cut at 30</td><td>2.5</td><td>1</td><td>1445.1</td></tr>
<tr><td>Cut at 35</td><td>27.8</td><td>1</td><td>1419.8</td></tr>
<tr><td>Quadratic</td><td>88.0</td><td>2</td><td>1361.6</td></tr>
<tr><td>Spline, 3 knots</td><td>84.2</td><td>2</td><td>1365.5</td></tr>
<tr><td>Spline, 4 knots</td><td>86.3</td><td>3</td><td>1365.3</td></tr>
<tr><td>Spline, 5 knots</td><td>87.8</td><td>4</td><td>1365.8</td></tr>
</table>
<p><b>(b)</b> The quadratic, AIC 1361.6. The risk is U-shaped around 27 years, so a straight line can only tilt slightly and lies almost flat (χ² 1.2). Each cut captures only one end of the U: a cut at 20 picks up the teenagers, a cut at 35 the older women, and neither gets both.</p>
<p><b>(c)</b> The best cut is chosen because it happens to separate the outcomes best in this sample, partly by chance. Its chi-square is then too high, the effect is exaggerated, and another sample would pick a different cut. This is one of the data-driven choices that cause optimism. It is also still a step, and still misses one arm of the U.</p>
<p><b>(d)</b> A parabola already describes the shape well (the synthetic data were in fact built with a term in (age − 27)²). The splines reach the same χ² of about 84 to 88, so their extra df buy nothing. In other data, where the curve is not a parabola, a spline may fit better.</p>`
    },
    {
      id: 't4',
      title: 'Choose a coding for haemoglobin',
      level: 'Apply',
      scenario: `<p>ptb_dev (synthetic), women with a recorded Hb: 1,693 women, 201 preterm births. Each coding of Hb was added on its own to a model with no predictors:</p>
<table class="data">
<tr><th>Coding of Hb</th><th>df</th><th>Model χ²</th></tr>
<tr><td>Hb &lt; 11 vs ≥ 11 g/dL</td><td>1</td><td>11.4</td></tr>
<tr><td>Linear</td><td>1</td><td>11.8</td></tr>
<tr><td>Log of Hb</td><td>1</td><td>12.8</td></tr>
<tr><td>Linear + square</td><td>2</td><td>15.8</td></tr>
<tr><td>Restricted cubic spline, 3 knots</td><td>2</td><td>16.6</td></tr>
<tr><td>Restricted cubic spline, 4 knots</td><td>3</td><td>19.3</td></tr>
<tr><td>Restricted cubic spline, 5 knots</td><td>4</td><td>20.0</td></tr>
</table>`,
      questions: [
        '<b>(a)</b> Calculate χ² − 2 × df for each coding and rank them.',
        '<b>(b)</b> Why is the comparison done this way, rather than by χ² alone, or by testing the 5-knot spline down to 3 knots?',
        '<b>(c)</b> The cut at 11 g/dL does almost as well as the straight line here. Why might that be, and why should it still not be used?',
        '<b>(d)</b> The other predictors use 14 df, and there are 201 events. Which coding of Hb would you fix in advance?'
      ],
      answer: `<p><b>(a)</b> Cut: 11.4 − 2 = 9.4. Linear: 11.8 − 2 = 9.8. Log: 12.8 − 2 = 10.8. Linear + square: 15.8 − 4 = 11.8. RCS 3 knots: 16.6 − 4 = 12.6. RCS 4 knots: 19.3 − 6 = 13.3. RCS 5 knots: 20.0 − 8 = 12.0. Ranking: RCS 4 knots (13.3), RCS 3 knots (12.6), RCS 5 knots (12.0), square (11.8), log (10.8), linear (9.8), cut (9.4).</p>
<p><b>(b)</b> A term with no real effect adds about 1 to the chi-square by chance, so more flexible codings always look a bit better. Subtracting 2 per df (the AIC rule) charges for the extra terms. Splines with different numbers of knots are not nested, so a stepwise test from 5 knots down to 3 is not strictly correct.</p>
<p><b>(c)</b> In these synthetic data, risk rises as Hb falls below about 11 g/dL and is flat above it, so a clinical cut at 11 lies at the real bend. Even so, a woman with Hb 7 gets the same risk as one with 10.9, which wastes the information about severe anaemia. And the cut was not chosen from the data here; in real data the bend is rarely so neat. The curved codings capture the shape without a step.</p>
<p><b>(d)</b> The differences between the curved codings are small (12.0 to 13.3), well within chance. A 3-knot spline (2 df) is a sensible choice to fix in advance: it allows the expected bend, has calm tails, and costs only 1 df more than a line. With the other 14 df, the total is 16 df and the EPV is 201 / 16 = 12.6 (a straight line would give 15 df and 13.4; 4 knots 17 df and 11.8). The 4-knot spline gains only 0.7 for one more df.</p>`
    },
    {
      id: 't5',
      title: 'Flexible codings in a small sample',
      level: 'Apply',
      scenario: `<p>Use the coding explorer in this case. A small satellite clinic will have only about 200 women. Set the random subsample size to 200 (the subsample then has 21 preterm births).</p>`,
      questions: [
        '<b>(a)</b> Record the LR χ², df and AIC for Linear, Quadratic and the splines with 3, 4 and 5 knots.',
        '<b>(b)</b> How much do the 4-knot and 5-knot splines gain over the 3-knot spline, and what do they cost?',
        '<b>(c)</b> Read from the plot the fitted risk at age 40 with the quadratic, and compare it with the full sample of 2000 (about 53%). Then compare the quadratic and the 5-knot spline at age 44.',
        '<b>(d)</b> What would you advise for coding age in a small study?'
      ],
      answer: `<p><b>(a)</b> Linear: χ² 0.4, 1 df, AIC 137.9. Quadratic: 18.1, 2 df, 122.3. Spline 3 knots: 18.1, 2 df, 122.3. Spline 4 knots: 18.3, 3 df, 124.1. Spline 5 knots: 18.3, 4 df, 126.1.</p>
<p><b>(b)</b> They gain only 0.2 in χ² but cost 1 and 2 more df, so the AIC rises by about 2 for each extra df (122.3 to 124.1 to 126.1). With 21 events the extra flexibility is pure cost: at 4 df, age alone uses 21 / 4 = about 5 events per df.</p>
<p><b>(c)</b> With 200 women the quadratic gives about 78% at age 40, against about 53% in the full data: with few events, the tails of the curve are very uncertain. At age 44 the quadratic climbs to about 98%, while the 5-knot spline, which is forced to be straight in the log odds beyond its outer knot, gives about 89%. Polynomial tails swing more; spline tails are calmer.</p>
<p><b>(d)</b> Use a simple form fixed in advance, such as a 3-knot spline or a quadratic (2 df), not 4 or 5 knots. Keep the total df within the events available, and be cautious about predictions at the extremes of age, where there are few women.</p>`
    },
    {
      id: 't6',
      title: 'Clean and rescale booking haemoglobin',
      level: 'Apply',
      scenario: `<p>ptb_dev (synthetic). In women with a recorded Hb, Q1 = 10.0 and Q3 = 11.8 g/dL, and the standard deviation is 1.25 g/dL. Range checks flag three entries: 19.5, 4.3 and 0.0 g/dL. In a model with Hb as a linear term, its coefficient is −0.206 per g/dL.</p>`,
      questions: [
        '<b>(a)</b> Calculate the IQR and the lower and upper fences. Which of the three entries are outliers?',
        '<b>(b)</b> Say what you would do with each entry, and why.',
        '<b>(c)</b> Give the odds ratio per 1 g/dL higher, per 1 g/dL lower, per 2 g/dL higher, per IQR and per SD.',
        '<b>(d)</b> Which of these would you report to clinicians, and does the choice change any woman\'s predicted risk?'
      ],
      answer: `<p><b>(a)</b> IQR = 11.8 − 10.0 = 1.8. Lower fence = 10.0 − 3 × 1.8 = 4.6. Upper fence = 11.8 + 5.4 = 17.2. All three entries are outside the fences.</p>
<p><b>(b)</b> <b>19.5:</b> check the register; a likely typing error for 9.5. Correct it if the source confirms; if not, it is implausible in pregnancy, so set it to missing. <b>4.3:</b> possible in very severe anaemia. Check the record; if correct, keep the woman and limit the value's pull by truncation, for example at 5.0 g/dL, a limit chosen from the distribution (about 0.5% to 1% of values at the end), not from the outcome. <b>0.0:</b> impossible; most likely a blank entered as zero. Set it to missing and handle it with the missing-data methods of Module 5. In no case delete the woman.</p>
<p><b>(c)</b> Per 1 g/dL higher: e<sup>−0.206</sup> = 0.814. Per 1 g/dL lower: e<sup>0.206</sup> = 1.229. Per 2 g/dL higher: e<sup>−0.412</sup> = 0.662 (= 0.814²). Per IQR: 1.8 × (−0.206) = −0.371, e<sup>−0.371</sup> = 0.690. Per SD: 1.25 × (−0.206) = −0.258, e<sup>−0.258</sup> = 0.773.</p>
<p><b>(d)</b> "Each 1 g/dL lower Hb raises the odds of preterm birth by about 23%" (OR 1.23), or the OR per 2 g/dL, are easy for clinicians. The OR per IQR is useful for comparing predictors. All describe the same model: rescaling changes the unit, not the predictions or the p-value.</p>`
    },
    {
      id: 't7',
      title: 'Critique the predictor coding in a preterm study',
      level: 'Evaluate',
      scenario: `<p>Illustrative (synthetic). A district hospital study develops a preterm model in 600 women (78 preterm). The methods say: "Maternal age was dichotomised at 35 years because this gave the smallest p-value among cut-points from 18 to 40. Haemoglobin was categorised as below 11 g/dL or 11 and above. BMI was grouped into quartiles. Parity was grouped as 0, 1, 2, 3 and more than 3, and categories with similar preterm rates were merged. Antenatal visits were entered as 0, 1 to 3, and 4 or more. One woman with a recorded Hb of 19.5 g/dL was deleted. Odds ratios for the birth weight of the previous baby are given per gram."</p>`,
      questions: [
        '<b>(a)</b> Identify every coding problem and the principle it breaks.',
        '<b>(b)</b> Which problem is the most serious for the validity of the model?',
        '<b>(c)</b> Propose a better coding for each predictor.'
      ],
      answer: `<ol>
<li><b>Age cut chosen by the p-value.</b> A data-driven cut exaggerates the effect and will not be repeated. Age risk is U-shaped, so any single cut misses one end, and the step treats 34 and 36 as very different and 20 and 34 as the same.</li>
<li><b>Hb split at 11 g/dL.</b> A clinical threshold, but women with Hb 6 and 10.9 get the same risk. Dichotomising loses information; the book calls it a bad idea for a prediction model.</li>
<li><b>BMI in quartiles.</b> Still a step function, with borders set by this sample, and information is lost (book example: blood pressure R² 2.4% in categories against 4.8% continuous). Quartiles are for illustration only.</li>
<li><b>Parity merged by preterm rates.</b> Merging guided by the outcome makes the model optimistic. Merge by frequency or meaning, blind to the outcome.</li>
<li><b>Antenatal visits in three groups.</b> An ordered count; a linear term (with a square term as a check) usually keeps almost all the information.</li>
<li><b>Hb of 19.5 deleted.</b> Check the record first (perhaps 9.5), judge plausibility, and set to missing if impossible, so that the woman's other data are kept.</li>
<li><b>OR per gram.</b> A one-gram step gives an OR indistinguishable from 1. Report per 500 g, per SD or per IQR.</li>
</ol>
<div class="callout warn"><b>(b) Critical</b><p>The age cut chosen by the smallest p-value, and the parity groups merged by preterm rates, both use the outcome in the same data used to judge the model. With 78 events the optimism is large and cannot be measured unless the whole search is repeated in each bootstrap sample.</p></div>
<p><b>(c)</b> Age: continuous with a quadratic or a 3-knot spline (2 df), fixed in advance. Hb: continuous, linear or a 3-knot spline. BMI: continuous, linear or 3 knots. Parity: 0, 1, 2, 3 or more, merged on frequency, or a linear term. Antenatal visits: a linear count, truncated at a sensible upper value. Hb of 19.5: check, correct or set to missing and impute. Previous birth weight: per 500 g. With 78 events, keep the total df modest (EPV, Module 2).</p>`
    }
  ]
});
