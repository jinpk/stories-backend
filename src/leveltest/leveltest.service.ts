import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  now,
  FilterQuery,
  Model,
  ProjectionFields,
} from 'mongoose';
import { PagingResDto } from 'src/common/dto/response.dto';
import { LevelTest, LevelTestDocument } from './schemas/leveltest.schema';
import { LevelTestDto, LevelTestResultDto } from './dto/leveltest.dto';
import { UpdateLevelTestDto } from './dto/update-leveltest.dto';
import { GetPagingLevelTestDto } from './dto/get-leveltest.dto';
import { UtilsService } from 'src/common/providers';
import { EdustatusService } from '../edustatus/edustatus.service'

/*
  레벨테스트 조회,제출,관리 서비스 함수
  -관리자 레벨테스트 등록/수정/삭제
  -사용자 레벨테스트 조회/제출
*/
@Injectable()
export class LeveltestService {
  constructor(
    private utilsService: UtilsService,
    private edustatusService: EdustatusService,
    @InjectModel(LevelTest.name) private leveltestModel: Model<LevelTestDocument>,
  ) {}

  /*
  * 사용자 레벨테스트 결과 제출
  * @params:
  *   userId: string    user id
  *   body: {
  *     step: string                스텝
  *     lastStepCorrect: number     가장 스텝에서 맞춘 정답 갯수
  *   }
  * @return: {
  *   id: string,
  *   userId: string,
  *   firstLevel: string,           사용자 최초 테스트 레벨
  *   latestLevel: string,          사용자 최고 테스트 레벨
  *   selectedLevel: string,        사용자 마지막 선택 레벨
  * }
  */
  async postLevelTest(user_id: string, body: LevelTestResultDto) {
    const status = await this.edustatusService.updateEduStatus(user_id, body)

    let dto = this.edustatusService._edustatusToDto(status)
    return dto
  }

  /*
  * 레벨테스트 문제 삭제
  * @params:  id: string    레벨테스트 id
  * @return: string         레벨테스트 id
  */
  async deleteLevelTest(id: string) {
    let result = await this.leveltestModel.findByIdAndDelete(id);
    return result.id.toString()
  }

  /*
  * 레벨테스트 문제 업데이트
  * @params:
  *   id: string,             레벨테스트 id
  *   body: {
  *     step: string,           스텝
  *     sequence: string,       순서
  *     text: string,           레벨테스트 본문
  *     answers: string[],      보기항목들
  *     correct_answer: number  보기항목들 중 정답이 되는 index
  *   }
  * @return: string           레벨테스트 id
  */  
  async updateLevelTestById(id: string, body: UpdateLevelTestDto) {
    const leveltest = await this.leveltestModel.findByIdAndUpdate(id, { 
      $set: {
        step: body.step,
        sequence: body.sequence,
        text: body.text,
        answers: body.answers,
        correct_answer: body.correct_answer,
        updatedAt: now()}
    });

    return leveltest._id.toString()
  }

  /*
  * 레벨테스트 DB 존재유무
  * @params:  id: string    레벨테스트 id
  * @return: boolean
  */    
  async existLevelTestById(id: string): Promise<boolean> {
    const leveltest = await this.leveltestModel.findById(id);
    if (!leveltest) {
      return false;
    }
    return true;
  }

  /*
  * 레벨테스트 문제 생성
  * @params:
  *   body: {
  *     step: string,           스텝
  *     sequence: string,       순서
  *     text: string,           레벨테스트 본문
  *     answers: string[],      보기항목들
  *     correct_answer: number  보기항목들 중 정답이 되는 index
  *   }
  * @return: string           레벨테스트 id
  */  
  async createLevelTest(body: LevelTestDto): Promise<string> {
    var levelTest: LevelTest = new LevelTest()
    levelTest = {
      step: body.step,
      sequence: body.sequence,
      text: body.text,
      answers: body.answers,
      correct_answer: body.correct_answer,
    }
    const result = await new this.leveltestModel(levelTest).save()
    return result._id.toString()
  }

  /*
  * 레벨테스트id로 개별 레벨테스트 문제 조회
  * @params:  id: string    레벨테스트 id
  * @return: {
  *    "_id": string,           레벨테스트 id
  *   "step": string,           스텝
  *   "sequence": string,      순서
  *   "text": string,           레벨테스트 본문
  *   "answers": string[],      보기항목들
  *   "correct_answer": number  보기항목들 중 정답이 되는 index
  *  }
  */  
  async getLevelTestById(id: string): Promise<LevelTestDto> {
    const leveltest = await this.leveltestModel.findById(id);
    return leveltest;
  }

  /*
  * step 별 레벨테스트 문제 목록 조회
  * @params:  page number,    pagination 페이지
  *           limit number,   pagination 리밋
  *           step string     레벨테스트 스텝
  * @return: {
  *   total: number             step에 속한 테스트 갯수
  *   data: [
  *     {
  *       "_id": string,            레벨테스트 id
  *       "step": string,           스텝
  *       "sequence": string,       순서
  *       "text": string,           레벨테스트 본문
  *       "answers": string[],      보기항목들
  *       "correct_answer": number  보기항목들 중 정답이 되는 index
  *      },
  *    ]
  *  }
  */  
  async getPagingLevelTestsByLevel(
    query: GetPagingLevelTestDto,
  ): Promise<PagingResDto<LevelTestDto> | Buffer> {
    var filter: FilterQuery<LevelTestDocument> = {}
    if (!query.step) {
    } else {
      filter = {
        step: { $eq: query.step },
      };
    }

    const projection: ProjectionFields<LevelTestDto> = {
      _id: 1,
      step: 1,
      sequence: 1,
      text: 1,
      answers: 1,
      correct_answer: 1,
    };

    const cursor = await this.leveltestModel.aggregate([
      { $match: filter },
      { $project: projection },
      { $sort: { createdAt: -1 } },
      this.utilsService.getCommonMongooseFacet(query),
    ]);

    const metdata = cursor[0].metadata;
    const data = cursor[0].data;

    return {
      total: metdata[0]?.total || 0,
      data: data,
    };
  }
}