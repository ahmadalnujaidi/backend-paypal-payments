import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { ServicesService } from './services.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
require('dotenv').config()

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/pay/:id')
  async create(@Req() req, @Res() res) {
    try {
      // Get the user ID from the url
      const userId = req.params.id;
      console.log(`userid at post: ${userId}`)
      const url = await this.servicesService.createOrder(userId);
      console.log(url)
      return res.status(200).json({ url });
    } catch (error) {
      throw new Error(error);
    }
  }
  @Get('/complete-order/:id')
  async complete(@Req() req, @Res() res) {
    try {
      const userId = req.params.id;
      console.log(`userid at complete: ${userId}`)
      console.log("successful")
      // The token from PayPal is actually the order ID
      const orderId = req.query.token;
      await this.servicesService.capturePayment(orderId);
      return res.status(200).send('Payment successful');
    } catch (error) {
      throw new Error(error);
    }
  }
  @Get('/cancel-order')
  async cancel(@Req() req, @Res() res) {
    try {
      console.log("cancelled")
      return res.status(200).send('Order cancelled');
    } catch (error) {
      throw new Error(error);
    }
  }
}
