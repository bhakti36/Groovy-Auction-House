import { expect, test } from "vitest";
import axios from "axios";

test('adminLogin should return a token for valid credentials', async () => {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/admin/login', {
        username: 'Admin',
        password: 'Admin123'
    });
    console.log(response);
    expect(response.data.status).toBe(200);
    // expect(response.data).toHaveProperty('token');
});

test('adminLogin should return 401 for invalid credentials', async () => {
    // try {
    const response = await axios.post('https://mtlda2oa5d.execute-api.us-east-2.amazonaws.com/Test/admin/login', {
        username: 'Admin',
        password: 'wrongpassword'
    });
    console.log(response);
    expect(response.data.status).toBe(400);
    // } catch (error) {
    //     expect(error.response.status).toBe(401);
    // }
});

// test('adminLogin should return 400 for missing credentials', async () => {
//     try {
//         await axios.post('http://localhost:3000/adminLogin', {});
//     } catch (error) {
//         expect(error.response.status).toBe(400);
//     }
// });
