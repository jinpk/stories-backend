import { ExcelColumnList } from 'src/common/interfaces';
import { NotificationContextsLabel } from './enums';

export const EXCEL_COLUMN_LIST: ExcelColumnList[] = [
  { label: '이미지(S3 PATH)', key: 'imagePath' },
  {
    label: '알림 종류',
    key: 'context',
    format: 'enum',
    enumLabel: NotificationContextsLabel,
  },
  { label: '등록 날짜', key: 'createdAt', format: 'date-time' },
  { label: '발송 날짜', key: 'sendAt', format: 'date-time' },
  { label: '알림 제목', key: 'title' },
];
