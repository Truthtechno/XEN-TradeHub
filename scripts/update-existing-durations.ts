import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function getMediaDuration(filePath: string, fileSize: number): Promise<number> {
  try {
    const extension = filePath.toLowerCase().split('.').pop()
    const fileSizeInMB = fileSize / (1024 * 1024)
    
    console.log(`    📁 File: ${filePath}, Size: ${fileSizeInMB.toFixed(2)}MB, Type: ${extension}`)
    
    // More sophisticated estimation based on file type and size
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(extension || '')) {
      // Video files - estimate based on bitrate assumptions
      // Use different bitrates based on file size to be more accurate
      let estimatedBitrate = 1500000 // 1.5 Mbps default
      
      if (fileSizeInMB < 5) {
        estimatedBitrate = 1000000 // 1 Mbps for small files
      } else if (fileSizeInMB > 100) {
        estimatedBitrate = 3000000 // 3 Mbps for large files
      }
      
      const estimatedDuration = (fileSize * 8) / estimatedBitrate
      
      // Clamp between 30 seconds and 4 hours
      const duration = Math.max(30, Math.min(14400, Math.floor(estimatedDuration)))
      console.log(`    🎥 Video estimated: ${duration}s (${Math.round(duration/60)}m)`)
      return duration
      
    } else if (['mp3', 'wav', 'aac', 'ogg', 'm4a'].includes(extension || '')) {
      // Audio files - estimate based on typical bitrates
      let estimatedBitrate = 128000 // 128 kbps default
      
      if (extension === 'wav') {
        estimatedBitrate = 1411000 // 1411 kbps for CD quality
      } else if (extension === 'aac' || extension === 'm4a') {
        estimatedBitrate = 256000 // 256 kbps for high quality AAC
      } else if (extension === 'ogg') {
        estimatedBitrate = 192000 // 192 kbps for OGG
      } else if (extension === 'mp3') {
        // MP3 bitrate varies, estimate based on file size
        if (fileSizeInMB < 1) {
          estimatedBitrate = 64000 // 64 kbps for small files
        } else if (fileSizeInMB > 10) {
          estimatedBitrate = 320000 // 320 kbps for large files
        } else {
          estimatedBitrate = 128000 // 128 kbps default
        }
      }
      
      const estimatedDuration = (fileSize * 8) / estimatedBitrate
      
      // Clamp between 10 seconds and 2 hours
      const duration = Math.max(10, Math.min(7200, Math.floor(estimatedDuration)))
      console.log(`    🎵 Audio estimated: ${duration}s (${Math.round(duration/60)}m)`)
      return duration
    }
    
    // Default fallback for unknown types
    console.log(`    ❓ Unknown type, using default: 60s`)
    return 60
    
  } catch (error) {
    console.error('Error calculating duration:', error)
    return 60 // Default 1 minute
  }
}

async function updateExistingDurations() {
  try {
    console.log('🔍 Finding video and audio resources with missing or zero duration...')
    
    // Find all VIDEO and PODCAST resources that have duration as null, 0, or very small values
    const resources = await prisma.resource.findMany({
      where: {
        OR: [
          { type: 'VIDEO' },
          { type: 'PODCAST' }
        ],
        AND: [
          {
            OR: [
              { duration: null },
              { duration: 0 },
              { duration: { lt: 30 } } // Less than 30 seconds
            ]
          }
        ]
      }
    })

    console.log(`📊 Found ${resources.length} resources to update:`)
    resources.forEach(resource => {
      console.log(`  - ${resource.title} (${resource.type}) - Current duration: ${resource.duration || 'null'}`)
    })

    if (resources.length === 0) {
      console.log('✅ No resources need duration updates!')
      return
    }

    console.log('\n🔄 Updating durations...')

    for (const resource of resources) {
      try {
        if (!resource.url) {
          console.log(`⚠️  Skipping ${resource.title} - no URL`)
          continue
        }

        // Get the file path
        const filePath = resource.url.startsWith('/') ? resource.url.substring(1) : resource.url
        const fullPath = join(process.cwd(), 'public', filePath)
        
        try {
          // Check if file exists and get stats
          const stats = await fs.stat(fullPath)
          const fileSize = stats.size
          
        // Calculate estimated duration
        const estimatedDurationSeconds = await getMediaDuration(fullPath, fileSize)
        const estimatedDurationMinutes = Math.max(1, Math.round(estimatedDurationSeconds / 60)) // At least 1 minute
        
        // Update the resource
        await prisma.resource.update({
          where: { id: resource.id },
          data: { duration: estimatedDurationMinutes }
        })
        
        console.log(`✅ Updated ${resource.title}: ${resource.duration || 'null'} → ${estimatedDurationMinutes}m (${estimatedDurationSeconds}s)`)
          
        } catch (fileError) {
          console.log(`❌ Could not access file for ${resource.title}: ${fileError}`)
          // Set a default duration for files we can't access
          await prisma.resource.update({
            where: { id: resource.id },
            data: { duration: 5 } // Default 5 minutes
          })
          console.log(`🔧 Set default duration for ${resource.title}: 5m`)
        }
        
      } catch (error) {
        console.error(`❌ Error updating ${resource.title}:`, error)
      }
    }

    console.log('\n✅ Duration update completed!')
    
    // Show final results
    const updatedResources = await prisma.resource.findMany({
      where: {
        OR: [
          { type: 'VIDEO' },
          { type: 'PODCAST' }
        ]
      },
      select: {
        title: true,
        type: true,
        duration: true
      }
    })

    console.log('\n📊 Final resource durations:')
    updatedResources.forEach(resource => {
      console.log(`  - ${resource.title} (${resource.type}): ${resource.duration !== null ? resource.duration + 'm' : 'null'}`)
    })

  } catch (error) {
    console.error('❌ Error updating durations:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
updateExistingDurations()
