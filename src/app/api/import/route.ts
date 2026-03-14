import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { url } = await request.json()

  if (!url) return NextResponse.json({ error: 'URL requise' }, { status: 400 })

  // 1. Fetch la page
  let html = ''
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      }
    })
    if (!res.ok) return NextResponse.json({ error: `Page inaccessible (${res.status})` }, { status: 400 })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Impossible de récupérer la page.' }, { status: 400 })
  }

  // 2. Extrait le texte brut
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length < 100) {
    return NextResponse.json({ error: 'Page vide ou bloquée par le site' }, { status: 400 })
  }

  // 3. Extrait les métadonnées Open Graph (titre, description, site)
  const ogTitle       = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1]
                     ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i)?.[1]
  const ogDescription = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1]
                     ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i)?.[1]
  const ogSiteName    = html.match(/<meta[^>]*property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1]
                     ?? html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i)?.[1]
  const pageTitle     = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]

  // 4. Détecte le site et adapte l'extraction
  const hostname = new URL(url).hostname

  let company_name = ''
  let job_title    = ''
  let location     = ''
  let notes        = ''

  // — Welcome to the Jungle —
  if (hostname.includes('welcometothejungle')) {
    // Titre souvent : "Poste - Entreprise"
    const title = ogTitle ?? pageTitle ?? ''
    const parts = title.split(' - ')
    job_title    = parts[0]?.trim() ?? ''
    company_name = parts[1]?.trim() ?? ''
    notes        = ogDescription ?? ''

    // Localisation dans le texte
    const locMatch = text.match(/(?:📍|Lieu|Location|Localisation)\s*[:\-]?\s*([A-Za-zÀ-ÿ\s,]+?)(?:\s{2,}|·|\||$)/i)
    location = locMatch?.[1]?.trim() ?? ''
  }

  // — Indeed —
  else if (hostname.includes('indeed')) {
    const title = ogTitle ?? pageTitle ?? ''
    job_title    = title.split('|')[0]?.trim() ?? ''
    company_name = title.split('|')[1]?.trim() ?? ''
    notes        = ogDescription ?? ''

    const locMatch = text.match(/(?:Lieu de travail|Location)\s*[:\-]?\s*([A-Za-zÀ-ÿ\s,]+?)(?:\s{2,}|\||$)/i)
    location = locMatch?.[1]?.trim() ?? ''
  }

  // — LinkedIn —
  else if (hostname.includes('linkedin')) {
    const title = ogTitle ?? pageTitle ?? ''
    // Titre LinkedIn : "Poste chez Entreprise"
    const chezMatch = title.match(/^(.+?)\s+(?:chez|at)\s+(.+?)(?:\s*[-|]|$)/i)
    if (chezMatch) {
      job_title    = chezMatch[1]?.trim() ?? ''
      company_name = chezMatch[2]?.trim() ?? ''
    } else {
      job_title = title.split('|')[0]?.trim() ?? ''
    }
    notes    = ogDescription ?? ''
    const locMatch = text.match(/([A-Za-zÀ-ÿ\s]+(?:,\s*[A-Za-zÀ-ÿ\s]+)?)\s*·\s*\d+/i)
    location = locMatch?.[1]?.trim() ?? ''
  }

  // — Hellowork —
  else if (hostname.includes('hellowork')) {
    const title = ogTitle ?? pageTitle ?? ''
    const parts = title.split('-')
    job_title    = parts[0]?.trim() ?? ''
    company_name = parts[1]?.trim() ?? ''
    notes        = ogDescription ?? ''
  }

  // — Apec —
  else if (hostname.includes('apec')) {
    const title = ogTitle ?? pageTitle ?? ''
    job_title    = title.split('|')[0]?.trim() ?? ''
    notes        = ogDescription ?? ''
    const compMatch = text.match(/(?:Entreprise|Société)\s*[:\-]\s*([^\n]+)/i)
    company_name = compMatch?.[1]?.trim() ?? ''
  }

  // — Générique pour tous les autres sites —
  else {
    const title = ogTitle ?? pageTitle ?? ''

    // Essaie de séparer poste / entreprise
    const separators = [' - ', ' | ', ' chez ', ' at ', ' · ']
    let found = false
    for (const sep of separators) {
      if (title.includes(sep)) {
        const parts = title.split(sep)
        job_title    = parts[0]?.trim() ?? ''
        company_name = parts[1]?.trim() ?? ogSiteName ?? ''
        found = true
        break
      }
    }
    if (!found) {
      job_title    = title.trim()
      company_name = ogSiteName ?? ''
    }

    notes = ogDescription ?? ''
  }

  // 5. Nettoyage final
  const clean = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, 100)

  return NextResponse.json({
    company_name: clean(company_name),
    job_title:    clean(job_title),
    location:     clean(location),
    notes:        notes.slice(0, 300) || null,
    hr_contact:   null,
  })
}