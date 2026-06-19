import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common'; 
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class WorkflowService {  

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async runWorkflow(ticket: string) {
    console.log("ticket", ticket);
    
    const aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
    const response = await firstValueFrom(
      this.httpService.post(
        `${aiServiceUrl}/api/v1/run-workflow`,
        {
          ticket,
        },
      ),
    );

    return response.data;
  }

}