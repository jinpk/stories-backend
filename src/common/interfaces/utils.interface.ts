export interface ExcelColumnList {
  label: string;
  key: string;
  format?: 'date' | 'date-time' | 'number' | 'phone' | 'enum';
  enumLabel?: { [s: string]: string };
}
