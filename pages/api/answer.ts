import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge"
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { query, context, lang } = (await req.json()) as {
      query: string;
      context: string;
      lang: string;
    };

    // Prompt for LLM summarization
    const prompt = `Use the following passages to provide an answer to the query: "${query}"\n\n${context}`

    const stream = await OpenAIStream(prompt, lang);

    // logging

    const logObject = {
      query: query,
      response: stream
    };

    const logString = JSON.stringify(logObject);

    console.log(logString);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
