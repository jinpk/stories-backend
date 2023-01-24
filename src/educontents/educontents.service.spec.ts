import { Test, TestingModule } from '@nestjs/testing';
import { EducontentsService } from './educontents.service';

describe('EducontentsService', () => {
  let service: EducontentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EducontentsService],
    }).compile();

    service = module.get<EducontentsService>(EducontentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
