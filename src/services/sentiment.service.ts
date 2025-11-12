import axios, { AxiosError } from "axios";
import { Sentiment, Emotion, Prisma } from "@prisma/client";
import { NLP_CONFIG, EmotionLabel } from "../config/nlp";
import { logger } from "../utils/logger";
import { prisma } from "../utils/prisma";
import { wsService } from "./websocket.service";

interface HuggingFaceResponse {
  label: string;
  score: number;
}

interface SentimentResult {
  sentiment: Sentiment;
  sentimentScore: number;
  confidence: number;
}

interface EmotionResult {
  primaryEmotion: Emotion | null;
  emotions: Record<string, number>;
  confidence: number;
}

interface AnalysisResult {
  sentiment: Sentiment;
  sentimentScore: number;
  confidence: number;
  primaryEmotion: Emotion | null;
  emotions: Record<string, number>;
  keyPhrases: string[];
  wordCount: number;
}

export class SentimentService {
  private baseUrl = NLP_CONFIG.HUGGINGFACE.BASE_URL;
  private apiKey = NLP_CONFIG.HUGGINGFACE.API_KEY;
  private modelsWarmedUp = false;

  /**
   * Warm up models on service start
   */
  async warmUpModels(): Promise<void> {
    if (this.modelsWarmedUp) return;

    // Check if API key is configured
    if (!this.apiKey) {
      logger.warn(
        "[NLP] Hugging Face API key not configured. Sentiment analysis will use fallback rule-based approach."
      );
      logger.warn(
        "[NLP] To enable AI-powered sentiment analysis, add HUGGINGFACE_API_KEY to your .env file"
      );
      logger.warn(
        "[NLP] Get your free API key from: https://huggingface.co/settings/tokens"
      );
      return;
    }

    logger.info("[NLP] Warming up models with test requests...");
    try {
      await Promise.all([
        this.analyzeSentimentRaw("Hello world"),
        this.detectEmotionRaw("I am happy"),
      ]);
      this.modelsWarmedUp = true;
      logger.info(
        "[NLP] Models warmed up successfully - AI-powered analysis ready"
      );
    } catch (error) {
      logger.warn(
        "[NLP] Model warm-up encountered errors (this is normal on first request)"
      );
      logger.warn(
        "[NLP] Models will automatically warm up on first feedback submission"
      );
      // Don't throw - models will warm up on first real request
    }
  }

  /**
   * Analyze sentiment using Hugging Face API
   */
  private async analyzeSentimentRaw(text: string): Promise<SentimentResult> {
    const model = NLP_CONFIG.MODELS.SENTIMENT;
    const url = `${this.baseUrl}/${model}`;

    try {
      const response = await axios.post<HuggingFaceResponse[]>(
        url,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: NLP_CONFIG.HUGGINGFACE.TIMEOUT,
        }
      );

      const results = response.data[0] || response.data;

      // Find the prediction with highest score
      const prediction = Array.isArray(results) ? results[0] : results;

      return this.mapSentimentResult(prediction);
    } catch (error) {
      return this.handleSentimentError(error as AxiosError, text);
    }
  }

  /**
   * Detect emotion using Hugging Face API
   */
  private async detectEmotionRaw(text: string): Promise<EmotionResult> {
    const model = NLP_CONFIG.MODELS.EMOTION;
    const url = `${this.baseUrl}/${model}`;

    try {
      const response = await axios.post<HuggingFaceResponse[]>(
        url,
        { inputs: text },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: NLP_CONFIG.HUGGINGFACE.TIMEOUT,
        }
      );

      const results = response.data[0] || response.data;
      return this.mapEmotionResult(
        Array.isArray(results) ? results : [results]
      );
    } catch (error) {
      return this.handleEmotionError(error as AxiosError, text);
    }
  }

  /**
   * Map Hugging Face sentiment response to our schema
   */
  private mapSentimentResult(prediction: HuggingFaceResponse): SentimentResult {
    const { label, score } = prediction;
    const thresholds = NLP_CONFIG.SENTIMENT_THRESHOLDS;

    let sentiment: Sentiment;
    let sentimentScore: number;

    if (label.toUpperCase() === "POSITIVE") {
      if (score >= thresholds.VERY_POSITIVE) {
        sentiment = Sentiment.VERY_POSITIVE;
        sentimentScore = score;
      } else if (score >= thresholds.POSITIVE) {
        sentiment = Sentiment.POSITIVE;
        sentimentScore = score * 0.75; // Scale to 0.6-0.8 range
      } else {
        sentiment = Sentiment.NEUTRAL;
        sentimentScore = score * 0.5; // Scale to 0.4-0.6 range
      }
    } else {
      // NEGATIVE label
      if (score >= thresholds.VERY_NEGATIVE) {
        sentiment = Sentiment.VERY_NEGATIVE;
        sentimentScore = -score;
      } else if (score >= thresholds.NEGATIVE) {
        sentiment = Sentiment.NEGATIVE;
        sentimentScore = -score * 0.75;
      } else {
        sentiment = Sentiment.NEUTRAL;
        sentimentScore = -score * 0.5;
      }
    }

    return {
      sentiment,
      sentimentScore,
      confidence: score,
    };
  }

  /**
   * Map Hugging Face emotion response to our schema
   */
  private mapEmotionResult(predictions: HuggingFaceResponse[]): EmotionResult {
    const emotions: Record<string, number> = {};
    let primaryEmotion: Emotion | null = null;
    let maxScore = 0;

    for (const prediction of predictions) {
      const emotionLabel = prediction.label.toLowerCase() as EmotionLabel;
      const mappedEmotion = NLP_CONFIG.EMOTION_MAPPING[emotionLabel];

      if (mappedEmotion) {
        emotions[emotionLabel] = prediction.score;

        if (prediction.score > maxScore) {
          maxScore = prediction.score;
          primaryEmotion = mappedEmotion as Emotion;
        }
      }
    }

    return {
      primaryEmotion,
      emotions,
      confidence: maxScore,
    };
  }

  /**
   * Extract key phrases from text (simple TF-IDF approach)
   */
  private extractKeyPhrases(text: string): string[] {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "from",
      "as",
      "is",
      "was",
      "are",
      "were",
      "been",
      "be",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "can",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
      "my",
      "your",
      "his",
      "her",
      "its",
      "our",
      "their",
      "this",
      "that",
      "these",
      "those",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !stopWords.has(word));

    // Count word frequency
    const frequency: Record<string, number> = {};
    for (const word of words) {
      frequency[word] = (frequency[word] || 0) + 1;
    }

    // Get top 5 words by frequency
    const keyPhrases = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);

    return keyPhrases;
  }

  /**
   * Analyze feedback text (main public method)
   */
  async analyzeFeedback(
    feedbackId: string,
    text: string
  ): Promise<AnalysisResult> {
    logger.info(`Starting sentiment analysis for feedback: ${feedbackId}`);

    if (!text || text.trim().length === 0) {
      logger.warn(
        `Empty text for feedback: ${feedbackId}, using neutral sentiment`
      );
      return this.getNeutralResult();
    }

    try {
      // Run sentiment and emotion analysis in parallel
      const [sentimentResult, emotionResult] = await Promise.all([
        this.analyzeSentimentRaw(text),
        this.detectEmotionRaw(text),
      ]);

      const keyPhrases = this.extractKeyPhrases(text);
      const wordCount = text.split(/\s+/).length;

      const result: AnalysisResult = {
        sentiment: sentimentResult.sentiment,
        sentimentScore: sentimentResult.sentimentScore,
        confidence: sentimentResult.confidence,
        primaryEmotion: emotionResult.primaryEmotion,
        emotions: emotionResult.emotions,
        keyPhrases,
        wordCount,
      };

      logger.info(`Sentiment analysis completed for feedback: ${feedbackId}`, {
        sentiment: result.sentiment,
        primaryEmotion: result.primaryEmotion,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      logger.error(`Sentiment analysis failed for feedback: ${feedbackId}`, {
        error,
      });
      return this.getNeutralResult();
    }
  }

  /**
   * Store sentiment analysis results in database
   */
  async storeSentimentAnalysis(
    feedbackId: string,
    analysis: AnalysisResult
  ): Promise<void> {
    try {
      await prisma.sentimentAnalysis.create({
        data: {
          feedbackId,
          sentiment: analysis.sentiment,
          sentimentScore: analysis.sentimentScore,
          confidence: analysis.confidence,
          emotions: analysis.emotions as Prisma.InputJsonValue,
          primaryEmotion: analysis.primaryEmotion,
          keyPhrases: analysis.keyPhrases,
          wordCount: analysis.wordCount,
          detectedLanguage: "en", // Default to English for now
        },
      });

      // Broadcast sentiment analysis completion via WebSocket
      wsService.broadcastSentimentAnalyzed(feedbackId, analysis);

      logger.info(`Stored sentiment analysis for feedback: ${feedbackId}`);
    } catch (error) {
      logger.error(
        `Failed to store sentiment analysis for feedback: ${feedbackId}`,
        {
          error,
        }
      );
      throw error;
    }
  }

  /**
   * Batch analyze multiple feedback items
   */
  async batchAnalyze(
    feedbackItems: Array<{ id: string; text: string }>
  ): Promise<void> {
    const batchSize = NLP_CONFIG.PROCESSING.BATCH_SIZE;

    logger.info(
      `Starting batch analysis for ${feedbackItems.length} feedback items`
    );

    for (let i = 0; i < feedbackItems.length; i += batchSize) {
      const batch = feedbackItems.slice(i, i + batchSize);

      const promises = batch.map(async (item) => {
        try {
          const analysis = await this.analyzeFeedback(item.id, item.text);
          await this.storeSentimentAnalysis(item.id, analysis);
        } catch (error) {
          logger.error(`Batch analysis failed for feedback: ${item.id}`, {
            error,
          });
        }
      });

      await Promise.allSettled(promises);
    }

    logger.info(`Batch analysis completed for ${feedbackItems.length} items`);
  }

  /**
   * Get neutral result (fallback)
   */
  private getNeutralResult(): AnalysisResult {
    return {
      sentiment: Sentiment.NEUTRAL,
      sentimentScore: 0,
      confidence: 0.5,
      primaryEmotion: Emotion.NEUTRAL,
      emotions: { neutral: 1.0 },
      keyPhrases: [],
      wordCount: 0,
    };
  }

  /**
   * Handle sentiment API errors with retries
   */
  private async handleSentimentError(
    error: AxiosError,
    text: string
  ): Promise<SentimentResult> {
    if (error.response?.status === 503) {
      // Model is loading, wait and retry
      logger.debug("[NLP] Sentiment model is loading, waiting for warm-up...");
      await this.sleep(NLP_CONFIG.PROCESSING.MODEL_WARMUP_DELAY);
      return this.analyzeSentimentRaw(text);
    }

    if (error.response?.status === 429) {
      // Rate limit, use exponential backoff
      logger.warn("[NLP] Rate limit hit, retrying with backoff...");
      await this.sleep(NLP_CONFIG.PROCESSING.RETRY_DELAY);
      return this.analyzeSentimentRaw(text);
    }

    if (error.response?.status === 401) {
      logger.error(
        "[NLP] Invalid Hugging Face API key. Please check HUGGINGFACE_API_KEY in .env"
      );
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      logger.warn(
        "[NLP] Cannot reach Hugging Face API - check internet connection"
      );
    } else {
      logger.debug(
        "[NLP] Sentiment API temporarily unavailable, using fallback"
      );
    }

    return this.fallbackSentimentAnalysis(text);
  }

  /**
   * Handle emotion API errors
   */
  private async handleEmotionError(
    error: AxiosError,
    text: string
  ): Promise<EmotionResult> {
    if (error.response?.status === 503) {
      logger.debug("[NLP] Emotion model is loading, waiting for warm-up...");
      await this.sleep(NLP_CONFIG.PROCESSING.MODEL_WARMUP_DELAY);
      return this.detectEmotionRaw(text);
    }

    if (error.response?.status === 401) {
      logger.error(
        "[NLP] Invalid Hugging Face API key. Please check HUGGINGFACE_API_KEY in .env"
      );
    } else if (error.code === "ENOTFOUND" || error.code === "ECONNREFUSED") {
      logger.warn(
        "[NLP] Cannot reach Hugging Face API - check internet connection"
      );
    } else {
      logger.debug("[NLP] Emotion API temporarily unavailable, using fallback");
    }

    return this.fallbackEmotionAnalysis(text);
  }

  /**
   * Simple rule-based sentiment analysis (fallback)
   */
  private fallbackSentimentAnalysis(text: string): SentimentResult {
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "love",
      "happy",
      "amazing",
      "wonderful",
      "fantastic",
      "best",
      "perfect",
    ];
    const negativeWords = [
      "bad",
      "poor",
      "hate",
      "terrible",
      "frustrated",
      "worst",
      "awful",
      "horrible",
      "disappointing",
      "useless",
    ];

    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter((w) =>
      lowerText.includes(w)
    ).length;
    const negativeCount = negativeWords.filter((w) =>
      lowerText.includes(w)
    ).length;

    if (negativeCount > positiveCount + 1) {
      return {
        sentiment: Sentiment.NEGATIVE,
        sentimentScore: -0.6,
        confidence: 0.6,
      };
    } else if (positiveCount > negativeCount + 1) {
      return {
        sentiment: Sentiment.POSITIVE,
        sentimentScore: 0.6,
        confidence: 0.6,
      };
    }
    return { sentiment: Sentiment.NEUTRAL, sentimentScore: 0, confidence: 0.5 };
  }

  /**
   * Simple rule-based emotion analysis (fallback)
   */
  private fallbackEmotionAnalysis(text: string): EmotionResult {
    const lowerText = text.toLowerCase();

    if (
      lowerText.includes("happy") ||
      lowerText.includes("joy") ||
      lowerText.includes("love")
    ) {
      return {
        primaryEmotion: Emotion.JOY,
        emotions: { joy: 0.7 },
        confidence: 0.7,
      };
    }
    if (
      lowerText.includes("angry") ||
      lowerText.includes("anger") ||
      lowerText.includes("furious")
    ) {
      return {
        primaryEmotion: Emotion.ANGER,
        emotions: { anger: 0.7 },
        confidence: 0.7,
      };
    }
    if (lowerText.includes("sad") || lowerText.includes("disappointed")) {
      return {
        primaryEmotion: Emotion.SADNESS,
        emotions: { sadness: 0.7 },
        confidence: 0.7,
      };
    }
    if (lowerText.includes("frustrated") || lowerText.includes("annoyed")) {
      return {
        primaryEmotion: Emotion.FRUSTRATION,
        emotions: { frustration: 0.7 },
        confidence: 0.7,
      };
    }

    return {
      primaryEmotion: Emotion.NEUTRAL,
      emotions: { neutral: 0.8 },
      confidence: 0.8,
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const sentimentService = new SentimentService();
