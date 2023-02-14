import { ExcelColumnList } from 'src/common/interfaces';
import { UtilsService } from 'src/common/providers';

const utilsService = new UtilsService();

export const EXCEL_COLUMN_LIST: ExcelColumnList[] = [
  { label: 'serialNum', key: 'contentsSerialNum' },
  { label: 'imagePath', key: 'imagePath' },
  { label: 'audioFilePath', key: 'audioFilePath' },
  { label: 'level', key: 'level' },
  { label: 'title', key: 'title' },
  { label: 'content', key: 'content' },
];