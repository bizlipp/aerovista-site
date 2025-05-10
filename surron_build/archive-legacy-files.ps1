# Archive Legacy Files Script
# This script archives legacy files that have been replaced by GameCore and Redux

# Create archive directory if not exists
$archiveDir = "archive/legacy"
if (!(Test-Path -Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir -Force
    Write-Host "Created archive directory: $archiveDir"
}

# Define list of legacy files to archive
$legacyFiles = @(
    "adventure-game.js",
    "fishing-game.js",
    "FishingGameSession.js",
    "player-state.js",
    "GameBridge.js"
)

# Archive files if they exist
foreach ($file in $legacyFiles) {
    if (Test-Path -Path $file) {
        # Copy to archive
        Copy-Item -Path $file -Destination "$archiveDir/$file" -Force
        Write-Host "Archived: $file to $archiveDir/$file"
        
        # Delete original
        Remove-Item -Path $file -Force
        Write-Host "Deleted original: $file"
    } else {
        Write-Host "File not found: $file (already deleted or never existed)"
    }
}

# Look for additional legacy files
$additionalLegacyFiles = Get-ChildItem -Path "." -Filter "*legacy*.js" -Recurse
foreach ($file in $additionalLegacyFiles) {
    # Skip files that are already in the archive directory
    if ($file.FullName -like "*archive*") {
        continue
    }
    
    # Copy to archive
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Copy-Item -Path $file.FullName -Destination "$archiveDir/$($file.Name)" -Force
    Write-Host "Archived additional legacy file: $relativePath to $archiveDir/$($file.Name)"
}

Write-Host "Legacy file archiving complete!" 