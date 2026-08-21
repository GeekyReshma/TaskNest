import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './boards.dto';
import { GuestAuthGuard } from '../auth/guest-auth.guard';
import { CurrentGuest } from '../auth/current-guest.decorator';
import type { GuestPayload } from '../auth/current-guest.decorator';

@Controller('api/boards')
@UseGuards(GuestAuthGuard)
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Get()
  findAll(@CurrentGuest() guest: GuestPayload) {
    return this.boardsService.findAll(guest.id);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.boardsService.findOne(id, guest.id);
  }

  @Post()
  create(@Body() createBoardDto: CreateBoardDto, @CurrentGuest() guest: GuestPayload) {
    return this.boardsService.create(createBoardDto, guest.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateBoardDto: UpdateBoardDto,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.boardsService.update(id, updateBoardDto, guest.id);
  }

  @Delete(':id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.boardsService.remove(id, guest.id);
  }
}
