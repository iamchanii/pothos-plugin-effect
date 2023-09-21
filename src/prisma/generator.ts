/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { DMMF, GeneratorConfig, GeneratorOptions, generatorHandler } from '@prisma/generator-helper';
import camelCase from 'camelcase';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

const __dirname = dirname(new URL(import.meta.url).pathname);

const defaultOutput = resolve(__dirname);

const printer = ts.createPrinter({
  newLine: ts.NewLineKind.LineFeed,
  removeComments: false,
});

function getEffectImport() {
  const modules = ['Effect', 'Context', 'Option', 'pipe'];

  return ts.factory.createImportDeclaration(
    [],
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        modules.map(mod =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(mod),
          )
        ),
      ),
    ),
    ts.factory.createStringLiteral('effect'),
  );
}

function makeFindPrismaStatement(generators: GeneratorConfig[]) {
  const prismaTypeDeclarationFileLocation = resolve(
    generators
      .find(it => it.provider.value === 'prisma-client-js')!.output!.value!
      .replace('../', '../../'),
    '../../.prisma/client',
    'index.d.ts',
  );

  const program = ts.createProgram([prismaTypeDeclarationFileLocation], {});

  const sourceFile = program.getSourceFile(prismaTypeDeclarationFileLocation);
  if (!sourceFile) {
    throw new Error(`Could not find source file at ${prismaTypeDeclarationFileLocation}`);
  }

  const prismaNamespace = sourceFile.statements.find(ts.isModuleDeclaration);
  if (!prismaNamespace) {
    throw new Error('Could not find prisma namespace');
  }
  return function<T extends ts.Statement>(typeName: string): T | undefined {
    if (!ts.isModuleBlock(prismaNamespace.body!)) {
      throw new Error('Cannot access prisma namespace body');
    }

    return prismaNamespace.body.statements.find(statment => {
      return 'name' in statment
        && typeof statment.name === 'object'
        && statment.name !== null
        && 'text' in statment.name
        && statment.name.text === typeName;
    }) as T | undefined;
  };
}

type FindPrismaStatement = ReturnType<typeof makeFindPrismaStatement>;

function convertPrismaDelegateInterfaces(
  findPrismaType: FindPrismaStatement,
  models: DMMF.Model[],
) {
  const dummySoureFile = ts.createSourceFile(
    '',
    '',
    ts.ScriptTarget.ESNext,
    false,
    ts.ScriptKind.TS,
  );

  return models.map(model => {
    const delegateInterfaceName = `${model.name}Delegate`;

    const delegateInterfaceDeclaration = findPrismaType<ts.InterfaceDeclaration>(delegateInterfaceName);
    if (!delegateInterfaceDeclaration) {
      throw new Error(`Could not find interface declaration for ${delegateInterfaceName}`);
    }

    function visitAndPrefixPrisma(node: ts.Node) {
      const toChangeTypeNames = [
        'SelectSubset',
        `Prisma__${model.name}Client`,
        'BatchPayload',
        'Subset',
        'GetScalarType',
        'Or',
        'Extends',
        'Keys',
        'True',
        'False',
        'Has',
        'ExcludeUnderscoreKeys',
        'MaybeTupleToUnion',
        'GetHavingFields',
        'SubsetIntersection',
        `Get${model.name}AggregateType`,
        `Get${model.name}GroupByPayload`,
      ];

      if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) {
        const escapedTypeText = String(node.typeName.escapedText);
        const shouldPrefix = toChangeTypeNames.includes(escapedTypeText) || escapedTypeText.startsWith(model.name);

        if (shouldPrefix) {
          Object.assign(node.typeName, {
            escapedText: `Prisma.${node.typeName.escapedText}`,
          });
        }
      }

      node.forEachChild(visitAndPrefixPrisma);
    }

    (delegateInterfaceDeclaration as ts.Node).forEachChild(visitAndPrefixPrisma);

    const members = delegateInterfaceDeclaration.members
      .filter(node => node.name && ts.isIdentifier(node.name) && node.name.escapedText !== 'fields')
      .map(node => {
        if (!ts.isMethodSignature(node)) {
          return node;
        }

        return Object.assign(node, {
          type: ts.factory.createTypeReferenceNode(
            `Effect.Effect<never, never, Awaited<${
              printer.printNode(ts.EmitHint.Unspecified, node.type!, dummySoureFile)
            }>>`,
          ),
        });
      });

    return Object.assign(delegateInterfaceDeclaration, {
      members,
    });
  });
}

function getPrismaRuntimeImport() {
  const prismaTypes = ['Utils', 'Extensions', 'Result'];

  return [
    ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamespaceImport(ts.factory.createIdentifier('runtime')),
      ),
      ts.factory.createStringLiteral('@prisma/client/runtime/library'),
    ),
    ...prismaTypes.map(type =>
      ts.factory.createImportEqualsDeclaration(
        undefined,
        false,
        `$${type}`,
        ts.factory.createIdentifier(`runtime.Types.${type}`),
      )
    ),
  ];
}

function getPrismaImport(generators: GeneratorConfig[]) {
  const prismaLocation = join(
    generators
      .find(it => it.provider.value === 'prisma-client-js')!.output!.value!
      .replace('../', '../../'),
    'index.js',
  );

  return ts.factory.createImportDeclaration(
    [],
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('Prisma')),
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('PrismaClient')),
      ]),
    ),
    ts.factory.createStringLiteral(prismaLocation),
  );
}

function getModelOperationKeys(dmmf: DMMF.Document, modelName: string) {
  const operations = dmmf.mappings.modelOperations.find(it => it.model === modelName);
  const operationKeys = Object.keys(operations || {})
    .reduce(
      (acc, key) => key === 'model' ? acc : [...acc, key.replace(/One$/, '')],
      [] as string[],
    );

  return operationKeys;
}

function generatePrismaEffectInterface(dmmf: DMMF.Document) {
  const types = dmmf.datamodel.models.map(model => {
    return ts.factory.createPropertySignature(
      [],
      camelCase(model.name),
      undefined,
      ts.factory.createTypeReferenceNode(`${model.name}Delegate`),
    );
  });

  return ts.factory.createInterfaceDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    'PrismaEffect',
    [],
    [],
    types,
  );
}

function generatePrismaEffectInternalTag() {
  const declaration = ts.factory.createVariableDeclaration(
    'PrismaEffectInternal__PrismaClient',
    undefined,
    undefined,
    ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('Context'),
        ts.factory.createIdentifier('Tag'),
      ),
      [ts.factory.createTypeReferenceNode('PrismaClient')],
      [ts.factory.createStringLiteral('pothos-plugin-effect/prisma/PrismaClient')],
    ),
  );

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );
}

function generateEffectifyPrismaMethod() {
  const parameters = [
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'modelName',
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    ),
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'operation',
      undefined,
      ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    ),
  ];

  return ts.factory.createFunctionDeclaration(
    undefined,
    undefined,
    'effectifyPrismaMethod',
    undefined,
    parameters,
    undefined,
    ts.factory.createBlock([
      ts.factory.createReturnStatement(
        ts.factory.createArrowFunction(
          undefined,
          undefined,
          [ts.factory.createParameterDeclaration(
            undefined,
            ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
            'args',
            undefined,
            ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)),
          )],
          undefined,
          undefined,
          ts.factory.createIdentifier(`pipe(
Effect.serviceOption(PrismaEffectInternal__PrismaClient),
Effect.flatMap(optionPrisma =>
  Option.match(optionPrisma, {
    onNone: () => Effect.die('message'),
    onSome: (prisma) =>
      Effect.promise<any>(() => {
        return (prisma as any)[modelName][operation](...args);
      }),
  })))`),
        ),
      ),
    ]),
  );
}

function generatePrismaEffectImplementation(dmmf: DMMF.Document) {
  const models = dmmf.datamodel.models.map(model => {
    const operationKeys = [...getModelOperationKeys(dmmf, model.name), 'count'];
    const camelcasedModelName = camelCase(model.name);
    const properties = operationKeys.map(operation => {
      return ts.factory.createPropertyAssignment(
        operation,
        ts.factory.createCallExpression(
          ts.factory.createIdentifier('effectifyPrismaMethod'),
          undefined,
          [ts.factory.createStringLiteral(camelcasedModelName), ts.factory.createStringLiteral(operation)],
        ),
      );
    });

    return ts.factory.createPropertyAssignment(
      camelcasedModelName,
      ts.factory.createObjectLiteralExpression(properties),
    );
  });

  const declaration = ts.factory.createVariableDeclaration(
    'PrismaEffect',
    undefined,
    ts.factory.createTypeReferenceNode('PrismaEffect'),
    ts.factory.createObjectLiteralExpression(models),
  );

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList([declaration], ts.NodeFlags.Const),
  );
}

async function onGenerate(options: GeneratorOptions) {
  // 폴더 생성하기

  // .d.ts 손으로 만들기 (...)
  // - export interface PrismaEffect
  // - export declare const PrismaEffect: PrismaEffect
  // - export declare const PrismaEffectPrismaClient: Context.Tag<PrismaClient>

  // .mjs 코드 뽑기
  // - export const PrismaEffect
  // function effectifyPrismaMethod
  // const PrismaEffectPrismaClient

  // index.mjs 업데이트
  // export { PrismaEffect } from './generated.mjs';

  const outputLocation = options.generator.output?.value ?? defaultOutput;
  const findPrismaStatement = makeFindPrismaStatement(options.otherGenerators);

  const prismaRuntimeImport = getPrismaRuntimeImport();
  const effectImport = getEffectImport();
  const prismaImport = getPrismaImport(options.otherGenerators);
  const interfaces = convertPrismaDelegateInterfaces(findPrismaStatement, options.dmmf.datamodel.models);
  const prismaEffectInterfaceDeclaration = generatePrismaEffectInterface(options.dmmf);
  const prismaEffectInternalTag = generatePrismaEffectInternalTag();
  const effectifyPrismaMethod = generateEffectifyPrismaMethod();
  const prismaEffectImplementation = generatePrismaEffectImplementation(options.dmmf);

  const sourceFile = ts.factory.createSourceFile(
    [
      ...prismaRuntimeImport,
      effectImport,
      prismaImport,
      ...interfaces,
      prismaEffectInterfaceDeclaration,
      prismaEffectInternalTag,
      effectifyPrismaMethod,
      prismaEffectImplementation,
    ],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );

  const code = printer.printFile(sourceFile);
  const transfiledCode = ts.transpile(code, { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ESNext });
  await mkdir(outputLocation, { recursive: true });
  await writeFile(resolve(outputLocation, 'generated.d.ts'), `/* eslint-disable */\n${code}`);
  await writeFile(resolve(outputLocation, 'generated.mjs'), `/* eslint-disable */\n${transfiledCode}`);
  await writeFile(resolve(outputLocation, 'index.mjs'), `export * from './generated.mjs';\n`);
}

generatorHandler({
  onManifest() {
    return {
      prettyName: 'pothos-plugin-effect Integration',
      requiresGenerators: ['prisma-client-js'],
      defaultOutput,
    };
  },
  onGenerate,
});
