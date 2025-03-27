import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  generateCookie(): string {
    return uuidv4();  // Generate a new UUID
  }
}
