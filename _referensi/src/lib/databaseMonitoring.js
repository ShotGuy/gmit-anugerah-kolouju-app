import { PrismaClient } from "@prisma/client";
// import { supabase } from "./supabaseClient";

const prisma = new PrismaClient();

// Get real-time database connection information
export async function getDatabaseConnectionInfo() {
  try {
    const connectionInfo = {
      // Supabase connection info - DISABLED
      // supabase: await getSupabaseConnectionInfo(),

      // Prisma connection pool info
      prisma: await getPrismaConnectionInfo(),

      // Database server stats
      serverStats: await getDatabaseServerStats(),

      // Connection performance metrics
      performance: await getConnectionPerformanceMetrics(),

      // Real-time monitoring
      realTime: {
        timestamp: new Date().toISOString(),
        status: 'active',
        uptime: process.uptime()
      }
    };

    return connectionInfo;
  } catch (error) {
    console.error('Error getting database connection info:', error);
    throw error;
  }
}

// Get Supabase specific connection information - DISABLED
async function getSupabaseConnectionInfo() {
  return null;
}

// Get Prisma connection pool information
async function getPrismaConnectionInfo() {
  try {
    // Test Prisma connection with a simple query
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - startTime;

    // Get connection pool status (if available)
    const databaseUrl = process.env.DATABASE_URL;

    // Extract connection info from DATABASE_URL
    const connectionParams = parseDatabaseUrl(databaseUrl);

    return {
      status: 'connected',
      responseTime: responseTime,
      connectionUrl: databaseUrl ? maskConnectionString(databaseUrl) : 'Not configured',
      database: connectionParams.database || 'unknown',
      host: connectionParams.host || 'unknown',
      port: connectionParams.port || 5432,
      ssl: connectionParams.ssl || false,
      pooling: {
        // Prisma doesn't expose pool stats directly, but we can infer
        status: 'active',
        maxConnections: 10, // Default for serverless
        activeConnections: 'unknown', // Would need custom implementation
        idleConnections: 'unknown'
      },
      lastQuery: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      lastQuery: new Date().toISOString()
    };
  }
}

// Get database server statistics
async function getDatabaseServerStats() {
  try {
    // Get database size and statistics
    const stats = await Promise.allSettled([
      // Database size query
      prisma.$queryRaw`
        SELECT
          pg_size_pretty(pg_database_size(current_database())) as database_size,
          current_database() as database_name
      `,

      // Connection count
      prisma.$queryRaw`
        SELECT
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database()
      `,

      // Database uptime and version
      prisma.$queryRaw`
        SELECT
          version() as postgresql_version,
          pg_postmaster_start_time() as server_start_time,
          EXTRACT(EPOCH FROM (now() - pg_postmaster_start_time())) as uptime_seconds
      `,

      // Table statistics
      prisma.$queryRaw`
        SELECT
          count(*) as total_tables,
          sum(n_tup_ins) as total_inserts,
          sum(n_tup_upd) as total_updates,
          sum(n_tup_del) as total_deletes
        FROM pg_stat_user_tables
      `
    ]);

    const [sizeResult, connectionsResult, versionResult, tablesResult] = stats;

    return {
      size: sizeResult.status === 'fulfilled' ? serializeBigInt(sizeResult.value[0]) : null,
      connections: connectionsResult.status === 'fulfilled' ? serializeBigInt(connectionsResult.value[0]) : null,
      version: versionResult.status === 'fulfilled' ? serializeBigInt(versionResult.value[0]) : null,
      tables: tablesResult.status === 'fulfilled' ? serializeBigInt(tablesResult.value[0]) : null,
      errors: stats.filter(s => s.status === 'rejected').map(s => s.reason?.message)
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Get connection performance metrics
async function getConnectionPerformanceMetrics() {
  try {
    const startTime = Date.now();

    // Test query performance
    const [
      simpleQuery,
      countQuery,
      joinQuery
    ] = await Promise.allSettled([
      // Simple query
      measureQueryTime(() => prisma.user.findFirst()),

      // Count query
      measureQueryTime(() => prisma.user.count()),

      // Join query
      measureQueryTime(() => prisma.user.findFirst({
        include: { jemaat: true }
      }))
    ]);

    return {
      totalResponseTime: Date.now() - startTime,
      queries: {
        simple: simpleQuery.status === 'fulfilled' ? simpleQuery.value : { error: simpleQuery.reason?.message },
        count: countQuery.status === 'fulfilled' ? countQuery.value : { error: countQuery.reason?.message },
        join: joinQuery.status === 'fulfilled' ? joinQuery.value : { error: joinQuery.reason?.message }
      },
      averageResponseTime: calculateAverageResponseTime([simpleQuery, countQuery, joinQuery]),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper function to measure query execution time
async function measureQueryTime(queryFunction) {
  const startTime = Date.now();
  try {
    const result = await queryFunction();
    const executionTime = Date.now() - startTime;
    return {
      executionTime,
      status: 'success',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    return {
      executionTime,
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

// Helper function to calculate average response time
function calculateAverageResponseTime(results) {
  const successfulResults = results.filter(r => r.status === 'fulfilled' && r.value.status === 'success');
  if (successfulResults.length === 0) return null;

  const totalTime = successfulResults.reduce((sum, r) => sum + r.value.executionTime, 0);
  return Math.round(totalTime / successfulResults.length);
}

// Helper function to serialize BigInt values
function serializeBigInt(obj) {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

// Helper function to parse database URL
function parseDatabaseUrl(url) {
  if (!url) return {};

  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port,
      database: parsed.pathname.substring(1),
      username: parsed.username,
      ssl: parsed.searchParams.get('sslmode') !== 'disable'
    };
  } catch (error) {
    return {};
  }
}

// Helper function to mask sensitive connection string
function maskConnectionString(url) {
  if (!url) return 'Not configured';

  return url.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@');
}

// Helper function to get Supabase region from URL
function getSupabaseRegion(url) {
  if (!url) return 'unknown';

  try {
    const match = url.match(/\.supabase\.co$/);
    if (match) {
      // Extract region from subdomain if available
      const subdomain = url.split('//')[1].split('.')[0];
      return subdomain.includes('-') ? subdomain.split('-').slice(-1)[0] : 'us-east-1';
    }
    return 'custom';
  } catch (error) {
    return 'unknown';
  }
}

// Real-time connection monitoring
export async function getRealtimeConnectionMetrics() {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),

      // Quick health checks
      supabaseHealth: await quickSupabaseHealthCheck(),
      prismaHealth: await quickPrismaHealthCheck(),

      // Connection counts (if available)
      connectionCounts: await getCurrentConnectionCounts(),

      // Performance snapshot
      performanceSnapshot: await getPerformanceSnapshot()
    };

    return metrics;
  } catch (error) {
    return {
      timestamp: new Date().toISOString(),
      error: error.message,
      status: 'error'
    };
  }
}

// Quick health checks for real-time monitoring
async function quickSupabaseHealthCheck() {
  return null;
}
/*
async function quickSupabaseHealthCheck() {
  const startTime = Date.now();
  try {
    const { data, error } = await supabase.auth.getSession();
    return {
      status: error ? 'error' : 'healthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}
*/

async function quickPrismaHealthCheck() {
  const startTime = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'error',
      responseTime: Date.now() - startTime,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function getCurrentConnectionCounts() {
  try {
    const result = await prisma.$queryRaw`
      SELECT
        count(*) as total,
        count(*) FILTER (WHERE state = 'active') as active,
        count(*) FILTER (WHERE state = 'idle') as idle,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;

    return serializeBigInt(result[0]) || {};
  } catch (error) {
    return { error: error.message };
  }
}

async function getPerformanceSnapshot() {
  const startTime = Date.now();
  try {
    // Simple performance test
    await prisma.user.count();

    return {
      queryTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      status: 'success'
    };
  } catch (error) {
    return {
      queryTime: Date.now() - startTime,
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    };
  }
}

export { prisma };

