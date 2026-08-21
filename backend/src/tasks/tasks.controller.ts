import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  ToggleSubtaskDto,
  MoveTaskDto,
} from './tasks.dto';
import { GuestAuthGuard } from '../auth/guest-auth.guard';
import { CurrentGuest } from '../auth/current-guest.decorator';
import type { GuestPayload } from '../auth/current-guest.decorator';

@Controller('api')
@UseGuards(GuestAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  create(@Body() createTaskDto: CreateTaskDto, @CurrentGuest() guest: GuestPayload) {
    return this.tasksService.create(createTaskDto, guest.id);
  }

  @Patch('tasks/:id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.tasksService.update(id, updateTaskDto, guest.id);
  }

  @Patch('tasks/:id/move')
  move(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() moveTaskDto: MoveTaskDto,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.tasksService.move(id, moveTaskDto, guest.id);
  }

  @Delete('tasks/:id')
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.tasksService.remove(id, guest.id);
  }

  @Patch('subtasks/:id')
  toggleSubtask(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() toggleSubtaskDto: ToggleSubtaskDto,
    @CurrentGuest() guest: GuestPayload,
  ) {
    return this.tasksService.toggleSubtask(id, toggleSubtaskDto, guest.id);
  }
}
