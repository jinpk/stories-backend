export interface ExcelColumnList {
  label: string;
  key: string;
  format?:
    | 'date'
    | 'date-time'
    | 'number'
    | 'phone'
    | 'enum'
    | 'render'
    | 'boolean';
  enumLabel?: { [s: string]: string };
  render?: (o: any) => string;
}
