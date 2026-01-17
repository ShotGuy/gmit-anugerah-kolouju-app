import fs from "fs/promises";
import os from "os";

import { getTokenFromHeader, verifyToken } from "@/lib/jwt";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    // Check if user is authenticated and has admin role
    const token = getTokenFromHeader(req.headers.authorization);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = await verifyToken(token);

    if (!decoded || decoded.role !== "ADMIN") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access",
      });
    }

    // Get system information
    const systemInfo = {
      uptime: os.uptime(),
      platform: os.platform(),
      architecture: os.arch(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      loadAverage: os.loadavg()[0].toFixed(2),
      connections: process._getActiveHandles?.()?.length || 0,
      status: "healthy",

      // CPU Info
      cpu: {
        cores: os.cpus().length,
        model: os.cpus()[0]?.model || "Unknown",
        usage: await getCpuUsage(),
      },

      // Memory Info
      memory: {
        total: os.totalmem(),
        used: os.totalmem() - os.freemem(),
        usage: (((os.totalmem() - os.freemem()) / os.totalmem()) * 100).toFixed(
          1
        ),
      },

      // Disk Info
      disk: await getDiskUsage(),

      // Network Info
      network: getNetworkInfo(),
    };

    return res.status(200).json({
      success: true,
      data: systemInfo,
    });
  } catch (error) {
    console.error("System info error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get system information",
      error: error.message,
    });
  }
}

// Helper function to get CPU usage
async function getCpuUsage() {
  const cpus = os.cpus();
  let totalIdle = 0;
  let totalTick = 0;

  cpus.forEach((cpu) => {
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  });

  const idle = totalIdle / cpus.length;
  const total = totalTick / cpus.length;
  const usage = 100 - Math.floor((idle / total) * 100);

  return usage;
}

// Helper function to get disk usage
async function getDiskUsage() {
  try {
    const stats = await fs.stat(process.cwd());
    // Note: This is a simplified version. For production, you might want to use
    // libraries like 'diskusage' or 'statvfs' for more accurate disk information

    return {
      total: 100 * 1024 * 1024 * 1024, // 100GB placeholder
      used: 50 * 1024 * 1024 * 1024, // 50GB placeholder
      free: 50 * 1024 * 1024 * 1024, // 50GB placeholder
      usage: 50, // 50% placeholder
    };
  } catch (_error) {
    return {
      total: 0,
      used: 0,
      free: 0,
      usage: 0,
    };
  }
}

// Helper function to get network info
function getNetworkInfo() {
  const interfaces = os.networkInterfaces();
  let bytesReceived = 0;
  let bytesSent = 0;
  let packetsReceived = 0;
  let packetsSent = 0;

  // Note: Node.js doesn't provide network usage statistics directly
  // This is placeholder data. For production, you might want to use
  // system commands or libraries to get actual network statistics

  return {
    bytesReceived: 1024 * 1024 * 100, // 100MB placeholder
    bytesSent: 1024 * 1024 * 80, // 80MB placeholder
    packetsReceived: 10000, // placeholder
    packetsSent: 8000, // placeholder
  };
}
