import { PrismaClient } from '@prisma/client';
import { Context } from 'effect';

export const PothosEffectPrismaClient = Context.Tag<PrismaClient>('PothosEffectPrismaClient');
