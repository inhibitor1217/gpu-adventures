import { warn } from './log'

const includeStatementRegExp = /(?:^|\n)#include\s*<(?!sceneUboDeclaration|meshUboDeclaration)([^>]+)>/g

function loadFromIncludePath(includePath: string): Promise<string> {
  return import(`./lib/${includePath}.wgsl?raw`)
    .then((module) => module.default)
    .catch(() => {
      warn(`Failed to load included shader lib: ${includePath}`)
      return ''
    })
}

async function resolveFromIncludePath(
  includePath: string,
  context: Map<string, string>,
): Promise<string> {
  if (context.has(includePath)) {
    return ''
  }

  const source = await loadFromIncludePath(includePath)
  const preprocessed = await _preprocess(source, context)
  context.set(includePath, preprocessed)
  return preprocessed
}

async function _preprocess(
  source: string,
  context: Map<string, string>,
): Promise<string> {
  if (!source) {
    return source
  }

  const resolved = await Promise.all(
    [...source.matchAll(includeStatementRegExp)]
      .map((match) => {
        const [matched, includePath] = match
        const start = match.index!
        const end = start + matched.length

        return resolveFromIncludePath(includePath, context)
          .then(src => ({ start, end, src }))
      })
  )

  return resolved.reduceRight(
    (acc, { start, end, src }) => acc.slice(0, start) + src + acc.slice(end),
    source,
  )
}

export function preprocess(source: string): Promise<string> {
  return _preprocess(source, new Map())
}
