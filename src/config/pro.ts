/**
 * Pro Configuration
 *
 * PRO_ENABLED = false → sabhi users ko sab kuch free milega
 * PRO_ENABLED = true  → free limits enforce hongi, pro users ko sab milega
 *
 * Jab launch karna ho Pro: sirf PRO_ENABLED = true karo
 */

export const PRO_ENABLED = false;

export const FREE_LIMITS = {
  contacts: 50,
  transactions: 200,
  reportMonths: 3,
  themes: ['default', 'minimal'] as string[],
};

export const PRO_FEATURES = {
  unlimitedContacts: 'unlimitedContacts',
  unlimitedTransactions: 'unlimitedTransactions',
  allThemes: 'allThemes',
  fullReports: 'fullReports',
  pdfExport: 'pdfExport',
  emiCalculator: 'emiCalculator',
  multipleBusinesses: 'multipleBusinesses',
} as const;

export type ProFeature = keyof typeof PRO_FEATURES;
