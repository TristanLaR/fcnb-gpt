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
    const prompt = `Use the following passages to provide an answer to the query: "${query}"\n\n${context}`;

    const openAIStream = await OpenAIStream(prompt, lang);

    // Create a new response object with a new ReadableStream as the body
    const response = new Response(new ReadableStream({
      start(controller) {
        const decoder = new TextDecoder();
        let textChunks = "";
        openAIStream.pipeTo(new WritableStream({
          write(chunk) {
            textChunks += decoder.decode(chunk);
            controller.enqueue(chunk);
          },
          close() {
            console.log(JSON.stringify({
              prompt,
              textChunks,
              lang: lang
            }));
            controller.close();
          },
          abort() {
            controller.error("Stream aborted");
          }
        }));
      }
    }));

    return response;
  } catch (error) {
    console.error("/answer/ error:" + error);
    return new Response("", { status: 500 });
  }
};

export default handler;