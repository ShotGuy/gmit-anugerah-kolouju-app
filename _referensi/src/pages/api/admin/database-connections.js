import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import {
  getDatabaseConnectionInfo,
  getRealtimeConnectionMetrics
} from "@/lib/databaseMonitoring";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check if user is authenticated and has admin role
    const token = getTokenFromHeader(req.headers.authorization);
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
      });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    // Get connection type from query parameter
    const { type = 'full' } = req.query;

    let connectionData;

    if (type === 'realtime') {
      // Get quick real-time metrics for frequent updates
      connectionData = await getRealtimeConnectionMetrics();
    } else {
      // Get full connection information
      connectionData = await getDatabaseConnectionInfo();
    }

    const responseData = {
      success: true,
      data: connectionData,
      type: type,
      timestamp: new Date().toISOString(),
      message: `Database connection ${type} monitoring data retrieved successfully`
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error("Database connections monitoring error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get database connection information",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}