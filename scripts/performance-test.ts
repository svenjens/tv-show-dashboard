/**
 * Performance test script to measure API response times
 * 
 * Tests different loading strategies:
 * 1. Full load (with TMDB + translations)
 * 2. Fast load (skip TMDB + translations)
 * 3. TMDB only (skip translations)
 * 4. Episodes load
 * 
 * Usage: npx tsx scripts/performance-test.ts [showId]
 */

interface TestResult {
  name: string
  duration: number
  size?: number
  success: boolean
  error?: string
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

async function measureRequest(
  url: string,
  description: string
): Promise<TestResult> {
  const start = performance.now()
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'nl-NL',
      },
    })
    
    const data = await response.json()
    const duration = performance.now() - start
    const size = JSON.stringify(data).length
    
    return {
      name: description,
      duration: Math.round(duration),
      size,
      success: response.ok,
    }
  } catch (error) {
    const duration = performance.now() - start
    return {
      name: description,
      duration: Math.round(duration),
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

function printResult(result: TestResult, baseline?: number) {
  const status = result.success 
    ? `${COLORS.green}✓${COLORS.reset}` 
    : `${COLORS.red}✗${COLORS.reset}`
  
  const duration = result.success
    ? `${COLORS.cyan}${result.duration}ms${COLORS.reset}`
    : `${COLORS.red}${result.duration}ms${COLORS.reset}`
  
  let comparison = ''
  if (baseline && result.success) {
    const improvement = ((baseline - result.duration) / baseline * 100).toFixed(1)
    const speedup = (baseline / result.duration).toFixed(1)
    if (result.duration < baseline) {
      comparison = ` ${COLORS.green}(-${improvement}%, ${speedup}x faster)${COLORS.reset}`
    } else if (result.duration > baseline) {
      comparison = ` ${COLORS.yellow}(+${Math.abs(parseFloat(improvement))}% slower)${COLORS.reset}`
    }
  }
  
  const size = result.size ? ` ${COLORS.gray}[${(result.size / 1024).toFixed(1)}KB]${COLORS.reset}` : ''
  
  console.log(`  ${status} ${result.name}: ${duration}${comparison}${size}`)
  
  if (result.error) {
    console.log(`    ${COLORS.red}Error: ${result.error}${COLORS.reset}`)
  }
}

async function runPerformanceTest(showId: number, baseUrl: string) {
  console.log(`\n${COLORS.bright}Performance Test - Show ID: ${showId}${COLORS.reset}`)
  console.log(`${COLORS.gray}Testing against: ${baseUrl}${COLORS.reset}\n`)
  
  // Test 1: Full load (worst case - before optimization)
  console.log(`${COLORS.bright}📊 Show Details Tests:${COLORS.reset}`)
  const fullLoad = await measureRequest(
    `${baseUrl}/api/shows/${showId}?country=NL&locale=nl`,
    '1. Full load (TMDB + translations)'
  )
  printResult(fullLoad)
  
  // Test 2: Fast load (best case - after optimization)
  const fastLoad = await measureRequest(
    `${baseUrl}/api/shows/${showId}?country=NL&locale=nl&skipTranslation=true&skipTMDB=true`,
    '2. Fast load (no TMDB, no translations)'
  )
  printResult(fastLoad, fullLoad.duration)
  
  // Test 3: Skip translations only
  const skipTranslations = await measureRequest(
    `${baseUrl}/api/shows/${showId}?country=NL&locale=nl&skipTranslation=true`,
    '3. TMDB only (no translations)'
  )
  printResult(skipTranslations, fullLoad.duration)
  
  // Test 4: Skip TMDB only
  const skipTMDB = await measureRequest(
    `${baseUrl}/api/shows/${showId}?country=NL&locale=nl&skipTMDB=true`,
    '4. Translations only (no TMDB)'
  )
  printResult(skipTMDB, fullLoad.duration)
  
  // Episodes tests
  console.log(`\n${COLORS.bright}📺 Episodes Tests:${COLORS.reset}`)
  const episodesFull = await measureRequest(
    `${baseUrl}/api/shows/${showId}/episodes?locale=nl`,
    '1. Episodes with translations'
  )
  printResult(episodesFull)
  
  const episodesFast = await measureRequest(
    `${baseUrl}/api/shows/${showId}/episodes?locale=nl&skipTranslation=true`,
    '2. Episodes without translations'
  )
  printResult(episodesFast, episodesFull.duration)
  
  // Summary
  console.log(`\n${COLORS.bright}📈 Performance Summary:${COLORS.reset}`)
  
  if (fullLoad.success && fastLoad.success) {
    const improvement = ((fullLoad.duration - fastLoad.duration) / fullLoad.duration * 100).toFixed(1)
    const speedup = (fullLoad.duration / fastLoad.duration).toFixed(1)
    
    console.log(`  Initial page load improvement: ${COLORS.green}${improvement}%${COLORS.reset}`)
    console.log(`  Speed multiplier: ${COLORS.green}${speedup}x faster${COLORS.reset}`)
    console.log(`  Time saved per page load: ${COLORS.cyan}${fullLoad.duration - fastLoad.duration}ms${COLORS.reset}`)
    
    if (fastLoad.duration < 200) {
      console.log(`  ${COLORS.green}✓ Instant load achieved (<200ms)${COLORS.reset}`)
    } else if (fastLoad.duration < 500) {
      console.log(`  ${COLORS.yellow}⚠ Fast but not instant (200-500ms)${COLORS.reset}`)
    } else {
      console.log(`  ${COLORS.red}⚠ Still slow (>500ms)${COLORS.reset}`)
    }
  }
  
  if (episodesFull.success && episodesFast.success) {
    const episodeImprovement = ((episodesFull.duration - episodesFast.duration) / episodesFull.duration * 100).toFixed(1)
    console.log(`  Episodes load improvement: ${COLORS.green}${episodeImprovement}%${COLORS.reset}`)
  }
  
  console.log('')
}

async function runMultipleTests(showId: number, baseUrl: string, runs: number = 3) {
  console.log(`\n${COLORS.bright}${COLORS.cyan}Running ${runs} test iterations for statistical accuracy...${COLORS.reset}`)
  
  const results: { full: number[], fast: number[] } = { full: [], fast: [] }
  
  for (let i = 1; i <= runs; i++) {
    console.log(`\n${COLORS.gray}--- Run ${i}/${runs} ---${COLORS.reset}`)
    
    const full = await measureRequest(
      `${baseUrl}/api/shows/${showId}?country=NL&locale=nl`,
      'Full load'
    )
    if (full.success) results.full.push(full.duration)
    
    const fast = await measureRequest(
      `${baseUrl}/api/shows/${showId}?country=NL&locale=nl&skipTranslation=true&skipTMDB=true`,
      'Fast load'
    )
    if (fast.success) results.fast.push(fast.duration)
    
    console.log(`  Full: ${full.duration}ms, Fast: ${fast.duration}ms`)
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  // Calculate averages
  const avgFull = Math.round(results.full.reduce((a, b) => a + b, 0) / results.full.length)
  const avgFast = Math.round(results.fast.reduce((a, b) => a + b, 0) / results.fast.length)
  const improvement = ((avgFull - avgFast) / avgFull * 100).toFixed(1)
  
  console.log(`\n${COLORS.bright}Average Results (${runs} runs):${COLORS.reset}`)
  console.log(`  Full load: ${COLORS.cyan}${avgFull}ms${COLORS.reset}`)
  console.log(`  Fast load: ${COLORS.green}${avgFast}ms${COLORS.reset}`)
  console.log(`  Improvement: ${COLORS.green}${improvement}% faster${COLORS.reset}`)
  console.log(`  Speedup: ${COLORS.green}${(avgFull / avgFast).toFixed(1)}x${COLORS.reset}`)
}

// Main execution
const showId = parseInt(process.argv[2] || '1', 10)
const baseUrl = process.env.BASE_URL || 'http://localhost:3000'
const multiRun = process.argv.includes('--multi')

if (isNaN(showId)) {
  console.error(`${COLORS.red}Error: Invalid show ID${COLORS.reset}`)
  console.log(`Usage: npx tsx scripts/performance-test.ts [showId] [--multi]`)
  process.exit(1)
}

if (multiRun) {
  runMultipleTests(showId, baseUrl, 5).catch(console.error)
} else {
  runPerformanceTest(showId, baseUrl).catch(console.error)
}

