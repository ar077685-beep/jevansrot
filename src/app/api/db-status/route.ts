import { NextResponse } from 'next/server';
import { testMySqlConnection, initMySqlTables } from '../../../server/mysql';

export async function GET() {
  const result = await testMySqlConnection();
  
  if (result.success) {
    // If ping successful, make sure tables exist
    await initMySqlTables();
  }

  return NextResponse.json({
    mysql: {
      connected: result.success,
      message: result.message,
      host: result.host,
      database: process.env.MYSQL_DATABASE || 'if0_43284891_JEEVANSROTDB',
      user: process.env.MYSQL_USER || 'if0_43284891',
      port: process.env.MYSQL_PORT || 3306,
    },
    note: result.success
      ? 'Database is active and ready!'
      : 'If you are using InfinityFree, please note that free InfinityFree MySQL databases require the exact MySQL Hostname (e.g., sql300.infinityfree.com found in your InfinityFree control panel under Database Details). Also note that free InfinityFree accounts block external remote MySQL connections from outside their hosting servers.',
  });
}
