// src\surfspot\controllers\surfspot.controller.ts

import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { SurfSpotService } from 'shakaapi/src/surfspot/services/surfspot.service';
import { SurfSpotDto } from 'shakaapi/src/surfspot/dtos/surfspot.dto';
import { ErrorResponseDto } from 'shakaapi/src/swagger/error-response.dto';
import {
  CREATE_SURFSPOT_BODY_EXAMPLE,
  SURFSPOT_EXAMPLE,
  SURFSPOT_LIST_EXAMPLE,
  ERROR_404_EXAMPLE,
} from 'shakaapi/src/swagger/examples';
import { jsonArray, jsonSingle } from 'shakaapi/src/swagger/response-helpers';
import { CreateSurfSpotDto } from 'shakaapi/src/surfspot/dtos/create-surfspot.dto';

@ApiTags('surf-spots')
@ApiExtraModels(SurfSpotDto, CreateSurfSpotDto)
@Controller('surfspot')
export class SurfSpotController {
  constructor(private readonly surfSpotService: SurfSpotService) {}

  @Post()
  @ApiOperation({ summary: 'Create a surf spot' })
  @ApiBody({
    description: 'Surf spot payload',
    schema: { $ref: '#/components/schemas/CreateSurfSpotDto' },
    examples: { sample: { value: CREATE_SURFSPOT_BODY_EXAMPLE } },
  })
  @ApiCreatedResponse({
    description: 'Created surf spot',
    content: jsonSingle(SurfSpotDto, SURFSPOT_EXAMPLE),
  })
  async create(@Body() body: CreateSurfSpotDto): Promise<SurfSpotDto> {
    return this.surfSpotService.create(body);
  }

  @Get('all')
  @ApiOperation({ summary: 'List all surf spots' })
  @ApiOkResponse({
    description: 'Array of surf spots.',
    content: jsonArray(SurfSpotDto, SURFSPOT_LIST_EXAMPLE),
  })
  async getAll(): Promise<SurfSpotDto[]> {
    return this.surfSpotService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a surf spot by id' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({
    description: 'The surf spot.',
    content: jsonSingle(SurfSpotDto, SURFSPOT_EXAMPLE),
  })
  @ApiNotFoundResponse({
    description: 'Surf spot not found',
    content: {
      'application/json': {
        schema: { $ref: getSchemaPath(ErrorResponseDto) },
        examples: { sample: { value: ERROR_404_EXAMPLE } },
      },
    },
  })
  async getById(@Param('id', ParseIntPipe) id: string): Promise<SurfSpotDto> {
    const spot = await this.surfSpotService.findById(Number(id));
    if (!spot) throw new NotFoundException();
    return spot;
  }
}
