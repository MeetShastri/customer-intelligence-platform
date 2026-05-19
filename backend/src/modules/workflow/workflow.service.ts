import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class WorkflowService {

  async testAIService() {
    console.log('Hello');
    

    const response = await axios.get(
      'http://localhost:8000/health',
    );

    return response.data;
  }
}