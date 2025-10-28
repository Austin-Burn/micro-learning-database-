/**
 * Test Web Interface
 * Opens the web interface and tests basic functionality
 */
import fetch from 'node-fetch';

async function testWebInterface() {
    console.log('🌐 Testing MicroLearn Web Interface...\n');

    try {
        // Test if web interface loads
        console.log('1. Testing web interface loading...');
        const response = await fetch('http://localhost:3000/');
        
        if (response.ok) {
            const html = await response.text();
            if (html.includes('MicroLearn Database Manager')) {
                console.log('✅ Web interface loads successfully!');
                console.log('🌐 Open http://localhost:3000/ in your browser to use the web interface');
            } else {
                console.log('❌ Web interface content not found');
            }
        } else {
            console.log('❌ Web interface failed to load:', response.status);
        }

        // Test API endpoints
        console.log('\n2. Testing API endpoints...');
        
        const healthResponse = await fetch('http://localhost:3000/health');
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.status);

        const nodesResponse = await fetch('http://localhost:3000/api/nodes');
        const nodesData = await nodesResponse.json();
        console.log('✅ API nodes endpoint:', nodesData.success ? 'Working' : 'Failed');

        console.log('\n🎉 Web Interface Test Complete!');
        console.log('\n📋 What you can do:');
        console.log('1. Open http://localhost:3000/ in your browser');
        console.log('2. Create learning nodes using the form');
        console.log('3. View the hierarchical tree structure');
        console.log('4. Search and filter nodes');
        console.log('5. Update and delete nodes');
        console.log('6. Export your data');
        console.log('7. View statistics');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testWebInterface();
