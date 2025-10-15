# Discovery Page Configuration

## Setup API Keys

1. Copy `config.example.js` to `config.js`:
   ```bash
   cp config.example.js config.js
   ```

2. Edit `config.js` and replace `your_groq_api_key_here` with your actual Groq API key:
   ```javascript
   window.DISCOVERY_CONFIG = {
     GROQ_API_KEY: 'gsk_your_actual_api_key_here',
     GROQ_API_URL: 'https://api.groq.com/openai/v1/chat/completions'
   };
   ```

3. The `config.js` file is already added to `.gitignore` so it won't be committed to git.

## Environment Variables (Alternative)

If you're using a build system that supports environment variables, you can also set:
```
GROQ_API_KEY=gsk_your_actual_api_key_here
```

## Security Note

Never commit your actual API keys to git. Always use the example file as a template.