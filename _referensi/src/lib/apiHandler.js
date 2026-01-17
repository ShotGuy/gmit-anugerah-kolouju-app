// lib/apiHandler.js

export function createApiHandler({ GET, POST, PUT, DELETE, PATCH }) {
  return async function handler(req, res) {
    const { method } = req;

    try {
      switch (method) {
        case "GET":
          if (GET) return await GET(req, res);
          break;
        case "POST":
          if (POST) return await POST(req, res);
          break;
        case "PUT":
          if (PUT) return await PUT(req, res);
          break;
        case "DELETE":
          if (DELETE) return await DELETE(req, res);
          break;
        case "PATCH":
          if (PATCH) return await PATCH(req, res);
          break;
        default:
          break;
      }

      res.setHeader("Allow", [
        ...(GET ? ["GET"] : []),
        ...(POST ? ["POST"] : []),
        ...(PUT ? ["PUT"] : []),
        ...(DELETE ? ["DELETE"] : []),
        ...(PATCH ? ["PATCH"] : []),
      ]);

      return res
        .status(405)
        .json({ success: false, message: `Method ${method} not allowed` });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      });
    }
  };
}
