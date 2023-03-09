import { ExcelColumnList } from 'src/common/interfaces';

export const EXCEL_COLUMN_LIST: ExcelColumnList[] = [
  { label: '닉네임', key: 'nickname' },
  { label: '이메일', key: 'email' },
  { label: '국가코드', key: 'countryCode' },
  { label: '뉴스레터 구독', key: 'newsletter', format: 'boolean' },
  { label: 'TTMIK 멤버십', key: 'ttmik', format: 'boolean' },
  { label: '가입 날짜', key: 'createdAt', format: 'date-time' },
];
