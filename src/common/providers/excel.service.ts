import { Injectable } from '@nestjs/common';
import { ExcelColumnList } from '../interfaces';
import * as xlsx from 'xlsx';
import { UtilsService } from './utils.service';

@Injectable()
export class CommonExcelService {
  constructor(private utilsService: UtilsService) {}

  async listToExcelBuffer(
    columns: ExcelColumnList[],
    data: any[],
  ): Promise<Buffer> {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(
      data.map((x) => {
        const obj = {};
        columns.forEach((z) => {
          let nKey = z.label;
          let val = x[z.key];

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
            default:
              obj[nKey] = val;
              break;
          }
        });
        return obj;
      }),
    );
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

    const xlsxBuffer = xlsx.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
    });

    return xlsxBuffer;
  }

 
}
