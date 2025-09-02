// Device fingerprinting utility for persistent user identification
export class DeviceFingerprint {
  private static instance: DeviceFingerprint
  private deviceId: string | null = null

  private constructor() {}

  static getInstance(): DeviceFingerprint {
    if (!DeviceFingerprint.instance) {
      DeviceFingerprint.instance = new DeviceFingerprint()
    }
    return DeviceFingerprint.instance
  }

  // Generate browser fingerprint based on available browser features
  private async generateFingerprint(): Promise<string> {
    const components: string[] = []

    // Screen information
    components.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`)
    
    // Timezone
    components.push(`tz:${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    
    // Language
    components.push(`lang:${navigator.language}`)
    
    // Platform
    components.push(`platform:${navigator.platform}`)
    
    // User agent (partial for stability)
    const ua = navigator.userAgent
    const browser = ua.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'unknown'
    components.push(`browser:${browser}`)
    
    // Available fonts (canvas-based detection)
    const fonts = await this.detectFonts()
    components.push(`fonts:${fonts}`)
    
    // Hardware concurrency
    components.push(`cores:${navigator.hardwareConcurrency || 'unknown'}`)
    
    // Device memory (if available)
    const deviceMemory = (navigator as any).deviceMemory
    if (deviceMemory) {
      components.push(`memory:${deviceMemory}`)
    }
    
    // Create hash from components
    const fingerprint = await this.hashString(components.join('|'))
    return fingerprint
  }

  // Simple font detection using canvas
  private async detectFonts(): Promise<string> {
    const testFonts = [
      'Arial', 'Times New Roman', 'Courier New', 'Helvetica', 
      'Georgia', 'Verdana', 'Trebuchet MS', 'Comic Sans MS'
    ]
    
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'canvas-unavailable'
    
    const testText = 'Font detection test 123'
    const detectedFonts: string[] = []
    
    // Get baseline measurement with a common fallback font
    ctx.font = '12px monospace'
    const baselineWidth = ctx.measureText(testText).width
    
    for (const font of testFonts) {
      ctx.font = `12px "${font}", monospace`
      const width = ctx.measureText(testText).width
      
      // If width differs from baseline, font is likely available
      if (Math.abs(width - baselineWidth) > 0.1) {
        detectedFonts.push(font)
      }
    }
    
    return detectedFonts.length > 0 ? detectedFonts.join(',') : 'none'
  }

  // Simple hash function for fingerprint
  private async hashString(str: string): Promise<string> {
    if (crypto && crypto.subtle) {
      const encoder = new TextEncoder()
      const data = encoder.encode(str)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }
    
    // Fallback simple hash if crypto.subtle is not available
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16)
  }

  // Get or generate persistent device ID
  async getDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId
    }

    // First try to get from localStorage
    const stored = localStorage.getItem('dangol_device_id')
    if (stored) {
      this.deviceId = stored
      return stored
    }

    // Generate new device ID using fingerprint + timestamp
    const fingerprint = await this.generateFingerprint()
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    
    this.deviceId = `dev_${fingerprint.substring(0, 12)}_${timestamp}_${random}`
    
    // Store in localStorage
    localStorage.setItem('dangol_device_id', this.deviceId)
    
    return this.deviceId
  }

  // Clear device ID (for testing or reset purposes)
  clearDeviceId(): void {
    this.deviceId = null
    localStorage.removeItem('dangol_device_id')
  }

  // Get device info for debugging
  async getDeviceInfo(): Promise<{deviceId: string, fingerprint: string}> {
    const deviceId = await this.getDeviceId()
    const fingerprint = await this.generateFingerprint()
    return { deviceId, fingerprint }
  }
}

// Export singleton instance
export const deviceFingerprint = DeviceFingerprint.getInstance()

// Convenience function for direct access
export const getDeviceId = async (): Promise<string> => {
  return deviceFingerprint.getDeviceId()
}