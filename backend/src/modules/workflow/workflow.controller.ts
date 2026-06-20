import {
  Body,
  Controller,
  Get,
  Param,
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

  @Get('status/:jobId')
  async getStatus(@Param('jobId') jobId: string) {
    const status = await this.workflowService.getJobStatus(jobId);
    return { jobId, status };
  }
}