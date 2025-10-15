# 🤖 Discovery Page - AI Travel Assistant

AI-powered travel discovery and recommendation system using Groq's reasoning models.

## ✨ Features

- 🧠 **AI Chatbot** - Powered by Groq's GPT-OSS and Llama models
- 🗺️ **Interactive Maps** - Visual tour and location recommendations
- 🏨 **Hotel Suggestions** - Smart accommodation recommendations
- 🎯 **Smart Filtering** - Budget-based tour filtering
- 💬 **Voice Input** - Speech-to-text support (Vietnamese)
- 📱 **Responsive Design** - Works on all devices

## 🚀 Quick Start

### 1. Get Your Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `gsk_`)

### 2. Configure API Key

**Option A: Using config.js (Recommended)**

```bash
# Copy the example config
cp config.example.js config.js
```

Edit `config.js` and add your API key:
```javascript
window.DISCOVERY_CONFIG = {
  GROQ_API_KEY: 'gsk_your_actual_api_key_here',
  MODEL: 'llama-3.3-70b-versatile',
  // ... other settings
};
```

**Option B: Using .env file**

Create `.env` in the project root:
```env
GROQ_API_KEY=gsk_your_actual_api_key_here
```

### 3. Test Your Setup

Open `test-api.html` in your browser to verify:
- ✅ Config is loaded correctly
- ✅ API key is valid
- ✅ Models are working

## 🎛️ Available Models

### Fast & Versatile (Default)
```javascript
MODEL: 'llama-3.3-70b-versatile'
```
- Best for: Chat, general recommendations, fast responses
- Speed: ⚡⚡⚡ Ultra-fast
- Quality: ⭐⭐⭐⭐ Excellent

### Reasoning Models (Advanced)
```javascript
MODEL: 'openai/gpt-oss-20b'  // or 'openai/gpt-oss-120b'
```
- Best for: Complex planning, step-by-step reasoning
- Speed: ⚡⚡ Fast
- Quality: ⭐⭐⭐⭐⭐ Superior reasoning
- Features: Can show reasoning process

```javascript
MODEL: 'qwen/qwen3-32b'
```
- Best for: Balanced reasoning and speed
- Speed: ⚡⚡ Fast
- Quality: ⭐⭐⭐⭐ Great reasoning

## ⚙️ Configuration Options

Edit `config.js` to customize:

```javascript
window.DISCOVERY_CONFIG = {
  // API Configuration
  GROQ_API_KEY: 'your_key_here',
  GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  
  // Model Settings
  MODEL: 'llama-3.3-70b-versatile',
  TEMPERATURE: 0.6,        // 0.0-2.0 (higher = more creative)
  MAX_TOKENS: 2048,        // Response length limit
  TOP_P: 0.95,            // Nucleus sampling
  
  // Reasoning Features (GPT-OSS only)
  INCLUDE_REASONING: false, // Show AI's thinking process
  REASONING_EFFORT: 'medium' // 'low', 'medium', 'high'
};
```

## 📝 Usage Examples

### Basic Travel Query
```
User: "Tôi muốn đi Đà Lạt 3 ngày, ngân sách 5 triệu"
AI: [Suggests tours, hotels, itinerary based on budget and duration]
```

### Hotel Search
```
User: "Tìm khách sạn gần biển ở Phú Quốc, 3-4 sao"
AI: [Filters and recommends matching hotels]
```

### Detailed Planning
```
User: "Lập kế hoạch chi tiết cho chuyến đi Sa Pa"
AI: [Creates day-by-day itinerary with activities, costs, tips]
```

## 🔒 Security Notes

- ⚠️ **Never commit** `config.js` or `.env` files with real API keys
- ✅ Always use `.env.example` or `config.example.js` as templates
- ✅ Files are already in `.gitignore`
- ✅ GitHub push protection will block accidental commits

## 🛠️ Troubleshooting

### API Key Error (401)
- ✅ Check if API key is correct in `config.js`
- ✅ Verify key is active at [Groq Console](https://console.groq.com/keys)
- ✅ Hard refresh page (Ctrl+F5)

### No Response from Chatbot
- ✅ Open browser console (F12) to see errors
- ✅ Run `test-api.html` to diagnose
- ✅ Check internet connection

### Rate Limit Error (429)
- ⏰ Wait a few seconds and try again
- 📊 Check your usage at Groq Console

## 📚 Documentation

- [Groq API Docs](https://console.groq.com/docs)
- [Reasoning Models Guide](https://console.groq.com/docs/reasoning)
- [Model Comparison](https://console.groq.com/docs/models)

## 🤝 Contributing

When contributing, remember:
1. Never commit real API keys
2. Test with `test-api.html` before committing
3. Update this README if adding new features

## 📄 License

Part of NeuralNova project.
