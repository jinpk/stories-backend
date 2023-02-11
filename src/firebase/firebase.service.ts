import { Injectable } from '@nestjs/common';
import { DynamicLinkQuery } from './interfaces';

@Injectable()
export class FirebaseService {
  async generateDynamicLink(params: DynamicLinkQuery): Promise<string> {
    return '';
  }
}
