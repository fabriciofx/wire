export async function uploadAction(
  req: Request,
  dump: boolean
): Promise<Response> {
  const text = await req.text();
  if (dump) {
    console.log(req.headers);
    console.log('----------------------------------------------------------');
    console.log(text);
  }
  return Response.json('Received.', { status: 201 });
}
