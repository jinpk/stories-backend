import { ExcelColumnList } from 'src/common/interfaces';
import { UtilsService } from 'src/common/providers';
import { CouponTypesLabel } from './enums';

const utilsService = new UtilsService();

export const EXCEL_COLUMN_LIST: ExcelColumnList[] = [
  { label: '쿠폰명', key: 'name' },
  { label: '쿠폰설명', key: 'description' },
  { label: '할인ID', key: 'storeId' },
  {
    label: '할인방식',
    key: '',
    format: 'render',
    render: (x) => x.value + CouponTypesLabel[x.type],
  },
  {
    label: '유효기간',
    key: '',
    format: 'render',
    render: (x) =>
      utilsService.formatDate(x.start) + '~' + utilsService.formatDate(x.end),
  },
  { label: '총 사용 횟수', key: '' },
];

export const EXCEL_COLUMN_LIST_SENT: ExcelColumnList[] = [
  { label: '발송 날짜', key: 'createdAt', format: 'date' },
  { label: '회원명', key: 'nickname' },
  { label: '쿠폰명', key: 'name' },
  {
    label: '할인방식',
    key: '',
    format: 'render',
    render: (x) => x.value + CouponTypesLabel[x.type],
  },
  {
    label: '유효기간',
    key: '',
    format: 'render',
    render: (x) =>
      utilsService.formatDate(x.start) + '~' + utilsService.formatDate(x.end),
  },
];
