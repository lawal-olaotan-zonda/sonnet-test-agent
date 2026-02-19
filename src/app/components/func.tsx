
import {OrderInformation } from '../interface';

export const processOrder = async(orderDetails:OrderInformation,route:string) => {

    const serviceUrl = process.env.NEXT_PUBLIC_SERVICE_URL || 'http://localhost:8080'

    const res = await fetch(`${serviceUrl}/${route}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderDetails),
      });

    return await res.json();
}