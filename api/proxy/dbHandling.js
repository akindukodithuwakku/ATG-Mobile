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

  if (method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const apiUrl =
      "https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/dbHandling";

    console.log(`Proxying dbHandling request to: ${apiUrl}`);
    console.log(`Request body:`, body);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log(`Response status: ${response.status}`);
    console.log(
      `Response headers:`,
      Object.fromEntries(response.headers.entries())
    );

    // Check if response is JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log(`Response data:`, data);
      res.status(response.status).json(data);
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      console.log(`Response text:`, text);
      res.status(response.status).send(text);
    }
  } catch (error) {
    console.error("dbHandling proxy error:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to proxy dbHandling request to AWS API Gateway",
      details: {
        method,
        body: body,
      },
    });
  }
}
