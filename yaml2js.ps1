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
