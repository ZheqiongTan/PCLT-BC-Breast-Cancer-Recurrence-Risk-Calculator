(function (root) {
  'use strict';
  const categories = { 'Histological grade': [1, 2, 3], TNM: [0, 1, 2, 3], LVI: [0, 1] };
  function validate(input, model) {
    const values = {}, errors = [], outside = [];
    for (const field of model.fields) {
      const raw = input[field];
      if (raw === null || raw === undefined || (typeof raw === 'string' && raw.trim() === '')) {
        errors.push({ field, code: 'required' }); continue;
      }
      if (typeof raw !== 'number' && typeof raw !== 'string') {
        errors.push({ field, code: 'invalid' }); continue;
      }
      const value = Number(raw);
      if (!Number.isFinite(value) || value < 0 || (categories[field] && !categories[field].includes(value))) {
        errors.push({ field, code: 'invalid' }); continue;
      }
      values[field] = value;
      const range = model.ranges[field];
      if (value < range[0] || value > range[1]) outside.push(field);
    }
    return { values, errors, outside };
  }
  function predict(input, model = root.RECURRENCE_MODEL) {
    const checked = validate(input, model);
    if (checked.errors.length) return { ...checked, probabilities: null };
    // Match the frozen Python preprocessing and sklearn's float32 tree input.
    const z = model.features.map((f, i) => {
      let value = f.level === null ? checked.values[f.field] : Number(checked.values[f.field] === f.level);
      if (f.log) value = Math.log1p(value);
      return Math.fround((value - model.mean[i]) / model.scale[i]);
    });
    let p3 = 0, p5 = 0;
    for (const tree of model.trees) {
      let node = 0;
      while (tree.left[node] >= 0) {
        node = z[tree.feature[node]] <= tree.threshold[node] ? tree.left[node] : tree.right[node];
      }
      p3 += tree.p3[node]; p5 += tree.p5[node];
    }
    return { ...checked, probabilities: [p3 / model.trees.length, p5 / model.trees.length] };
  }
  root.RecurrenceEngine = Object.freeze({ validate, predict });
  if (typeof module !== 'undefined') module.exports = root.RecurrenceEngine;
})(globalThis);
