import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
  ) {}

  @Post('run')
  async runWorkflow(
    @Body() body: { ticket: string },
  ) {
    return this.workflowService.runWorkflow(
      body.ticket,
    );
  }
}