/**
 * Locale-Aware Report Formatters
 * 
 * This module provides formatting functions for currency, numbers, dates, and other
 * values that need to adapt based on the report language (English/Spanish).
 */

/**
 * Report Formatters interface
 */
export interface ReportFormatters {
  currency: (value: number) => string;
  number: (value: number, decimals?: number) => string;
  percent: (value: number, decimals?: number) => string;
  date: (date: Date) => string;
  monthYear: (date: Date) => string;
  month: (monthIndex: number) => string;
}

/**
 * Create locale-aware formatters based on language
 * 
 * @param language - Report language ('en' or 'es')
 * @returns Object containing all formatting functions
 */
export function createReportFormatters(language: 'en' | 'es'): ReportFormatters {
  // Determine locale based on language
  // Note: Using 'es-US' for Spanish to maintain USD currency format
  // but get Spanish thousand/decimal separators
  const locale = language === 'es' ? 'es-US' : 'en-US';
  
  return {
    /**
     * Format currency values (always USD)
     * @example formatters.currency(1250000) → "$1,250,000" (en) or "$1.250.000" (es)
     */
    currency: (value: number): string => {
      // Round to nearest dollar and format
      return `$${Math.round(value).toLocaleString(locale)}`;
    },
    
    /**
     * Format numeric values with specified decimal places
     * @example formatters.number(1234.5, 1) → "1,234.5" (en) or "1.234,5" (es)
     */
    number: (value: number, decimals: number = 1): string => {
      return value.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    
    /**
     * Format percentage values
     * @example formatters.percent(0.25, 1) → "25.0%" (en) or "25,0%" (es)
     */
    percent: (value: number, decimals: number = 1): string => {
      const percentValue = value * 100;
      return `${percentValue.toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}%`;
    },
    
    /**
     * Format full date
     * @example formatters.date(new Date('2025-11-09')) → "11/9/2025" (en) or "9/11/2025" (es)
     */
    date: (date: Date): string => {
      return date.toLocaleDateString(locale);
    },
    
    /**
     * Format month and year for version strings
     * @example formatters.monthYear(new Date('2025-11-09')) → "November 2025" (en) or "Noviembre 2025" (es)
     */
    monthYear: (date: Date): string => {
      const formatter = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
      return formatter.format(date);
    },
    
    /**
     * Format standalone month name
     * @example formatters.month(0) → "January" (en) or "Enero" (es)
     */
    month: (monthIndex: number): string => {
      // Create a date with the given month (year and day don't matter)
      const date = new Date(2000, monthIndex, 1);
      const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
      return formatter.format(date);
    },
  };
}
