import { getTokenFromHeader, verifyToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";

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

    // Get database connection info
    const connectionInfo = await getDatabaseConnections();

    // Get table statistics
    const tableStats = await getTableStatistics();

    // Get query performance
    const queryPerformance = await getQueryPerformance();

    // Get general database info
    const dbInfo = await getDatabaseInfo();

    const databaseInfo = {
      connection: connectionInfo,
      tables: tableStats,
      performance: queryPerformance,
      info: dbInfo,
    };

    return res.status(200).json({
      success: true,
      data: databaseInfo,
    });
  } catch (error) {
    console.error("Database info error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get database information",
      error: error.message,
    });
  }
}

// Get database connections
async function getDatabaseConnections() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        max_conn.setting::int as max_connections
      FROM pg_stat_activity
      CROSS JOIN (SELECT setting FROM pg_settings WHERE name = 'max_connections') max_conn
    `;

    return {
      total: parseInt(result[0]?.total_connections) || 0,
      active: parseInt(result[0]?.active_connections) || 0,
      idle: parseInt(result[0]?.idle_connections) || 0,
      max: parseInt(result[0]?.max_connections) || 100,
    };
  } catch {
    return {
      total: 0,
      active: 0,
      idle: 0,
      max: 100,
    };
  }
}

// Get table statistics
async function getTableStatistics() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_stat_user_tables
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;

    return result.map((table) => ({
      schema: table.schemaname,
      name: table.tablename,
      inserts: parseInt(table.inserts) || 0,
      updates: parseInt(table.updates) || 0,
      deletes: parseInt(table.deletes) || 0,
      liveTuples: parseInt(table.live_tuples) || 0,
      deadTuples: parseInt(table.dead_tuples) || 0,
      size: table.size || "0 bytes",
    }));
  } catch {
    return [];
  }
}

// Get query performance
async function getQueryPerformance() {
  try {
    const result = await prisma.$queryRaw`
      SELECT 
        calls,
        total_time,
        mean_time,
        min_time,
        max_time,
        rows,
        substring(query, 1, 100) as query_preview
      FROM pg_stat_statements
      WHERE calls > 10
      ORDER BY total_time DESC
      LIMIT 5
    `;

    return result.map((query) => ({
      calls: parseInt(query.calls) || 0,
      totalTime: parseFloat(query.total_time) || 0,
      meanTime: parseFloat(query.mean_time) || 0,
      minTime: parseFloat(query.min_time) || 0,
      maxTime: parseFloat(query.max_time) || 0,
      rows: parseInt(query.rows) || 0,
      query: query.query_preview || "N/A",
    }));
  } catch {
    return [];
  }
}

// Get general database info
async function getDatabaseInfo() {
  try {
    const versionResult = await prisma.$queryRaw`SELECT version()`;
    const sizeResult = await prisma.$queryRaw`
      SELECT pg_size_pretty(pg_database_size(current_database())) as db_size
    `;

    return {
      version: versionResult[0]?.version || "Unknown",
      size: sizeResult[0]?.db_size || "Unknown",
      encoding: "UTF8",
      collation: "en_US.UTF-8",
    };
  } catch {
    return {
      version: "Unknown",
      size: "Unknown",
      encoding: "UTF8",
      collation: "en_US.UTF-8",
    };
  }
}
