import { ExcelColumnList } from 'src/common/interfaces';
import { UtilsService } from 'src/common/providers';

const utilsService = new UtilsService();

export const EXCEL_COLUMN_LIST: ExcelColumnList[] = [
  { label: 'audio_file_path', key: 'audioFilePath' },
  { label: 'vocab', key: 'vocab' },
  { label: 'meaning_en', key: 'meaningEn' },
  { label: 'value', key: 'value' },
  { label: 'conn_sentence', key: 'connSentence' },
  { label: 'preview vocabulary', key: 'previewVocabulary' },
  { label: 'level', key: 'level' },
  { label: 'conn_story', key: 'connStory' },
];