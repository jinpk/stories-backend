import { Test, TestingModule } from '@nestjs/testing';
import { LeveltestController } from './leveltest.controller';

describe('LeveltestController', () => {
  let controller: LeveltestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeveltestController],
    }).compile();

    controller = module.get<LeveltestController>(LeveltestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
