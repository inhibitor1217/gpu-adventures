import { ShaderStore } from 'babylonjs'

import { debug, warn } from './log'

const vertexShaderRegExp = /^(?:.*\/)?([\w.]+)\.vert\.wgsl$/
const fragmentShaderRegExp = /^(?:.*\/)?([\w.]+)\.frag\.wgsl$/

type MaterialShader = {
  vertexShaderFile: string | null
  fragmentShaderFile: string | null
}

function isMissingShader(materialShader: MaterialShader): boolean {
  return !materialShader.vertexShaderFile || !materialShader.fragmentShaderFile
}

type ShaderType = 'Vertex' | 'Fragment'

function loadToBabylonWGSLShaderStore(
  materialName: string,
  shaderType: ShaderType,
  shaderSource: string,
): void {
  const shaderStoreKey = `${materialName}${shaderType}Shader`
  ShaderStore.ShadersStoreWGSL[shaderStoreKey] = shaderSource
}

function logFoundShaderFiles(shaderFiles: Record<string, unknown>): void{
  if (Object.keys(shaderFiles).length === 0) {
    debug('No material shaders found.')
    return
  }

  console.group('Material shaders found:')
  for (const shaderFile of Object.keys(shaderFiles)) {
    debug(`- ${shaderFile}`)
  }
  console.groupEnd()
}

function logFoundMaterials(materialNames: string[]): void {
  if (materialNames.length === 0) {
    debug('No materials found.')
    return
  }

  console.group('Materials found:')
  for (const materialName of materialNames) {
    debug(`- ${materialName}`)
  }
  console.groupEnd()
}

function warnUnknownShaderFile(filename: string): void {
  warn(`Shader file found but not recognized: ${filename}`)
}

function warnDuplicateMaterialShaders(
  materialName: string,
  shaderType: ShaderType,
  foundShaderFile: string,
  existingShaderFile: string,
): void {
  warn(`Material "${materialName}" has multiple ${shaderType} shaders: ${foundShaderFile} and ${existingShaderFile}`)
}

function warnInvalidMaterial(materialName: string): void {
  warn(`Material "${materialName}" is invalid: missing vertex or fragment shader`)
}

function constructMaterialShaders(shaders: Record<string, () => Promise<unknown>>): Record<string, MaterialShader> {
  const shaderFiles: { [materialName: string]: MaterialShader}  = {}

  for (const shaderFile of Object.keys(shaders)) {
    const vertexShaderMatch = shaderFile.match(vertexShaderRegExp)
    const fragmentShaderMatch = shaderFile.match(fragmentShaderRegExp)

    if (vertexShaderMatch) {
      const [, materialName] = vertexShaderMatch

      shaderFiles[materialName] ??= {
        vertexShaderFile: null,
        fragmentShaderFile: null,
      }

      if (shaderFiles[materialName].vertexShaderFile) {
        warnDuplicateMaterialShaders(materialName, 'Vertex', shaderFile, shaderFiles[materialName].vertexShaderFile!)
      } else {
        shaderFiles[materialName].vertexShaderFile = shaderFile
      }
    } else if (fragmentShaderMatch) {
      const [, materialName] = fragmentShaderMatch

      shaderFiles[materialName] ??= {
        vertexShaderFile: null,
        fragmentShaderFile: null,
      }

      if (shaderFiles[materialName].fragmentShaderFile) {
        warnDuplicateMaterialShaders(materialName, 'Fragment', shaderFile, shaderFiles[materialName].fragmentShaderFile!)
      } else {
        shaderFiles[materialName].fragmentShaderFile = shaderFile
      }
    } else {
      warnUnknownShaderFile(shaderFile)
    }
  }

  return shaderFiles
}

function sanitizeMaterialShaders(materialShaders: { [materialName: string]: MaterialShader }): string[] {
  const materialsWithMissingShaders = [...Object.entries(materialShaders)]
    .filter(([, materialShader]) => isMissingShader(materialShader))
    .map(([materialName]) => materialName)

  for (const material of materialsWithMissingShaders) {
    delete materialShaders[material]
    warnInvalidMaterial(material)
  }

  const foundMaterials = [...Object.keys(materialShaders)]
  logFoundMaterials(foundMaterials)
  return foundMaterials
}

/**
 * Loads WGSL shader source files from assets.
 * 
 * The shader files should be named as follows:
 *
 * - Vertex shader: `<material-name>.vert.wgsl`
 * - Fragment shader: `<material-name>.frag.wgsl`
 * 
 * The intermediate directory paths are ignored.
 * For example, `/res/shader/material/planet/earth.vert.wgsl` is considered as a vertex shader for material `earth`.
 * 
 * @param shaderFiles - A record of shader files to load.
 * The keys are the shader file paths, and the values are the functions that load the shader files.
 *
 * Typically, you would use `import.meta.glob` from `vite` to generate this record.
 * Note that the `{ as: 'raw' }` option should be specified, since the shader source should be loaded as a string.
 * 
 * @returns List of material names.
 * 
 * @example
 * 
 * ```ts
 * loadShaders(await import.meta.glob('./material/*.wgsl', { as: 'raw' }))
 * ```
 */
export async function loadWGSLShaders(
  shaderFiles: Record<string, () => Promise<unknown>>,
): Promise<string[]> {
  if (typeof shaderFiles !== 'object' || shaderFiles === null) {
    throw new TypeError(`shaders must be an object, got: ${shaderFiles}`)
  }

  logFoundShaderFiles(shaderFiles)

  const materialShaders: { [materialName: string]: MaterialShader} = constructMaterialShaders(shaderFiles)
  const foundMaterials = sanitizeMaterialShaders(materialShaders)

  await Promise.all(
    foundMaterials
      .map(materialName => [materialName, materialShaders[materialName]] as const)
      .flatMap(([materialName, { vertexShaderFile, fragmentShaderFile }]) => [
        {
          materialName,
          shaderType: 'Vertex' as const,
          loadShader: shaderFiles[vertexShaderFile!],
        },
        {
          materialName,
          shaderType: 'Fragment' as const,
          loadShader: shaderFiles[fragmentShaderFile!],
        },
      ])
      .map(({ materialName, shaderType, loadShader }) => (
        loadShader()
          .then(source => loadToBabylonWGSLShaderStore(materialName, shaderType, source as string))
      )),
  )

  return foundMaterials
}
