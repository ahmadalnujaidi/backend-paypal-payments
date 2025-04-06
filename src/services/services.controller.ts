import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ServicesService } from './services.service';
import { UpdateServiceDto } from './dto/update-service.dto';
require('dotenv').config()

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  async create(req, res) {
    try {
      const url = await this.servicesService.createOrder();
      // res.redirect(url)
      console.log(url)
      return url
    } catch (error) {
      throw new Error(error);
    }
  }
  @Get('/complete-order')
  async complete(req, res) {
    try {
      await this.servicesService.capturePayment(req.query.token);
    } catch (error) {
      throw new Error(error);
    }
  }
  @Get('/cancel-order')
  async cancel(req, res) {
    try {
      res.redirect('http://localhost:3001')
    } catch (error) {
      throw new Error(error);
    }
  }
}
