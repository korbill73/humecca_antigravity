$ErrorActionPreference = "Stop"

# 1. Generate new version string (yyyyMMdd.HHmm)
$timestamp = Get-Date -Format "yyyyMMdd.HHmm"
$version = "v.$timestamp"
Write-Host "Starting Test Deployment: $version" -ForegroundColor Cyan

# 2. Update components/loader.js
$loaderPath = "components/loader.js"
if (Test-Path $loaderPath) {
    $loaderContent = Get-Content $loaderPath -Raw -Encoding UTF8
    # Replace contents like 'v.20250101.1200'
    $loaderContent = $loaderContent -replace "v\.\d{8}\.\d{4}", $version
    Set-Content $loaderPath $loaderContent -Encoding UTF8
    Write-Host "Updated $loaderPath" -ForegroundColor Green
} else {
    Write-Warning "File not found: $loaderPath"
}

# 3. Update components/header.html
$headerPath = "components/header.html"
if (Test-Path $headerPath) {
    $headerContent = Get-Content $headerPath -Raw -Encoding UTF8
    $headerContent = $headerContent -replace "v\.\d{8}\.\d{4}", $version
    Set-Content $headerPath $headerContent -Encoding UTF8
    Write-Host "Updated $headerPath" -ForegroundColor Green
} else {
    Write-Warning "File not found: $headerPath"
}

# 4. Git Operations
Write-Host "Pushing to develop branch..." -ForegroundColor Cyan

# Ensure we are on develop or switch to it (optional, but good safety)
# For now, we assume we can just add/commit/push from current state or force checkout logic if needed.
# Simpler approach: verify branch or just commit and push. 
# We'll try to checkout develop first.
try {
    git checkout develop 2>$null
    if ($LASTEXITCODE -ne 0) {
        # If checkout failed (maybe local changes), we might need to stash or warn.
        # For this script helper, we'll assume standard flow.
        Write-Warning "Could not switch to develop branch. Proceeding with caution on current branch."
    }
} catch {
    # Ignored
}

git add $loaderPath $headerPath
$commitMsg = "Auto-deploy test version: $version"
git commit -m $commitMsg
git push origin develop

Write-Host "Success! Deployed $version to Cloudflare Pages (develop)." -ForegroundColor Cyan
