# ==========================================================================
#  Portfolio BTS SIO — serveur local de prévisualisation (Windows PowerShell)
#  Lance un petit serveur web sur http://localhost:8000 et ouvre le navigateur.
#  Utile car le navigateur ne lit pas les fichiers Markdown (contenu/*.md)
#  quand le site est ouvert par un simple double-clic sur index.html.
#  Utilisation : double-clic sur outils/serveur-local.bat (fermer la fenêtre pour arrêter).
# ==========================================================================
param(
  [int]$Port = 8000,
  [switch]$SansNavigateur   # ne pas ouvrir le navigateur automatiquement
)

$racine = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..')).TrimEnd('\')
$types = @{
  '.html' = 'text/html; charset=utf-8'; '.css' = 'text/css; charset=utf-8'; '.js' = 'text/javascript; charset=utf-8'
  '.md' = 'text/markdown; charset=utf-8'; '.svg' = 'image/svg+xml'; '.woff2' = 'font/woff2'; '.png' = 'image/png'
  '.jpg' = 'image/jpeg'; '.jpeg' = 'image/jpeg'; '.webp' = 'image/webp'; '.gif' = 'image/gif'; '.pdf' = 'application/pdf'
  '.txt' = 'text/plain; charset=utf-8'; '.xml' = 'application/xml; charset=utf-8'; '.json' = 'application/json; charset=utf-8'
  '.ico' = 'image/x-icon'; '.mp4' = 'video/mp4'
}

$ecoute = New-Object System.Net.HttpListener
$ecoute.Prefixes.Add("http://localhost:$Port/")
try {
  $ecoute.Start()
} catch {
  Write-Host "Impossible d'utiliser le port $Port (déjà occupé ?). Essaie : serveur-local.ps1 -Port 8080" -ForegroundColor Red
  exit 1
}

$adresse = "http://localhost:$Port/"
Write-Host ''
Write-Host "  Portfolio disponible sur $adresse" -ForegroundColor Yellow
Write-Host '  Modifie un fichier .md dans contenu/, puis actualise la page (F5).'
Write-Host '  Ferme cette fenêtre pour arrêter le serveur.'
Write-Host ''
if (-not $SansNavigateur) { Start-Process $adresse }

while ($ecoute.IsListening) {
  $contexte = $ecoute.GetContext()
  $requete = $contexte.Request
  $reponse = $contexte.Response
  try {
    if ($requete.HttpMethod -ne 'GET' -and $requete.HttpMethod -ne 'HEAD') {
      $reponse.StatusCode = 501
      continue
    }
    $relatif = [Uri]::UnescapeDataString($requete.Url.AbsolutePath).TrimStart('/').Replace('/', '\')
    $chemin = [IO.Path]::GetFullPath((Join-Path $racine $relatif))
    if (-not $chemin.StartsWith($racine, [StringComparison]::OrdinalIgnoreCase)) {
      $reponse.StatusCode = 403
      continue
    }
    if (Test-Path -LiteralPath $chemin -PathType Container) { $chemin = Join-Path $chemin 'index.html' }
    if (Test-Path -LiteralPath $chemin -PathType Leaf) {
      $octets = [IO.File]::ReadAllBytes($chemin)
      $extension = [IO.Path]::GetExtension($chemin).ToLowerInvariant()
      $reponse.ContentType = if ($types.ContainsKey($extension)) { $types[$extension] } else { 'application/octet-stream' }
      $reponse.Headers['Cache-Control'] = 'no-store'
      $reponse.ContentLength64 = $octets.Length
      if ($requete.HttpMethod -eq 'GET') { $reponse.OutputStream.Write($octets, 0, $octets.Length) }
    } else {
      $reponse.StatusCode = 404
      $message = [Text.Encoding]::UTF8.GetBytes("404 - fichier introuvable : /$($relatif.Replace('\', '/'))")
      $reponse.ContentType = 'text/plain; charset=utf-8'
      $reponse.OutputStream.Write($message, 0, $message.Length)
    }
  } catch {
    try { $reponse.StatusCode = 500 } catch {}
  } finally {
    try { $reponse.Close() } catch {}
  }
}
