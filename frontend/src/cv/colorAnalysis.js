/**
 * CubeMind Color Analysis & Conversions (Phase 4B)
 * Extracts statistical color representations (mean, median, HSV, brightness, saturation, variance).
 */

/**
 * Converts RGB [0..255] values to HSV (Hue 0..360, Saturation 0..100%, Value 0..100%).
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {{ h: number, s: number, v: number }}
 */
export function rgbToHsv(r, g, b) {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255

  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const delta = max - min

  let h = 0
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2
    } else {
      h = (rNorm - gNorm) / delta + 4
    }
    h = Math.round(h * 60)
    if (h < 0) h += 360
  }

  const s = max === 0 ? 0 : Math.round((delta / max) * 100)
  const v = Math.round(max * 100)

  return { h, s, v }
}

/**
 * Converts RGB [0..255] to standard Hex string `#rrggbb`.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {string}
 */
export function rgbToHex(r, g, b) {
  const toHex = (val) => Math.max(0, Math.min(255, Math.round(val))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/**
 * Computes luminance / perceived brightness (0..255) using Rec. 601 formula.
 * @param {number} r
 * @param {number} g
 * @param {number} b
 * @returns {number}
 */
export function computeLuminance(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b
}

/**
 * Computes statistical color profile from array of RGB pixel tuples.
 * @param {Array<[number, number, number]>} pixels - List of [r, g, b]
 * @returns {{
 *   meanRgb: { r: number, g: number, b: number },
 *   medianRgb: { r: number, g: number, b: number },
 *   hex: string,
 *   hsv: { h: number, s: number, v: number },
 *   brightness: number,
 *   saturation: number,
 *   variance: number,
 *   sampleCount: number
 * }}
 */
export function computeColorStatistics(pixels) {
  if (!pixels || pixels.length === 0) {
    return {
      meanRgb: { r: 0, g: 0, b: 0 },
      medianRgb: { r: 0, g: 0, b: 0 },
      hex: '#000000',
      hsv: { h: 0, s: 0, v: 0 },
      brightness: 0,
      saturation: 0,
      variance: 0,
      sampleCount: 0,
    }
  }

  const n = pixels.length
  let sumR = 0
  let sumG = 0
  let sumB = 0
  let sumLumaSq = 0

  const rArr = new Float32Array(n)
  const gArr = new Float32Array(n)
  const bArr = new Float32Array(n)

  for (let i = 0; i < n; i++) {
    const [r, g, b] = pixels[i]
    sumR += r
    sumG += g
    sumB += b

    rArr[i] = r
    gArr[i] = g
    bArr[i] = b

    const luma = 0.299 * r + 0.587 * g + 0.114 * b
    sumLumaSq += luma * luma
  }

  const meanR = sumR / n
  const meanG = sumG / n
  const meanB = sumB / n

  // Median calculation
  rArr.sort()
  gArr.sort()
  bArr.sort()

  const mid = Math.floor(n / 2)
  const medianR = n % 2 !== 0 ? rArr[mid] : (rArr[mid - 1] + rArr[mid]) / 2
  const medianG = n % 2 !== 0 ? gArr[mid] : (gArr[mid - 1] + gArr[mid]) / 2
  const medianB = n % 2 !== 0 ? bArr[mid] : (bArr[mid - 1] + bArr[mid]) / 2

  const meanLuma = 0.299 * meanR + 0.587 * meanG + 0.114 * meanB
  const variance = Math.max(0, sumLumaSq / n - meanLuma * meanLuma)

  const hsv = rgbToHsv(meanR, meanG, meanB)
  const hex = rgbToHex(meanR, meanG, meanB)

  return {
    meanRgb: {
      r: Math.round(meanR),
      g: Math.round(meanG),
      b: Math.round(meanB),
    },
    medianRgb: {
      r: Math.round(medianR),
      g: Math.round(medianG),
      b: Math.round(medianB),
    },
    hex,
    hsv,
    brightness: Number(meanLuma.toFixed(1)),
    saturation: hsv.s,
    variance: Number(variance.toFixed(2)),
    sampleCount: n,
  }
}
