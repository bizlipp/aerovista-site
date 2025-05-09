$divisionPages = @(
    "Divisions/vespera-publishing.html",
    "Divisions/horizon-aerial-visual.html", 
    "Divisions/summit-learning.html"
)

$newNav = @"
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
        $content = Get-Content -Path $page -Raw
        
        # Create a backup of the file before modifying
        $backupPath = "$page.backup"
        Set-Content -Path $backupPath -Value $content
        
        # Only replace the navigation section, being specific with the pattern
        # Look for the pattern where we have the logo div followed by a nav element 
        if ($content -match '<div class="logo"><strong>AeroVista</strong></div>\s*<nav>[\s\S]*?<\/nav>') {
            $updatedContent = $content -replace '(<div class="logo"><strong>AeroVista</strong></div>\s*)<nav>[\s\S]*?<\/nav>', "`$1$newNav"
            
            # Only write changes if the pattern was found and replaced
            if ($updatedContent -ne $content) {
                Set-Content -Path $page -Value $updatedContent
                Write-Host "Updated navigation in $page"
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

Write-Host "All division headers update operations completed." 