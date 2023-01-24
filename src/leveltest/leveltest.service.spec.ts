import { Test, TestingModule } from '@nestjs/testing';
import { LeveltestService } from './leveltest.service';

describe('LeveltestService', () => {
  let service: LeveltestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeveltestService],
    }).compile();

    service = module.get<LeveltestService>(LeveltestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
