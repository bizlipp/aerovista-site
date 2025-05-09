$divisionPages = @(
    "Divisions/vespera-publishing.html",
    "Divisions/summit-learning.html"
)

$properlyIndentedNav = @"
    <nav>
      <a href="../index.html">Home</a>
      <a href="../divisions.html">Divisions</a>
      <a href="../apps.html">Apps</a>
      <a href="../Store.html">Tools & Resources</a>
      <a href="../about.html">About</a>
    </nav>
"@

foreach ($page in $divisionPages) {
    # Check if file exists before attempting to modify it
    if (Test-Path $page) {
        Write-Host "Processing $page..."
        $content = Get-Content -Path $page -Raw
        
        # Create a backup of the file before modifying
        $backupPath = "$page.backup"
        Set-Content -Path $backupPath -Value $content
        Write-Host "Created backup at $backupPath"
        
        # Fix the indentation of only the navigation section, being very careful with pattern matching
        if ($content -match '<div class="logo"><strong>AeroVista</strong></div>\s*<nav>') {
            $updatedContent = $content -replace '(<div class="logo"><strong>AeroVista</strong></div>)\s*<nav>', "`$1`r`n    <nav>"
            
            # Only write changes if the pattern was found and replaced
            if ($updatedContent -ne $content) {
                Set-Content -Path $page -Value $updatedContent
                Write-Host "Fixed indentation in $page"
            } else {
                Write-Host "No changes needed in $page"
            }
        } else {
            Write-Host "Could not find navigation pattern in $page - skipping"
        }
    } else {
        Write-Host "Warning: File $page does not exist"
    }
}

Write-Host "All indentation operations completed." 