import { Configuration, OpenAIApi } from "openai";
import { encoding_for_model } from "@dqbd/tiktoken";
import { z } from "zod";

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const encoder = encoding_for_model("gpt-3.5-turbo");

function containsNumber(str: string): boolean {
  return !isNaN(+str);
}

type ZodEnumSchema = z.ZodNativeEnum<any> | z.ZodEnum<any>;

export const AIClassifier = <T extends ZodEnumSchema>(
  schema: T,
  description?: string
) => {
  const entries = Object.entries(schema.enum).filter(
    (entry) => !containsNumber(entry[0])
  );

  return async (query: string): Promise<T["_type"]> => {
    const systemPrompt = (
      (description || "") +
      "\nThe user will provide context through text, you will use your expertise to choose the best option below based on it. " +
      entries
        .map((entry, entryIndex) => `${entryIndex + 1}. ${entry[1]}`)
        .join("\n")
    ).trim();

    const logitBias: {
      [key: string]: number;
    } = {};
    for (let i = 0; i < entries.length; i++) {
      const tokens = encoder.encode(String(i + 1));

      for (const token of tokens) {
        logitBias[token] = 100;
      }
    }

    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: query,
        },
      ],
      logit_bias: logitBias,
      max_tokens: 1,
    });

    const response = chatCompletion.data.choices[0].message;

    if (!response?.content) throw new Error("Could not process the query");

    const entryIndex = parseInt(response?.content, 10) - 1;

    return entries[entryIndex][1];
  };
};
