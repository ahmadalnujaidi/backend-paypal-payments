import { Injectable } from '@nestjs/common';
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
  async createOrder(userId: string) {
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
                    },
                    custom_id: userId // Store the user ID here
                }
            ],
            application_context: {
                return_url: `${process.env.BASE_URL}/services/complete-order/${userId}`,
                cancel_url: `${process.env.BASE_URL}/services/cancel-order`,
                shipping_prefernce: 'NO_SHIPPING',
                user_action: 'PAY_NOW',
                brand_name: "academic resources"
            }
        })
    })
    return response.data.links.find((link: any) => link.rel === 'approve').href;
}
 capturePayment = async (orderId: string) => {
  const accessToken = await generateAccessToken();
  const response = await axios({
      url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
      },
  })
  console.log("captured!")

    // Get the order details to extract the user ID
   const orderDetails = await this.getOrderDetails(orderId, accessToken);
   const userId = orderDetails.purchase_units[0].custom_id;

  // Here you would update the user in your database
  await this.updateUserPaymentStatus(userId);

  return response.data;
}

// Helper method to get order details
private async getOrderDetails(orderId: string, accessToken: string) {
    const response = await axios({
        url: process.env.PAYPAL_BASE_URL + `/v2/checkout/orders/${orderId}`,
        method: 'get',
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`,
        },
    });
    return response.data;
  }

// Method to update user payment status in your database
private async updateUserPaymentStatus(userId: string) {
    
    // set user's lastPayment to current date
    // make Patch request to http://localhost:3001/users/{userId}
    
try {
  const response = await axios({
    url: `${process.env.BASE_URL || 'http://localhost:3001'}/users/${userId}`,
    method: 'patch',
    data: {
      lastPayment: new Date(),
      isActive: true
    }
  });
  
  if (response.status !== 200) {
    console.error(`Failed to update user ${userId}: ${response.statusText}`);
  } else {
    console.log('updated status successfuly')
  }
} catch (error) {
  console.error(`Error updating user payment status: ${error.message}`);
}

    console.log(`Updated payment status for user: ${userId}`);
}
}

