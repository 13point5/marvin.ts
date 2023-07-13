import { Configuration, OpenAIApi } from "openai";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const configuration = new Configuration({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const AIModel = <T>(
  schema: z.ZodType<T>
): ((query: string) => Promise<T>) => {
  return async (query: string): Promise<T> => {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "The user will provide context as text that you need to parse into a structured form. To validate your response, you must call the `FormatResponse` function. Use the provided text to extract or infer any parameters needed by `FormatResponse`, including any missing data.",
        },
        { role: "user", content: `The text to parse: ${query}` },
      ],
      functions: [
        {
          name: "formatResponse",
          description:
            "You MUST always call this function before responding to the user to ensure that your final response is formatted correctly and complies with the output format requirements.",
          parameters: zodToJsonSchema(schema),
        },
      ],
    });

    const response = chatCompletion.data.choices[0].message;

    if (
      !response?.function_call ||
      !(
        response.function_call.name === "formatResponse" &&
        response.function_call.arguments
      )
    ) {
      throw new Error("Could not model the query");
    }

    const res = schema.safeParse(JSON.parse(response.function_call.arguments));

    if (!res.success) throw new Error("Could not model the query");

    return res.data;
  };
};
