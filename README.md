# PCLT-BC: Breast Cancer Recurrence Risk Calculator

A random survival forest calculator integrating pathology, coagulation, lipid profiles, and tumor markers to predict 3- and 5-year breast cancer recurrence risk. For research use only.

## Predictors

| Predictor | Input |
| --- | --- |
| Histological grade | I, II, or III |
| TNM stage | 0, I, II, or III |
| Lymphovascular invasion (LVI) | Absent (0) or present (1) |
| Fibrinogen (FIB) | g/L |
| Cancer antigen 15-3 (CA15-3) | U/mL |
| Triglycerides (TG) | mmol/L |
| Non-esterified fatty acids (NEFA) | mmol/L |

## Model and calculation

The calculator uses the frozen A46 random survival forest (200 trees). It preserves the original feature encoding, log transformations, standardization, tree traversal, and 36- and 60-month survival estimates. No model fitting takes place on the website.

The browser implementation was compared against the original model for 1,231 study records and 2,000 additional simulated inputs. The maximum absolute probability difference was below 1e-12. The study records and verification inputs are not included in this repository.

All seven inputs are required. Values outside the observed training ranges trigger a notice; they are not silently clipped or imputed.

## Privacy

The calculation runs entirely in the visitor's browser. No names or patient identifiers are requested. Predictor values are not sent to a server, stored in a database or local storage, or added to the URL. There are no analytics scripts. The hosting platform may retain ordinary web access logs.

## Intended use

This is a research and model-demonstration tool, not a substitute for clinical assessment or a standalone basis for medical decisions. Model development used imputed data. Predictions should be interpreted in the context of the study population, methods, and limitations.

## Hosting

Static HTML, CSS, and JavaScript. No database, server-side inference service, API key, or paid calculation API is required. GitHub Pages can serve the files from the root of the main branch.

Model export version: A46-RSF-20261109.
