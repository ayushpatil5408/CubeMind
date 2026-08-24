/**
 * CubeMind Frame Capture Utility (Phase 4A)
 * Captures high-resolution video frames from HTMLVideoElement onto HTMLCanvasElement.
 */

/**
 * Captures a single image frame from a live video element.
 * 
 * @param {HTMLVideoElement} video - The active video element.
 * @param {Object} [options] - Configuration options.
 * @param {number} [options.maxWidth=1280] - Maximum capture canvas width.
 * @param {number} [options.maxHeight=1280] - Maximum capture canvas height.
 * @param {number} [options.quality=0.92] - JPEG/PNG image quality.
 * @param {string} [options.mimeType='image/jpeg'] - Output image MIME type.
 * @returns {{ dataUrl: string, width: number, height: number, timestamp: number, canvas: HTMLCanvasElement }}
 */
export function captureVideoFrame(video, options = {}) {
  if (!video) {
    throw new Error('Video element is required for frame capture.')
  }

  const videoWidth = video.videoWidth || video.clientWidth || 640
  const videoHeight = video.videoHeight || video.clientHeight || 480

  if (videoWidth === 0 || videoHeight === 0) {
    throw new Error('Video stream has zero dimensions or is not ready.')
  }

  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.92,
    mimeType = 'image/jpeg',
  } = options

  // Calculate scaled dimensions while preserving aspect ratio
  let width = videoWidth
  let height = videoHeight

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  // Create or reuse offscreen canvas
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create 2D canvas context.')
  }

  // Draw current video frame to canvas
  ctx.drawImage(video, 0, 0, width, height)

  const dataUrl = canvas.toDataURL(mimeType, quality)

  return {
    dataUrl,
    width,
    height,
    timestamp: Date.now(),
    canvas,
  }
}
