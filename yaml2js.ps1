$ErrorActionPreference = "Stop"

# Use the folder where this script file lives as the absolute base path
$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Build absolute paths based on your layout
$sourceDir = Join-Path $baseDir "src-yaml"
$targetDir = $baseDir

# Ensure trailing backslash for path manipulation
$sourceDirSlash = $sourceDir
if (-not $sourceDirSlash.EndsWith("\")) { $sourceDirSlash += "\" }

# -Recurse enables searching all subdirectories
$yamlFiles = Get-ChildItem -Path "$sourceDir\*.yaml" -Recurse

# Create UTF-8 encoder without BOM
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $yamlFiles) {
    # 1. Calculate relative path using string replacement (Compatible with PowerShell 5.1)
    $relativePath = $file.FullName.Replace($sourceDirSlash, "")

    # 2. Change extension from .yaml to .json
    $jsonRelativePath = $relativePath -replace '\.yaml$', '.json'

    # 3. Build absolute target path
    $jsonPath = Join-Path $targetDir $jsonRelativePath

    # 4. Create target subdirectory if it doesn't exist
    $targetFileDir = Split-Path -Parent $jsonPath
    if (-not (Test-Path $targetFileDir)) {
        New-Item -ItemType Directory -Path $targetFileDir | Out-Null
    }

    Write-Host "Converting: src-yaml\$relativePath -> $jsonRelativePath"

    # 5. Convert and write file
    $jsonContent = npx js-yaml $file.FullName
    [System.IO.File]::WriteAllLines($jsonPath, $jsonContent, $utf8WithoutBom)
}

Write-Host "Success: All YAML files (including subdirectories) converted to UTF-8 (No BOM) JSON!" -ForegroundColor Green

# Collect all JSON files under the source language directory recursively.
$sourceLangDir = Join-Path $baseDir "lang"
$jsonFiles = Get-ChildItem -Path $sourceLangDir -Filter "*.json" -Recurse
# Target extension language folder in the user profile.
$extensionPath = Join-Path $env:USERPROFILE ".vscode\extensions\VS-Code-for-edk2\lang"

foreach ($file in $jsonFiles) {
    # Preserve any subdirectory structure from sourceDir\lang in the destination.
    $relativeLangPath = $file.FullName.Replace($sourceLangDir.TrimEnd('\') + "\", "")
    $destinationFile = Join-Path $extensionPath $relativeLangPath
    $destinationDir = Split-Path -Parent $destinationFile

    if (-not (Test-Path $destinationDir)) {
        New-Item -ItemType Directory -Path $destinationDir | Out-Null
    }

    # Copy each JSON file to the extension folder, overwriting existing files.
    Copy-Item -Path $file.FullName -Destination $destinationFile -Force
}
Write-Host "Success: Copying .vscode\extensions\VS-Code-for-edk2 completed!" -ForegroundColor Green
