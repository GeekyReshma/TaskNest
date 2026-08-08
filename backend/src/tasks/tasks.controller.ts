import { Controller, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, ToggleSubtaskDto } from './tasks.dto';

@Controller('api')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('tasks')
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Patch('tasks/:id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete('tasks/:id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Patch('subtasks/:id')
  toggleSubtask(@Param('id') id: string, @Body() toggleSubtaskDto: ToggleSubtaskDto) {
    return this.tasksService.toggleSubtask(id, toggleSubtaskDto);
  }
}
