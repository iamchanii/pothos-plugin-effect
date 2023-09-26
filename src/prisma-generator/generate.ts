import { GeneratorOptions } from '@prisma/generator-helper';
import camelCase from 'camelcase';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { ModuleKind, Node, Project, ScriptTarget, VariableDeclarationKind } from 'ts-morph';
import {
  AddPrismaEffectImplementation,
  AddPrismaEffectInterface,
  FindAndPatchPrismaDelegateInterfaceDeclarations,
  GetPrismaClientGeneratorOutputLocation,
  GetPrismaClientModule,
  InsertEffectImportDeclarations,
  InsertPothosEffectPrismaClientImportDeclaration,
  InsertPrismaDelegateDecalarations,
  InsertPrismaImportDeclarations,
  PrismaClientGeneratorOutputLocation,
  PrismaClientModule,
  PrismaDelegateInterfaceDeclaration,
} from './types';

const modelOperations: Record<string, { nullable: boolean }> = {
  findUnique: { nullable: true },
  findUniqueOrThrow: { nullable: false },
  findFirst: { nullable: true },
  findFirstOrThrow: { nullable: false },
  findMany: { nullable: false },
  create: { nullable: false },
  delete: { nullable: false },
  update: { nullable: false },
  deleteMany: { nullable: false },
  updateMany: { nullable: false },
  upsert: { nullable: false },
  count: { nullable: false },
  aggregate: { nullable: false },
  groupBy: { nullable: false },
};

const getPrismaClientGeneratorOutputLocation: GetPrismaClientGeneratorOutputLocation = (otherGenerators) => {
  const prismaClientGeneratorOutputLocation = otherGenerators
    .find(it => it.provider.value === 'prisma-client-js')?.output?.value;

  if (!prismaClientGeneratorOutputLocation) {
    throw new Error('prisma-client-js generator not found');
  }

  return prismaClientGeneratorOutputLocation as PrismaClientGeneratorOutputLocation;
};

const getPrismaClientModule: GetPrismaClientModule = (prismaClientGeneratorOutputLocation) => {
  const actualPrismaClientGeneratorOutputLocation = resolve(
    prismaClientGeneratorOutputLocation,
    '../../.prisma/client/index.d.ts',
  );

  const prismaClientProject = new Project();
  const sourceFile = prismaClientProject.addSourceFileAtPath(actualPrismaClientGeneratorOutputLocation);

  return sourceFile.getModule('Prisma') as PrismaClientModule;
};

const findAndPatchPrismaDelegateInterfaceDeclarations: FindAndPatchPrismaDelegateInterfaceDeclarations = (
  prismaClientModule,
  models,
) => {
  return models.map(model => {
    const interfaceName = `${model.name}Delegate`;
    const interfaceDeclaration = prismaClientModule.getInterfaceOrThrow(interfaceName);

    const targetIdentifiersSet = new Set([
      `BatchPayload`,
      `ExcludeUnderscoreKeys`,
      `Extends`,
      `False`,
      `Get${model.name}AggregateType`,
      `Get${model.name}GroupByPayload`,
      `GetHavingFields`,
      `GetScalarType`,
      `Has`,
      `Keys`,
      `MaybeTupleToUnion`,
      `Or`,
      `Prisma__${model.name}Client`,
      `SelectSubset`,
      `Subset`,
      `SubsetIntersection`,
      `True`,
    ]);

    interfaceDeclaration.forEachChild(visitor);

    return interfaceDeclaration as PrismaDelegateInterfaceDeclaration;

    function visitor(node: Node) {
      if (Node.isTypeReference(node)) {
        const typename = node.getTypeName().print();
        const shouldUpdateTypename = targetIdentifiersSet.has(typename) || typename.startsWith(model.name);

        if (shouldUpdateTypename) {
          node.replaceWithText(`Prisma.${node.print()}`);
        }
      }

      if (Node.isMethodSignature(node)) {
        let returnType = `Awaited<${node.getReturnType().getText()}>`;

        const { nullable } = modelOperations[node.getName()];
        if (nullable) {
          returnType = `Option.Option<${returnType}>`;
        }

        node.setReturnType(`Effect.Effect<never, never, ${returnType}>`);
      }

      node.forEachChild(visitor);
    }
  });
};

const insertPrismaImportDeclarations: InsertPrismaImportDeclarations = (
  sourceFile,
  prismaClientGeneratorOutputLocation,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: '@prisma/client/runtime/library',
    namespaceImport: 'runtime',
  });

  sourceFile.addStatements(writer =>
    writer
      .writeLine('import $Utils = runtime.Types.Utils;')
      .writeLine('import $Extensions = runtime.Types.Extensions;')
      .writeLine('import $Result = runtime.Types.Result;')
  );

  sourceFile.addImportDeclaration({
    moduleSpecifier: prismaClientGeneratorOutputLocation,
    namedImports: ['Prisma', 'PrismaClient'],
  });
};

const insertPrismaDelegateDecalarations: InsertPrismaDelegateDecalarations = (
  sourceFile,
  prismaDelegateInterfaceDeclarations,
) => {
  sourceFile.addInterfaces(prismaDelegateInterfaceDeclarations.map(it => it.getStructure()));
};

const insertEffectImportDeclarations: InsertEffectImportDeclarations = (sourceFile) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'effect',
    namedImports: ['Effect', 'Context', 'Option', 'pipe'],
  });
};

const insertPothosEffectPrismaClientImportDeclaration: InsertPothosEffectPrismaClientImportDeclaration = (
  sourceFile,
) => {
  sourceFile.addImportDeclaration({
    moduleSpecifier: 'pothos-plugin-effect/prisma/internal',
    namedImports: ['PothosEffectPrismaClient', 'effectify'],
  });
};

const addPrismaEffectInterface: AddPrismaEffectInterface = (sourceFile, models) => {
  sourceFile.addInterface({
    name: 'PrismaEffect',
    isExported: true,
    properties: models.map(model => ({
      name: camelCase(model.name),
      type: `${model.name}Delegate`,
    })),
  });
};

const addPrismaEffectImplementation: AddPrismaEffectImplementation = (sourceFile, dmmf) => {
  sourceFile.addVariableStatement({
    isExported: true,
    declarationKind: VariableDeclarationKind.Const,
    declarations: [{
      name: 'PrismaEffect',
      type: 'PrismaEffect',
      initializer: writer =>
        writer.writeLine(`{
          ${
          dmmf.datamodel.models.map(model =>
            `${camelCase(model.name)}: {
              ${
              Object.entries(modelOperations).map(([operation, { nullable }]) =>
                `${operation}: effectify("${camelCase(model.name)}", "${operation}", ${nullable})`
              ).join(
                ',\n',
              )
            }
            }`
          ).join(',\n')
        }
        `),
    }],
  });
};

export async function generate({ generator, otherGenerators, dmmf }: GeneratorOptions) {
  const project = new Project({
    useInMemoryFileSystem: true,
    compilerOptions: { declaration: true, module: ModuleKind.ESNext, target: ScriptTarget.ESNext },
  });

  const sourceFile = project.createSourceFile('generated.ts');

  const prismaClientGeneratorOutputLocation = getPrismaClientGeneratorOutputLocation(otherGenerators);
  const prismaClientModule = getPrismaClientModule(prismaClientGeneratorOutputLocation);
  const prismaDelegateDeclaration = findAndPatchPrismaDelegateInterfaceDeclarations(
    prismaClientModule,
    dmmf.datamodel.models,
  );

  insertPrismaImportDeclarations(sourceFile, prismaClientGeneratorOutputLocation);
  insertPrismaDelegateDecalarations(sourceFile, prismaDelegateDeclaration);
  insertEffectImportDeclarations(sourceFile);
  insertPothosEffectPrismaClientImportDeclaration(sourceFile);

  addPrismaEffectInterface(sourceFile, dmmf.datamodel.models);
  addPrismaEffectImplementation(sourceFile, dmmf);

  await project.emit(); // async

  const fs = project.getFileSystem();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const outputLocation = generator.output!.value!;
  await mkdir(dirname(outputLocation), { recursive: true });
  await writeFile(resolve(outputLocation, 'generated.mjs'), fs.readFileSync('/generated.js', 'utf-8'));
  await writeFile(resolve(outputLocation, 'generated.d.ts'), fs.readFileSync('/generated.d.ts', 'utf-8'));

  return;
}
