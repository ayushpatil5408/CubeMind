import '@testing-library/jest-dom'

// Mock ResizeObserver for jsdom environment (required by React Three Fiber and Canvas resize observers)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock 2D and WebGL context for jsdom environment
HTMLCanvasElement.prototype.getContext = function (contextType) {
  if (contextType === '2d') {
    return {
      drawImage: () => {},
      getImageData: (x, y, w, h) => {
        const width = w || this.width || 640
        const height = h || this.height || 480
        const data = new Uint8ClampedArray(width * height * 4)
        // Fill with synthetic default color
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 200     // R
          data[i + 1] = 200 // G
          data[i + 2] = 200 // B
          data[i + 3] = 255 // A
        }
        return { data, width, height }
      },
      fillRect: () => {},
      clearRect: () => {},
      putImageData: () => {},
    }
  }

  if (contextType === 'webgl' || contextType === 'webgl2' || contextType === 'experimental-webgl') {
    return {
      getExtension: () => null,
      getParameter: () => 0,
      createTexture: () => ({}),
      bindTexture: () => {},
      texParameteri: () => {},
      viewport: () => {},
      clearColor: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
    }
  }
  return null
}

if (!HTMLCanvasElement.prototype.toDataURL) {
  HTMLCanvasElement.prototype.toDataURL = function () {
    return 'data:image/jpeg;base64,/9j/mockFrameData'
  }
}

