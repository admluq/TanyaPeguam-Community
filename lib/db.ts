/**
 * Prisma Client singleton
 * Prevents multiple instances during dev hot-reload.
 *
 * Includes the "Anti-Reset Lock" middleware: any UPDATE on DonnaBridge
 * that attempts to mutate `initialQuestion` or `initialAnswer` is rejected.
 * These fields are the immutable Source of Truth (the original FB question +
 * the lawyer's pre-vet answer) and must never change after createBridge().
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makeClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  // ── Anti-Reset Lock ─────────────────────────────────────────────
  client.$use(async (params, next) => {
    if (params.model === 'DonnaBridge') {
      // Block mutation of immutable fields on update / updateMany / upsert
      const data =
        params.action === 'upsert'
          ? (params.args as any)?.update
          : (params.args as any)?.data;

      if (data && (params.action === 'update' || params.action === 'updateMany' || params.action === 'upsert')) {
        const blocked = ['initialQuestion', 'initialAnswer'].filter((k) => k in data);
        if (blocked.length > 0) {
          throw new Error(
            `IMMUTABLE_FIELD_VIOLATION: Cannot update DonnaBridge.${blocked.join(', ')} ` +
              `after creation. These fields are the immutable Source of Truth. ` +
              `Use lib/bridge.ts.appendTurn() to add chat turns instead.`
          );
        }
      }
    }
    return next(params);
  });

  return client;
}

export const db = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

export default db;
