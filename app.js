(() => {
  'use strict';
  const form = document.getElementById('calculator');
  const messages = {
  "research": "RESEARCH TOOL",
  "title": "Breast cancer recurrence risk",
  "subtitle": "Enter 7 predictors to estimate the probability of recurrence within 3 and 5 years.",
  "privacy": "Calculated in your browser. Your inputs are not uploaded or saved.",
  "unitPending": "Local preview: laboratory units await confirmation by the researcher. Use only values from the model dataset; do not enter values in other units.",
  "inputs": "Model inputs",
  "required": "All fields required",
  "pathology": "Clinicopathological features",
  "laboratory": "Laboratory markers",
  "lviHint": "LVI: lymphovascular invasion in the primary breast tumor.",
  "grade": "Histological grade",
  "tnm": "TNM stage",
  "lvi": "LVI",
  "choose": "Select",
  "stage0": "Stage 0",
  "stage1": "Stage I",
  "stage2": "Stage II",
  "stage3": "Stage III",
  "absent": "Absent (0)",
  "present": "Present (1)",
  "fib": "Fibrinogen",
  "ca153": "Cancer antigen 15-3",
  "tg": "Triglycerides",
  "nefa": "Free fatty acids",
  "labHint": "Use the model’s laboratory units. Do not enter 0 for a missing value.",
  "calculate": "Calculate risk",
  "clear": "Clear",
  "estimates": "MODEL ESTIMATES",
  "results": "Recurrence probability",
  "empty": "Complete the inputs to see your model estimates here.",
  "year3": "Within 3 years",
  "year5": "Within 5 years",
  "probability": "Predicted recurrence",
  "interpretation": "These are model estimates, not a certainty that recurrence will or will not occur.",
  "disclaimer": "For research and model demonstration only. Not a substitute for clinical assessment or a standalone basis for care.",
  "about": "About the model & intended use",
  "aboutText": "This tool uses a random survival forest model comprising 200 trees to estimate breast cancer recurrence probabilities at 36 and 60 months. The model was developed using a research cohort of Chinese women with breast cancer. Inputs are limited to TNM stages 0–III. Pathological characteristics and laboratory parameters were assessed before the initiation of anticancer treatment. Predictions are intended for research use and should be interpreted in the context of the study methods, limitations, and target population.",
  "rangesIntro": "The observed laboratory ranges in the development training set are listed below. These describe data coverage, not laboratory reference intervals. Values outside these ranges trigger a notice and are never silently clipped.",
  "privacyHeading": "Data & privacy",
  "privacyText": "Do not enter names, hospital identifiers, or other identifying information. Values are used only for calculations in the current page. They are not uploaded, written to a database or local storage, or included in the URL. No analytics scripts are used. The hosting provider may keep standard web access logs; these do not contain the predictor values entered here.",
  "requiredError": "Enter or select a value",
  "invalidError": "Enter a valid non-negative number",
  "selectionError": "Select a valid category",
  "formError": "Complete and check the highlighted inputs.",
  "success": "Calculated from your current inputs. Rounded to one decimal place.",
  "changed": "Inputs changed. Calculate again to update your estimates.",
  "warning": "Outside the training data range: {fields}. Reliability for these inputs has not been established; interpret with caution.",
  "pending": "Unit pending",
  "error": "The model could not be loaded or evaluated. Reopen the complete website folder.",
  "documentTitle": "PCLT-BC · Breast Cancer Recurrence Risk Calculator"
};
  let state = 'empty', last = null;
  const controls = Array.from(form.elements).filter(e => e.name);
  const message = document.getElementById('form-message');
  const status = document.getElementById('result-status');
  const fieldLabels = { CA153: 'CA15-3', 'Histological grade': 'grade', TNM: 'tnm', LVI: 'lvi' };
  function t(key) { return messages[key]; }
  function clearErrors() {
    message.textContent = '';
    for (const el of controls) { el.removeAttribute('aria-invalid'); document.getElementById(el.id + '-error').textContent = ''; }
  }
  function showErrors(errors) {
    clearErrors();
    if (!errors.length) return;
    message.textContent = t('formError');
    for (const item of errors) {
      const el = controls.find(e => e.name === item.field);
      el.setAttribute('aria-invalid', 'true');
      document.getElementById(el.id + '-error').textContent = t(item.code === 'required' ? 'requiredError' : el.tagName === 'SELECT' ? 'selectionError' : 'invalidError');
    }
  }
  function renderResult() {
    status.textContent = t(state === 'calculated' ? 'success' : state === 'error' ? 'error' : state);
    const available = state === 'calculated' && last && last.probabilities;
    document.querySelector('.results-panel').classList.toggle('ready', Boolean(available));
    [3, 5].forEach((year, i) => {
      document.getElementById('p' + year).textContent = available ? (100 * last.probabilities[i]).toFixed(1) : '—';
      document.getElementById('bar' + year).style.width = available ? (100 * last.probabilities[i]) + '%' : '0%';
    });
    const warning = document.getElementById('range-warning');
    warning.hidden = !(available && last.outside.length);
    if (!warning.hidden) warning.textContent = t('warning').replace('{fields}', last.outside.map(f => fieldLabels[f] || f).join(', '));
  }
  function translate() {
    document.documentElement.lang = 'en'; document.title = t('documentTitle');
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-unit]').forEach(el => {
      el.textContent = CALCULATOR_CONFIG.unitsConfirmed ? CALCULATOR_CONFIG.units[el.dataset.unit] : t('pending');
      el.classList.toggle('pending', !CALCULATOR_CONFIG.unitsConfirmed);
    });
    document.querySelector('.information').setAttribute('aria-label', 'Model information');
    if (last && last.errors.length) showErrors(last.errors);
    renderResult();
  }
  form.addEventListener('submit', event => {
    event.preventDefault(); clearErrors();
    const input = Object.fromEntries(controls.map(el => [el.name, el.value]));
    try {
      last = RecurrenceEngine.predict(input);
      if (last.errors.length) {
        state = 'empty'; showErrors(last.errors); renderResult();
        controls.find(el => el.name === last.errors[0].field).focus(); return;
      }
      state = 'calculated'; renderResult();
    } catch (_) { state = 'error'; last = null; renderResult(); }
  });
  form.addEventListener('input', () => {
    clearErrors();
    if (state === 'calculated' || state === 'changed') state = 'changed';
    last = null; renderResult();
  });
  form.addEventListener('reset', () => { state = 'empty'; last = null; clearErrors(); renderResult(); });
  window.addEventListener('pageshow', () => { form.reset(); });
  translate();
})();
