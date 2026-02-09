/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async createUser(@Body('email') email: string, @Body('name') name: string, @Body('password') password: string) {
        return this.usersService.createUser(email, name, password);
    }

    @Get(':id')
    async getUser(@Param('id') id: string) {
        return this.usersService.findUserById(id);
    }

    @Get()
    async getAllUsers() {
        return this.usersService.findAllUsers();
    }
}
