export const config = {
  runtime: 'edge', // Use Edge Runtime for faster cold starts
};

export default async function handler(req) {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    const { accessToken, action, pinData, boardId } = await req.json();

    if (!accessToken) {
      throw new Error('Missing Access Token');
    }

    const PINTEREST_API = 'https://api.pinterest.com/v5';

    // --- Action: Fetch Boards ---
    if (action === 'get_boards') {
      const response = await fetch(`${PINTEREST_API}/boards`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
          throw new Error(`Pinterest API Error (${response.status}): ${JSON.stringify(data)}`);
      }
      
      return new Response(JSON.stringify(data), { status: response.status, headers });
    }

    // --- Action: Create Pin (Complex Flow) ---
    if (action === 'create_pin') {
      if (!pinData?.imageBase64) throw new Error("Missing image data");

      // 1. Convert Base64 to Binary
      const binaryString = atob(pinData.imageBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 2. Register Media Upload
      const registerRes = await fetch(`${PINTEREST_API}/media`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ media_type: 'image' })
      });
      
      const registerData = await registerRes.json();
      if (!registerRes.ok) throw new Error(`Media Register Failed: ${JSON.stringify(registerData)}`);

      const { media_id, upload_url, upload_parameters } = registerData;

      // 3. Upload Image to S3 (Using the parameters provided by Pinterest)
      const formData = new FormData();
      // Add all auth fields required by S3
      Object.entries(upload_parameters).forEach(([key, value]) => {
          formData.append(key, value);
      });
      // Add the file last
      formData.append('file', new Blob([bytes], { type: 'image/png' }));

      const uploadRes = await fetch(upload_url, {
          method: 'POST',
          body: formData
      });

      if (!uploadRes.ok) throw new Error("Image Upload to Pinterest S3 Failed");

      // 4. Create the Pin
      const pinPayload = {
        title: pinData.title,
        description: pinData.description,
        link: pinData.link,
        board_id: boardId,
        media_source: {
            source_type: 'media_id',
            cover_image_id: media_id,
            media_id: media_id
        }
      };

      const createRes = await fetch(`${PINTEREST_API}/pins`, {
          method: 'POST',
          headers: { 
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(pinPayload)
      });

      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(`Pin Creation Failed: ${JSON.stringify(createData)}`);

      return new Response(JSON.stringify({ success: true, data: createData }), { status: 201, headers });
    }

    return new Response(JSON.stringify({ error: 'Unknown Action' }), { status: 400, headers });

  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
}