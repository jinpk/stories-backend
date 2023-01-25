import { Test, TestingModule } from '@nestjs/testing';
import { EducontentsController } from './educontents.controller';

describe('EducontentsController', () => {
  let controller: EducontentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EducontentsController],
    }).compile();

    controller = module.get<EducontentsController>(EducontentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
