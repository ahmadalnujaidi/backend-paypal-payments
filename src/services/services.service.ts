import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
const axios = require('axios')
require('dotenv').config()

async function generateAccessToken(){
  const response = await axios({
      url: process.env.PAYPAL_BASE_URL + "/v1/oauth2/token",
      method: 'post',
      data: 'grant_type=client_credentials',
      auth: {
          username: process.env.PAYPAL_CLIENT_ID,
          password: process.env.PAYPAL_CLIENT_SECRET,
      },
  })

  
  return response.data.access_token;
}

@Injectable()
export class ServicesService {
  async createOrder() {
    const accessToken = await generateAccessToken();
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + "/v2/checkout/orders",
        method: 'post',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
        data: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    items: [
                        {
                            name: 'nodejs complete course',
                            description: 'nodejs',
                            quantity: 1,
                            unit_amount: {
                                value: '100.00',
                                currency_code: "USD"
                            }
                        }
                    ],
                    amount: {
                        value: '100.00',
                        currency_code: "USD",
                        breakdown: {
                            item_total: {
                                value: '100.00',
                                currency_code: "USD"
                            }
                        }
                    }
                }
            ],
            application_context: {
                return_url: `${process.env.BASE_URL}/services/complete-order`,
                cancel_url: `${process.env.BASE_URL}/services/cancel-order`,
                shipping_prefernce: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: "academic resources"
            }
        })
    })
    return response.data.links.find((link: any) => link.rel === 'approve').href;
}
 capturePayment = async (orderId) => {
  const accessToken = await generateAccessToken();
  const response = await axios({
      url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
      },
  })
  return response.data;
}
}
