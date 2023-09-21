import { DMMF, GeneratorConfig } from '@prisma/generator-helper';
import { InterfaceDeclaration, ModuleDeclaration, SourceFile } from 'ts-morph';

declare const __brand: unique symbol;
type Brand<B> = { [__brand]: B };
export type Branded<T, B> = T & Brand<B>;

export type PrismaClientGeneratorOutputLocation = Branded<string, 'PrismaClientGeneratorOutputLocation'>;

export interface GetPrismaClientGeneratorOutputLocation {
  (otherGenerators: GeneratorConfig[]): PrismaClientGeneratorOutputLocation;
}

export type PrismaClientModule = Branded<ModuleDeclaration, 'PrismaClientModule'>;

export interface GetPrismaClientModule {
  (prismaClientGeneratorOutputLocation: PrismaClientGeneratorOutputLocation): PrismaClientModule;
}

export type PrismaDelegateInterfaceDeclaration = Branded<InterfaceDeclaration, 'PrismaDelegateInterfaceDeclaration'>;

export interface FindAndPatchPrismaDelegateInterfaceDeclarations {
  (prismaClientModule: PrismaClientModule, models: DMMF.Model[]): PrismaDelegateInterfaceDeclaration[];
}

export interface InsertPrismaImportDeclarations {
  (sourceFile: SourceFile, prismaClientGeneratorOutputLocation: PrismaClientGeneratorOutputLocation): void;
}

export interface InsertPrismaDelegateDecalarations {
  (sourceFile: SourceFile, prismaDelegateInterfaceDeclarations: PrismaDelegateInterfaceDeclaration[]): void;
}

export interface InsertEffectImportDeclarations {
  (sourceFile: SourceFile): void;
}

export interface InsertPothosEffectPrismaClientImportDeclaration {
  (sourceFile: SourceFile): void;
}

export interface AddPrismaEffectInterface {
  (sourceFile: SourceFile, models: DMMF.Model[]): void;
}

export interface AddPrismaEffectImplementation {
  (sourceFile: SourceFile, dmmf: DMMF.Document): void;
}
