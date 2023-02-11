import { Injectable } from '@nestjs/common';
import { ExcelColumnList } from '../interfaces';
import * as dayjs from 'dayjs';
import * as xlsx from 'xlsx';

@Injectable()
export class CommonExcelService {
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
            case 'enum':
              obj[nKey] = z.enumLabel[val];
              break;
            case 'date':
              if (val) {
                obj[nKey] = dayjs(val).format('YYYY-MM-DD');
              }
              break;
            case 'date-time':
              if (val) {
                obj[nKey] = dayjs(val).format('YYYY-MM-DD HH:mm');
              }
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
