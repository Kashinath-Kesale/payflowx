/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';


@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'User login', description: 'Authenticates a user and returns a JWT access token.' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // TEST PROTECTED ROUTE
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current user profile', description: 'Returns the ID of the currently authenticated user.' })
  getMe(@CurrentUser() user: { userId: string }) {
    return {
      userId: user.userId,
    };
  }
}
