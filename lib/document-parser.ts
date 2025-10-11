import mammoth from 'mammoth'
import { fromBuffer } from 'pdf2pic'

export interface ParsedDocument {
  content: string
  type: 'text' | 'html' | 'pdf' | 'word' | 'powerpoint' | 'epub'
  metadata?: {
    title?: string
    author?: string
    pages?: number
    slides?: number
  }
}

export class DocumentParser {
  static async parseDocument(buffer: Buffer, filename: string): Promise<ParsedDocument> {
    const extension = filename.split('.').pop()?.toLowerCase()
    
    try {
      switch (extension) {
        case 'pdf':
          return await this.parsePDF(buffer)
        case 'docx':
        case 'doc':
          return await this.parseWord(buffer)
        case 'pptx':
        case 'ppt':
          return await this.parsePowerPoint(buffer)
        case 'epub':
          return await this.parseEPUB(buffer)
        case 'txt':
        case 'md':
        case 'rtf':
          return await this.parseText(buffer)
        default:
          // Try to parse as text first, fallback to binary handling
          try {
            return await this.parseText(buffer)
          } catch {
            return {
              content: `Unsupported file format (.${extension}). Please convert to Word (.docx) or text format for better compatibility.`,
              type: 'text',
              metadata: {
                title: 'Unsupported Document'
              }
            }
          }
      }
    } catch (error) {
      console.error('Error parsing document:', error)
      return {
        content: 'Error parsing document. The file may be corrupted or in an unsupported format. Please try a different file.',
        type: 'text',
        metadata: {
          title: 'Parsing Error'
        }
      }
    }
  }

  private static async parsePDF(buffer: Buffer): Promise<ParsedDocument> {
    try {
      // Try multiple encoding methods with better Unicode support
      const encodings = ['utf8', 'latin1', 'ascii', 'binary']
      let bestText = ''
      let bestScore = 0
      
      for (const encoding of encodings) {
        try {
          const pdfText = buffer.toString(encoding as BufferEncoding)
          const score = this.analyzePdfContent(pdfText)
          if (score > bestScore) {
            bestScore = score
            bestText = pdfText
          }
        } catch (e) {
          continue
        }
      }
      
      if (!bestText) {
        bestText = buffer.toString('utf8')
      }
      
      let extractedText = ''
      
      // Method 1: Extract text from BT/ET blocks (most common)
      const textBlocks = bestText.match(/BT[\s\S]*?ET/g) || []
      for (const block of textBlocks) {
        // Extract from Tj operators (single strings)
        const tjMatches = block.match(/\((.*?)\)\s*Tj/g) || []
        for (const match of tjMatches) {
          const textMatch = match.match(/\((.*?)\)\s*Tj/)
          if (textMatch && textMatch[1]) {
            const cleanedText = this.cleanText(textMatch[1])
            if (cleanedText && cleanedText.length > 0) {
              extractedText += cleanedText + ' '
            }
          }
        }
        
        // Extract from TJ operators (arrays)
        const tjArrayMatches = block.match(/\[(.*?)\]\s*TJ/g) || []
        for (const match of tjArrayMatches) {
          const textMatch = match.match(/\[(.*?)\]\s*TJ/)
          if (textMatch && textMatch[1]) {
            const arrayContent = textMatch[1]
            const stringMatches = arrayContent.match(/\((.*?)\)/g) || []
            for (const strMatch of stringMatches) {
              const str = strMatch.match(/\((.*?)\)/)
              if (str && str[1]) {
                const cleanedText = this.cleanText(str[1])
                if (cleanedText && cleanedText.length > 0) {
                  extractedText += cleanedText + ' '
                }
              }
            }
          }
        }
      }
      
      // Method 2: Extract from stream objects (compressed content)
      if (!extractedText || extractedText.length < 20) {
        const streamMatches = bestText.match(/stream[\s\S]*?endstream/g) || []
        for (const stream of streamMatches) {
          // Look for text patterns in streams
          const textInStream = stream.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g) || []
          for (const textMatch of textInStream) {
            const match = textMatch.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/)
            if (match && (match[1] || match[2])) {
              const text = match[1] || match[2]
              const cleanedText = this.cleanText(text)
              if (cleanedText && cleanedText.length > 0) {
                extractedText += cleanedText + ' '
              }
            }
          }
        }
      }
      
      // Method 3: Extract from content streams (alternative format)
      if (!extractedText || extractedText.length < 20) {
        const contentMatches = bestText.match(/\/Contents\s+\d+\s+\d+\s+R[\s\S]*?endobj/g) || []
        for (const content of contentMatches) {
          const textInContent = content.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g) || []
          for (const textMatch of textInContent) {
            const match = textMatch.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/)
            if (match && (match[1] || match[2])) {
              const text = match[1] || match[2]
              const cleanedText = this.cleanText(text)
              if (cleanedText && cleanedText.length > 0) {
                extractedText += cleanedText + ' '
              }
            }
          }
        }
      }
      
      // Method 4: Extract from any text patterns in the PDF
      if (!extractedText || extractedText.length < 20) {
        const allTextMatches = bestText.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g) || []
        for (const textMatch of allTextMatches) {
          const match = textMatch.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/)
          if (match && (match[1] || match[2])) {
            const text = match[1] || match[2]
            const cleanedText = this.cleanText(text)
            if (cleanedText && cleanedText.length > 0) {
              extractedText += cleanedText + ' '
            }
          }
        }
      }
      
      // Method 5: Extract from form fields and annotations
      if (!extractedText || extractedText.length < 20) {
        const formMatches = bestText.match(/\/V\s*\((.*?)\)/g) || []
        for (const formMatch of formMatches) {
          const match = formMatch.match(/\/V\s*\((.*?)\)/)
          if (match && match[1]) {
            const cleanedText = this.cleanText(match[1])
            if (cleanedText && cleanedText.length > 0) {
              extractedText += cleanedText + ' '
            }
          }
        }
      }
      
      // Method 6: Extract from annotations and metadata
      if (!extractedText || extractedText.length < 20) {
        const annotationMatches = bestText.match(/\/Contents\s*\((.*?)\)/g) || []
        for (const annotationMatch of annotationMatches) {
          const match = annotationMatch.match(/\/Contents\s*\((.*?)\)/)
          if (match && match[1]) {
            const cleanedText = this.cleanText(match[1])
            if (cleanedText && cleanedText.length > 0) {
              extractedText += cleanedText + ' '
            }
          }
        }
      }
      
      // Method 7: Extract from document info and metadata
      if (!extractedText || extractedText.length < 20) {
        const infoMatches = bestText.match(/\/Title\s*\((.*?)\)|\/Subject\s*\((.*?)\)|\/Author\s*\((.*?)\)|\/Keywords\s*\((.*?)\)/g) || []
        for (const infoMatch of infoMatches) {
          const match = infoMatch.match(/\/Title\s*\((.*?)\)|\/Subject\s*\((.*?)\)|\/Author\s*\((.*?)\)|\/Keywords\s*\((.*?)\)/)
          if (match) {
            for (let i = 1; i < match.length; i++) {
              if (match[i]) {
                const cleanedText = this.cleanText(match[i])
                if (cleanedText && cleanedText.length > 0) {
                  extractedText += cleanedText + ' '
                }
              }
            }
          }
        }
      }
      
      // Method 8: Advanced fallback - extract any readable text
      if (!extractedText || extractedText.length < 20) {
        const readableText = bestText
          .replace(/[^\x20-\x7E\n\r]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
        
        // Advanced filtering to remove PDF structure
        const filteredText = this.filterPdfStructure(readableText)
        
        if (filteredText.length > 30) {
          extractedText = filteredText.substring(0, 3000)
        }
      }
      
      // Method 9: Extract from any remaining text patterns
      if (!extractedText || extractedText.length < 20) {
        const remainingMatches = bestText.match(/\((.*?)\)/g) || []
        for (const match of remainingMatches) {
          const textMatch = match.match(/\((.*?)\)/)
          if (textMatch && textMatch[1]) {
            const cleanedText = this.cleanText(textMatch[1])
            if (cleanedText && cleanedText.length > 0) {
              extractedText += cleanedText + ' '
            }
          }
        }
      }
      
      // Clean and validate extracted text
      extractedText = this.cleanExtractedText(extractedText)
      
      // Check if the extracted text is actually readable or just garbled
      const isReadableText = this.isTextReadable(extractedText)
      
      if (extractedText && extractedText.length > 20 && isReadableText) {
        return {
          content: extractedText,
          type: 'pdf',
          metadata: {
            title: 'PDF Document',
            pages: this.estimatePageCount(bestText)
          }
        }
      } else {
        // Try to convert PDF to images for image-based PDFs or unreadable text
        try {
          const convert = fromBuffer(buffer, {
            density: 100,           // Lower density for faster processing
            saveFilename: "page",
            savePath: "./public/uploads/pdf-images/",
            format: "png",
            width: 800,            // Standard width for web display
            height: 1200           // Standard height for web display
          })
          
          const pages = await convert.bulk(-1, { responseType: "base64" })
          
          if (pages && pages.length > 0) {
            // Create image viewer content
            const imageContent = pages.map((page, index) => {
              return `<div class="pdf-page" style="margin-bottom: 20px; text-align: center;">
                <img src="data:image/png;base64,${page.base64}" 
                     alt="PDF Page ${index + 1}" 
                     style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                <p style="margin-top: 8px; color: #666; font-size: 14px;">Page ${index + 1} of ${pages.length}</p>
              </div>`
            }).join('')
            
            return {
              content: `<div class="pdf-image-viewer">
                <div style="text-align: center; margin-bottom: 20px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">PDF Document Viewer</h3>
                  <p style="margin: 0; color: #666;">This PDF contains image-based content. ${pages.length} page${pages.length > 1 ? 's' : ''} converted to images for viewing.</p>
                </div>
                ${imageContent}
              </div>`,
              type: 'pdf',
              metadata: {
                title: 'PDF Document',
                pages: pages.length,
                // isImageBased: true - property doesn't exist in type
              }
            }
          } else {
            // Fallback message if conversion fails
            return {
              content: 'This PDF appears to be image-based or contains only non-text elements. The document may contain scanned images, graphics, or other visual content that cannot be extracted as text. For better compatibility, please convert the PDF to a text-based format or use a PDF with selectable text content.',
              type: 'pdf',
              metadata: {
                title: 'PDF Document',
                pages: this.estimatePageCount(bestText)
              }
            }
          }
        } catch (imageError) {
          console.error('PDF to image conversion error:', imageError)
          // Try one more advanced text extraction method
          const advancedText = this.advancedTextExtraction(bestText)
          if (advancedText && advancedText.length > 20) {
            return {
              content: advancedText,
              type: 'pdf',
              metadata: {
                title: 'PDF Document',
                pages: this.estimatePageCount(bestText)
              }
            }
          }
          
          // Final fallback message
          return {
            content: 'This PDF contains complex formatting or image-based content that cannot be displayed as text. The document may contain scanned images, graphics, or special formatting that requires a PDF viewer. For better compatibility, please convert the PDF to a text-based format or use a PDF with selectable text content.',
            type: 'pdf',
            metadata: {
              title: 'PDF Document',
              pages: this.estimatePageCount(bestText)
            }
          }
        }
      }
    } catch (error) {
      console.error('PDF parsing error:', error)
      return {
        content: 'PDF document could not be parsed. The file may be corrupted, password-protected, or in an unsupported format. Please try a different PDF file.',
        type: 'pdf',
        metadata: {
          title: 'PDF Document',
          pages: 1
        }
      }
    }
  }

  // Helper method to analyze PDF content quality
  private static analyzePdfContent(text: string): number {
    let score = 0
    
    // Check for PDF structure
    if (text.includes('%PDF')) score += 10
    if (text.includes('obj')) score += 5
    if (text.includes('endobj')) score += 5
    if (text.includes('stream')) score += 5
    if (text.includes('endstream')) score += 5
    
    // Check for text content
    const textMatches = text.match(/\((.*?)\)\s*Tj|\[(.*?)\]\s*TJ/g) || []
    score += textMatches.length * 2
    
    // Check for readable characters (including Unicode)
    const readableChars = text.match(/[a-zA-Z0-9\s.,!?;:()\-'"]/g) || []
    const unicodeChars = text.match(/[\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g) || []
    const totalChars = text.length
    if (totalChars > 0) {
      const readableRatio = (readableChars.length + unicodeChars.length) / totalChars
      score += readableRatio * 25 // Increased weight for Unicode support
    }
    
    // Bonus for UTF-8 encoding quality
    if (text.includes('é') || text.includes('ñ') || text.includes('ü') || text.includes('ç')) {
      score += 10 // Bonus for proper Unicode characters
    }
    
    return score
  }

  // Helper method to clean extracted text
  private static cleanText(text: string): string {
    if (!text || text.length === 0) return ''
    
    // First, handle PDF escape sequences
    let cleaned = text
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
      .replace(/\\\\/g, '\\')
      .replace(/\\\//g, '/')
      .replace(/\\\*/g, '*')
      .replace(/\\\[/g, '[')
      .replace(/\\\]/g, ']')
      .replace(/\\\{/g, '{')
      .replace(/\\\}/g, '}')
      .replace(/\\\^/g, '^')
      .replace(/\\\$/g, '$')
      .replace(/\\\./g, '.')
      .replace(/\\\+/g, '+')
      .replace(/\\\?/g, '?')
      .replace(/\\\|/g, '|')
      .replace(/\\\(/g, '(')
      .replace(/\\\)/g, ')')
    
    // Handle Unicode characters more carefully
    // Remove only truly problematic characters, keep Unicode
    cleaned = cleaned
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ' ') // Remove only control characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
    
    // More lenient readability check - allow Unicode characters
    const readableChars = cleaned.match(/[a-zA-Z0-9\s.,!?;:()\-'"@#$%^&*_+=\[\]{}|;':",./<>~`]/g) || []
    const unicodeChars = cleaned.match(/[\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g) || [] // Common Unicode ranges
    const totalChars = cleaned.length
    
    if (totalChars > 0 && (readableChars.length + unicodeChars.length) / totalChars < 0.2) {
      // If less than 20% readable characters (including Unicode), it's likely garbled
      return ''
    }
    
    return cleaned
  }

  // Helper method to clean and format extracted text
  private static cleanExtractedText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n\s+/g, '\n')
      .replace(/\s+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim()
  }

  // Helper method to filter out PDF structure elements
  private static filterPdfStructure(text: string): string {
    return text
      .replace(/\b(obj|endobj|stream|endstream|xref|trailer|startxref|PDF|Linearized|L|O|E|N|T|H|W|Length|Filter|FlateDecode|Deflate|DCTDecode|JPXDecode|CCITTFaxDecode|JBIG2Decode|ASCIIHexDecode|ASCII85Decode|RunLengthDecode|LZWDecode|BT|ET|Tj|TJ|Tm|Td|TD|Tf|Tr|Ts|Tc|Tw|Tz|TL|T*|Tj|TJ|Tj|TJ)\b/g, '')
      .replace(/\b\d+\s+\d+\s+\d+\s+\d+\s+\d+\s+\d+\b/g, '')
      .replace(/\b[A-Z]{2,}\b/g, '')
      .replace(/\b\d+\.\d+\b/g, '')
      .replace(/\b\d+\b/g, '')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Helper method to estimate page count
  private static estimatePageCount(pdfText: string): number {
    const pageMatches = pdfText.match(/\/Type\s*\/Page/g) || []
    return Math.max(1, pageMatches.length)
  }

  // Helper method to check if extracted text is actually readable
  private static isTextReadable(text: string): boolean {
    if (!text || text.length < 10) return false
    
    // Check for common garbled character patterns
    const garbledPatterns = [
      /[{}[\]\\|`~^]/g,  // Common garbled characters
      /[^\x20-\x7E\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]/g, // Non-printable or unusual characters
      /\s{3,}/g,  // Multiple consecutive spaces
      /[A-Z]{3,}/g,  // Multiple consecutive uppercase letters (often PDF structure)
    ]
    
    let garbledScore = 0
    for (const pattern of garbledPatterns) {
      const matches = text.match(pattern) || []
      garbledScore += matches.length
    }
    
    // Check for readable content
    const words = text.split(/\s+/).filter(word => word.length > 2)
    const readableWords = words.filter(word => 
      /^[a-zA-Z0-9.,!?;:()\-'"]+$/.test(word) || 
      /^[\u00C0-\u017F\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF]+$/.test(word)
    )
    
    const readableRatio = readableWords.length / Math.max(words.length, 1)
    
    // Text is readable if:
    // 1. At least 60% of words are readable
    // 2. Garbled character ratio is low
    // 3. Contains some common English words
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall']
    const hasCommonWords = commonWords.some(word => 
      text.toLowerCase().includes(word)
    )
    
    return readableRatio > 0.6 && 
           garbledScore < text.length * 0.1 && 
           (hasCommonWords || readableWords.length > 5)
  }

  // Advanced text extraction for complex PDFs
  private static advancedTextExtraction(pdfText: string): string {
    let extractedText = ''
    
    // Method 1: Extract from any text in parentheses
    const parenMatches = pdfText.match(/\(([^)]+)\)/g) || []
    for (const match of parenMatches) {
      const text = match.slice(1, -1) // Remove parentheses
      const cleaned = this.cleanText(text)
      if (cleaned && cleaned.length > 3) {
        extractedText += cleaned + ' '
      }
    }
    
    // Method 2: Extract from any quoted strings
    const quotedMatches = pdfText.match(/"([^"]+)"/g) || []
    for (const match of quotedMatches) {
      const text = match.slice(1, -1) // Remove quotes
      const cleaned = this.cleanText(text)
      if (cleaned && cleaned.length > 3) {
        extractedText += cleaned + ' '
      }
    }
    
    // Method 3: Extract from any readable sequences
    const readableSequences = pdfText.match(/[a-zA-Z]{3,}/g) || []
    for (const sequence of readableSequences) {
      if (sequence.length > 3 && /^[a-zA-Z]+$/.test(sequence)) {
        extractedText += sequence + ' '
      }
    }
    
    // Method 4: Extract from any text after common PDF operators
    const operatorMatches = pdfText.match(/Tj\s*\(([^)]+)\)|TJ\s*\[([^\]]+)\]/g) || []
    for (const match of operatorMatches) {
      const textMatch = match.match(/Tj\s*\(([^)]+)\)|TJ\s*\[([^\]]+)\]/)
      if (textMatch && (textMatch[1] || textMatch[2])) {
        const text = textMatch[1] || textMatch[2]
        const cleaned = this.cleanText(text)
        if (cleaned && cleaned.length > 3) {
          extractedText += cleaned + ' '
        }
      }
    }
    
    // Clean and validate the extracted text
    extractedText = this.cleanExtractedText(extractedText)
    
    // Check if the result is readable
    if (this.isTextReadable(extractedText)) {
      return extractedText
    }
    
    return ''
  }

  private static async parseWord(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const result = await mammoth.extractRawText({ buffer })
      return {
        content: result.value || 'No text content found in the document.',
        type: 'word',
        metadata: {
          title: 'Word Document'
        }
      }
    } catch (error) {
      console.error('Mammoth parsing error:', error)
      return {
        content: 'Word document could not be parsed. The file may be corrupted or in an unsupported format. Please try converting to text format.',
        type: 'word',
        metadata: {
          title: 'Word Document'
        }
      }
    }
  }

  private static async parsePowerPoint(buffer: Buffer): Promise<ParsedDocument> {
    return {
      content: 'PowerPoint presentations are not yet supported for inline viewing. Please convert to Word (.docx) or text format for better compatibility.',
      type: 'powerpoint',
      metadata: {
        title: 'PowerPoint Presentation',
        slides: 1
      }
    }
  }

  private static async parseEPUB(buffer: Buffer): Promise<ParsedDocument> {
    return {
      content: 'EPUB books are not yet supported for inline viewing. Please convert to Word (.docx) or text format for better compatibility.',
      type: 'epub',
      metadata: {
        title: 'EPUB Book'
      }
    }
  }

  private static async parseText(buffer: Buffer): Promise<ParsedDocument> {
    try {
      const content = buffer.toString('utf-8')
      return {
        content,
        type: 'text'
      }
    } catch (error) {
      throw new Error('Failed to parse text document')
    }
  }
}
