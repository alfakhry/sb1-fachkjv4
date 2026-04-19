/**
 * Singleton Prisma client instance.
 * Import this everywhere DB access is needed — never instantiate PrismaClient directly.
 */
import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=prisma.d.ts.map