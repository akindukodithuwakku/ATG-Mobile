export default async function handler(req, res) {
  const { method, body } = req;

  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, Origin"
  );

  if (method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Extract the path from the request
    const path = req.url.replace("/api/proxy", "");
    const apiUrl = `https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev${path}`;

    console.log(`Proxying request to: ${apiUrl}`);

    const response = await fetch(apiUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: method !== "GET" ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    console.log(`Response status: ${response.status}`);
    console.log(`Response data:`, data);

    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to proxy request to AWS API Gateway",
    });
  }
}
