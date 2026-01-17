import { apiResponse } from "@/lib/apiHelper";
import { createApiHandler } from "@/lib/apiHandler";

async function handlePost(req, res) {
  try {
    // For JWT-based auth, we don't need to do anything server-side
    // The client will remove the token from localStorage
    // We could optionally maintain a blacklist of invalidated tokens
    // but for simplicity, we'll just return success
    
    return res
      .status(200)
      .json(apiResponse(true, null, "Logout berhasil"));

  } catch (error) {
    console.error("Error during logout:", error);
    return res
      .status(500)
      .json(apiResponse(false, null, "Terjadi kesalahan server", error.message));
  }
}

export default createApiHandler({
  POST: handlePost,
});