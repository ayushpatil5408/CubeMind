/**
 * CubeMind Image Processing Utilities (Phase 4B)
 * Low-level pixel array and ImageData operations.
 */

/**
 * Extracts or validates an ImageData object from canvas or ImageData source.
 * @param {HTMLCanvasElement|ImageData|{ data: Uint8ClampedArray, width: number, height: number }} source
 * @returns {ImageData}
 */
export function getImageDataFromSource(source) {
  if (!source) {
    throw new Error('Image source is required.')
  }

  // Already ImageData or compatible structure
  if (source.data && typeof source.width === 'number' && typeof source.height === 'number') {
    return source
  }

  // HTMLCanvasElement
  if (typeof source.getContext === 'function') {
    const ctx = source.getContext('2d')
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas.')
    }
    return ctx.getImageData(0, 0, source.width, source.height)
  }

  throw new Error('Unsupported image source type.')
}

/**
 * Converts RGBA ImageData to single-channel Float32Array or Uint8Array grayscale buffer.
 * Standard Rec. 601 luminance weights: Y = 0.299*R + 0.587*G + 0.114*B
 * @param {ImageData} imageData
 * @returns {Uint8Array} Grayscale buffer (width * height)
 */
export function toGrayscale(imageData) {
  const { data, width, height } = imageData
  const gray = new Uint8Array(width * height)

  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    gray[j] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2])
  }

  return gray
}

/**
 * Crops a subregion from an ImageData object.
 * @param {ImageData} srcImageData
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @returns {{ data: Uint8ClampedArray, width: number, height: number }}
 */
export function cropImageData(srcImageData, x, y, width, height) {
  const srcW = srcImageData.width
  const srcH = srcImageData.height
  const srcData = srcImageData.data

  const startX = Math.max(0, Math.min(Math.round(x), srcW - 1))
  const startY = Math.max(0, Math.min(Math.round(y), srcH - 1))
  const cropW = Math.max(1, Math.min(Math.round(width), srcW - startX))
  const cropH = Math.max(1, Math.min(Math.round(height), srcH - startY))

  const dstData = new Uint8ClampedArray(cropW * cropH * 4)

  for (let row = 0; row < cropH; row++) {
    const srcRowOffset = ((startY + row) * srcW + startX) * 4
    const dstRowOffset = row * cropW * 4
    const rowBytes = cropW * 4

    for (let b = 0; b < rowBytes; b++) {
      dstData[dstRowOffset + b] = srcData[srcRowOffset + b]
    }
  }

  return {
    data: dstData,
    width: cropW,
    height: cropH,
  }
}

/**
 * Creates an empty ImageData or compatible structure (compatible in browser & test envs).
 * @param {number} width
 * @param {number} height
 * @returns {{ data: Uint8ClampedArray, width: number, height: number }}
 */
export function createEmptyImageData(width, height) {
  const data = new Uint8ClampedArray(width * height * 4)
  return {
    data,
    width,
    height,
  }
}
