import { test, expect } from 'vitest';
import axios from 'axios';

test('should return a token for valid credentials', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/buyer/login', {
        username: 'buyer2',
        password: 'buyer456'
    });
    console.log(response);
    expect(response.data.status).toBe(200);
    // expect(response.data).toHaveProperty('token');
});

test('should return 401 for invalid credentials', async () => {
    // try {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/buyer/login', {
        username: 'buyer2',
        password: 'wrongpassword'
    });
    console.log(response);
    expect(response.data.status).toBe(401);
    // } catch (error) {
    //     expect(error.response.status).toBe(401);
    // }
});

test('should be able to add funds to a buyer account', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/buyer/addFunds', {
        accountID: 7,
        funds: 200
    });
    console.log(response);
    expect(response.data.status).toBe(200);
});

test('should be able to bid on an item that is published', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/buyer/placeBid', {
        accountID: 3,
        itemID: 11,
        bidAmount: 150
    });
    console.log(response);
    expect(response.data.status).toBe(200);
});


// describe('buyerViewItems', () => {
//     it('should return a list of items available for auction', async () => {
//         const items = await buyerViewItems();
//         expect(items).toBeInstanceOf(Array);
//         expect(items.length).toBeGreaterThan(0);
//         items.forEach(item => {
//             expect(item).toHaveProperty('id');
//             expect(item).toHaveProperty('name');
//             expect(item).toHaveProperty('startingBid');
//         });
//     });

//     it('should return an empty array if no items are available', async () => {
//         // Mock the function to return an empty array
//         const mockBuyerViewItems = jest.fn().mockResolvedValue([]);
//         const items = await mockBuyerViewItems();
//         expect(items).toBeInstanceOf(Array);
//         expect(items.length).toBe(0);
//     });

//     it('should handle errors gracefully', async () => {
//         // Mock the function to throw an error
//         const mockBuyerViewItems = jest.fn().mockRejectedValue(new Error('Network Error'));
//         try {
//             await mockBuyerViewItems();
//         } catch (error) {
//             expect(error).toBeInstanceOf(Error);
//             expect(error.message).toBe('Network Error');
//         }
//     });
// });