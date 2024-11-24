import { test, expect } from 'vitest';
import axios from 'axios';

test('should return a token for valid credentials', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/seller/login', {
        username: 'seller2',
        password: 'seller456'
    });
    console.log(response);
    expect(response.data.status).toBe(200);
    // expect(response.data).toHaveProperty('token');
});

test('should return items for a seller', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/seller/reviewItems', {
        sellerID: 2
    });
    console.log(response);
    for(let item in response.data.items){
        console.log(item);
    }
    expect(response.data.status).toBe(200);
});