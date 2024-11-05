// test-api.js
const axios = require('axios');

const BASE_URL = 'https://jitfc-backend.netlify.app/.netlify/functions/api';

async function testEndpoints() {
    try {
        // 1. Test base endpoint
        console.log('Testing base endpoint...');
        const testRes = await axios.get(BASE_URL);
        console.log('Base endpoint response:', testRes.data);

        // 2. Test registration
        console.log('\nTesting registration...');
        const registerRes = await axios.post(`${BASE_URL}/users/register`, {
            name: 'Test User',
            email: `test${Date.now()}@example.com`,
            password: 'password123',
            state: 'California'
        });
        console.log('Registration response:', registerRes.data);

        // Log full URL for debugging
        console.log('\nFull URLs used:');
        console.log('Base URL:', BASE_URL);
        console.log('Register URL:', `${BASE_URL}/users/register`);

    } catch (error) {
        console.error('Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url
        });
    }
}

testEndpoints();