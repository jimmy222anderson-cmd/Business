const http = require('http');

// You need to replace this with your actual admin token
// Get it from localStorage in the browser: localStorage.getItem('auth_token')
const AUTH_TOKEN = 'YOUR_TOKEN_HERE'; // Replace with actual token

const blogData = JSON.stringify({
  title: 'Test Blog Post - Satellite Technology',
  slug: 'test-blog-satellite-tech-' + Date.now(),
  excerpt: 'This is a test blog post about satellite technology and Earth Observation.',
  content: `# Introduction to Satellite Technology

Satellite technology has revolutionized the way we observe and understand our planet. From weather forecasting to environmental monitoring, satellites provide critical data that helps us make informed decisions.

## Key Benefits

- Real-time monitoring of Earth's surface
- Weather prediction and climate analysis
- Disaster response and management
- Agricultural optimization
- Urban planning and development

## The Future

As technology advances, we can expect even more sophisticated satellite systems that will provide unprecedented insights into our planet's health and changes.`,
  featured_image_url: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800&h=600&fit=crop',
  tags: ['Satellite', 'Technology', 'Earth Observation'],
  status: 'published'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/admin/blogs',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(blogData),
    'Authorization': `Bearer ${AUTH_TOKEN}`
  }
};

console.log('Creating blog post via API...');
console.log('Endpoint:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('\nResponse Status:', res.statusCode);
    console.log('Response:', data);
    
    if (res.statusCode === 201) {
      console.log('\n✓ Blog post created successfully!');
      try {
        const result = JSON.parse(data);
        console.log('Blog ID:', result._id);
        console.log('Title:', result.title);
        console.log('Slug:', result.slug);
      } catch (e) {
        // Ignore parse errors
      }
    } else {
      console.log('\n✗ Failed to create blog post');
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
  console.log('\nMake sure:');
  console.log('1. Backend server is running on port 5000');
  console.log('2. You have replaced AUTH_TOKEN with your actual token');
  console.log('3. Get token from browser console: localStorage.getItem("auth_token")');
});

req.write(blogData);
req.end();
