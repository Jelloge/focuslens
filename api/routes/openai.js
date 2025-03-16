import { ActionOptions } from "gadget-server";
import OpenAI from "openai";

const CATEGORY_COLORS = {
    FIRST: "#FF355E",    // Pink - vibrant and eye-catching
    SECOND: "#54B435",   // Rich green - easy on eyes
    THIRD: "#FFD700"     // Yellow - bright and noticeable
};

// Initialize OpenAI client
const initOpenAI = (apiKey) => {
  return new OpenAI({
    apiKey: apiKey,
  });
};

// Function to generate a title using OpenAI
const generateTitle = async (openai, content) => {
  try {
    if (!content || content.trim() === "") return "Untitled Document";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 
            "You are a helpful assistant that generates concise titles. Rules:\n" +
            "- Title must be complete and meaningful\n" +
            "- Maximum 4 words\n" +
            "- No quotes or punctuation\n" +
            "- Must be descriptive of the content"
        },
        {
          role: "user",
          content: `Generate a clear, complete title for this content:\n\n${content}`
        }
      ],
      max_tokens: 20,  // Increased to allow for complete titles
      temperature: 0.7, // Added for more creative but still focused titles
      presence_penalty: 0.6 // Encourages more diverse word choice
    });

    let aiGeneratedTitle = response.choices?.[0]?.message?.content?.trim() || "Untitled Document";

    // Clean up the title
    aiGeneratedTitle = aiGeneratedTitle
      .replace(/["']/g, '') // Remove quotes
      .replace(/\.+$/, '') // Remove trailing periods
      .trim();

    return aiGeneratedTitle;
  } catch (error) {
    console.error("Error generating AI title:", error.message);
    return "Untitled Document";
  }
};

// Function to generate categories
const generateCategories = async (openai, content) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: 
            "You are an expert content analyzer. For the given content, generate EXACTLY THREE distinct categories that capture different aspects:\n" +
            "Main Theme/Topic\n" +
            "Technical/Historical Details\n" +
            "Impact/Applications\n\n" +
            "Rules:\n" +
            "- Each category should be 2-3 words\n" +
            "- Make categories specific to the content\n" +
            "- No generic terms like 'Key Details' or 'Questions'\n" +
            "- No numbers or prefixes\n" +
            "Return exactly three lines, one category per line."
        },
        {
          role: "user",
          content: `Generate three specific categories for this content:\n\n${content}`
        }
      ],
      temperature: 0.3,  // Lower temperature for more consistent output
      max_tokens: 50
    });

    const categoryNames = response.choices[0].message.content
      .split('\n')
      .filter(name => name.trim())
      .slice(0, 3);

    return categoryNames.map((name, index) => ({
      name: name.trim(),
      color: [CATEGORY_COLORS.FIRST, CATEGORY_COLORS.SECOND, CATEGORY_COLORS.THIRD][index]
    }));
  } catch (error) {
    console.error("Error generating categories:", error);
    // Return default categories if AI fails
    return [
      { name: "Main Points", color: CATEGORY_COLORS.FIRST },
      { name: "Key Details", color: CATEGORY_COLORS.SECOND },
      { name: "Follow-up", color: CATEGORY_COLORS.THIRD }
    ];
  }
};

// Function to generate highlights
const generateHighlights = async (openai, content, categories) => {
  const systemPrompt = `You are an expert text analyzer. Your task is to find 2-3 complete, relevant sentences about the given topic.

  CRITICAL RULES:
  1. Return ONLY complete grammatical sentences
  2. Each sentence must be relevant to the topic
  3. Include the full sentence with proper punctuation

  Return format:
  {
    "highlights": [
      {
        "text": "Complete sentence one with proper punctuation."
      },
      {
        "text": "Complete sentence two with proper punctuation."
      }
    ]
  }

  IMPORTANT: 
  - Each text must be a complete sentence
  - Include punctuation
  - Ensure relevance to the topic`;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: 
            `Find 2-3 sentences related to "${categories[0].name}" in this text:\n\n${content}\n\n`
        }
      ],
      temperature: 0.3
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error in generateHighlights:", error);
    return { highlights: [] };
  }
};

// Main action run function
export const run = async ({ params, logger, config }) => {
  try {
    const openai = initOpenAI(config.OPENAI_API_KEY);
    
    // Process document based on the operation requested
    switch(params.operation) {
      case "generateTitle":
        return await generateTitle(openai, params.content);
      case "generateCategories":
        return await generateCategories(openai, params.content);
      case "generateHighlights":
        return await generateHighlights(openai, params.content, params.categories);
      case "processDocument":
        // Full document processing pipeline
        const title = await generateTitle(openai, params.content);
        const categories = await generateCategories(openai, params.content);
        const highlights = await generateHighlights(openai, params.content, categories);
        return { title, categories, highlights };
      default:
        throw new Error("Invalid operation");
    }
  } catch (error) {
    logger.error("OpenAI action error:", error);
    throw error;
  }
};

// Define params for this action
export const params = {
  operation: {
    type: "string",
    options: ["generateTitle", "generateCategories", "generateHighlights", "processDocument"],
  },
  content: { type: "string" },
  categories: { type: "array", optional: true },
};

// Define action options
export const options = {
  actionType: "custom",
};
