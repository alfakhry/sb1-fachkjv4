/**
 * Singleton Prisma client instance.
 * Import this everywhere DB access is needed — never instantiate PrismaClient directly.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;
