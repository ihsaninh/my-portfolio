# AI Scoring Configuration

## Environment Variables Required

To enable AI-powered scoring and feedback, add the following environment variable to your `.env.local` file:

```bash
# Google AI (Gemini) API Key for quiz scoring
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_api_key_here
```

## How to Get Google AI API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key"
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## How It Works

### With AI (when API key is provided):

- Uses Google Gemini 2.0 Flash for intelligent scoring
- Provides detailed feedback with strengths and improvements
- Category-specific evaluation criteria (Tech, Career, Fun)
- Difficulty-adjusted scoring
- Structured feedback with actionable insights

### Without AI (fallback):

- Uses rule-based scoring algorithm
- Analyzes word count, keywords, and structure
- Provides basic feedback messages
- Still functional but less sophisticated

## AI Scoring Features

### Evaluation Criteria:

1. **Content Quality (40%)** - Accuracy, completeness, relevance
2. **Depth & Understanding (25%)** - Shows genuine understanding
3. **Communication (20%)** - Clarity, structure, professional expression
4. **Practical Application (15%)** - Real-world examples, actionable insights

### Feedback Categories:

- **Excellent (90-100)** - Demonstrates mastery with excellent insights
- **Good (80-89)** - Solid understanding with good explanations
- **Average (70-79)** - Basic understanding with adequate explanation
- **Poor (60-69)** - Limited understanding or unclear explanation

### Enhanced Features:

- **Strengths Analysis** - What the user did well
- **Improvement Suggestions** - Specific areas to enhance
- **Category-Specific Criteria** - Tailored to Tech/Career/Fun topics
- **Difficulty Bonuses** - Harder questions get slight score boosts

## Testing

The system will automatically detect if the API key is available:

- With key: Full AI evaluation
- Without key: Fallback to rule-based scoring
- Error handling: Graceful degradation with logging

## Cost Considerations

Google AI Studio offers generous free tier:

- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per month

For a quiz application, this should be sufficient for most use cases.
