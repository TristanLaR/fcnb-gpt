const loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`

export async function mockStream() {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const words = loremIpsum.split(' ')
      for (const word of words) {
        controller.enqueue(encoder.encode(word + ' '))
        await new Promise(resolve => setTimeout(resolve, 50)) // Simulate network delay
      }
      controller.close()
    },
  })

  return new Response(stream)
}

