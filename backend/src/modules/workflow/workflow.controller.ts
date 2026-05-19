import { Controller, Get } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('workflow')
export class WorkflowController {

  constructor(
    private readonly workflowService: WorkflowService,
  ) { }

  @Get('test-ai')
  async testAI() {
    return this.workflowService.testAIService();
  }
}