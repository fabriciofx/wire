export async function uploadAction(req: Request): Promise<Response> {
  console.log(req.headers);
  console.log('-------------------');
  const reader = req.body?.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { value, done } = await reader!.read();
    if (done) {
      break;
    }
    chunks.push(value);
    length += value.length;
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  const decoder = new TextDecoder();
  const text = decoder.decode(result);
  console.log(text);
  return Response.json('Received.', { status: 201 });
}
