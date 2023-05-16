import { Injectable } from '@nestjs/common';
import { ExcelColumnList } from '../interfaces';
import * as xlsx from 'xlsx';
import { UtilsService } from './utils.service';

@Injectable()
export class CommonExcelService {
  constructor(private utilsService: UtilsService) {}

  // 관리자 엑셀 다운로드를 위한 json > excel 공통 함수
  async listToExcelBuffer(
    columns: ExcelColumnList[],
    data: any[],
  ): Promise<Buffer> {
    const workbook = xlsx.utils.book_new();
    // 받아온 컬럼 정보로 엑셀 헤더 맵핑
    const worksheet = xlsx.utils.json_to_sheet(
      data.map((x) => {
        const obj = {};
        columns.forEach((z) => {
          const nKey = z.label;
          const val = x[z.key];

          switch (z.format) {
            case 'render':
              obj[nKey] = z.render(x);
              break;
            case 'enum':
              obj[nKey] = z.enumLabel[val];
              break;
            case 'date':
            case 'date-time':
              obj[nKey] = this.utilsService.formatDate(val, z.format);
              break;
            case 'boolean':
              obj[nKey] = val ? 'O' : 'X';
              break;
            default:
              obj[nKey] = val;
              break;
          }
        });
        return obj;
      }),
    );
    // 헤더 기본 스타일링
    worksheet['!cols'] = columns.map((x) => ({
      wch: 30,
      font: {
        color: { rgb: 'ffffff' },
      },
      fill: {
        patternType: 'solid',
        fgColor: { rgb: 'ff9900' },
        bgColor: { rgb: 'ff9900' },
      },
    }));
    xlsx.utils.book_append_sheet(workbook, worksheet, 'sheet-0');

    // 엑셀 버퍼 생성
    const xlsxBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    return xlsxBuffer;
  }
}
