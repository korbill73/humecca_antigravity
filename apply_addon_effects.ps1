$files = Get-ChildItem "sub_addon_*.html"
foreach ($file in $files) {
    echo "Updating $($file.Name)..."
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace 'class="pricing-grid-custom"', 'class="pricing-grid compact-pricing"'
    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
}
echo "Done."
