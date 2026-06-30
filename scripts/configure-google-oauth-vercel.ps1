param(
  [switch]$LaunchNewWindow,
  [ValidateSet("production", "preview", "development")]
  [string]$Environment = "production",
  [string]$ProductionUrl = "https://documind-chi.vercel.app",
  [switch]$Redeploy
)

$ErrorActionPreference = "Stop"

if ($LaunchNewWindow) {
  $scriptPath = $PSCommandPath
  $arguments = @(
    "-NoExit",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $scriptPath,
    "-Environment",
    $Environment,
    "-ProductionUrl",
    $ProductionUrl
  )

  if ($Redeploy) {
    $arguments += "-Redeploy"
  }

  Start-Process powershell -ArgumentList $arguments -WindowStyle Normal
  return
}

function Convert-SecureStringToPlainText {
  param([securestring]$SecureString)

  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureString)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

function Invoke-Checked {
  param(
    [Parameter(Mandatory = $true)]
    [string]$Command,

    [string[]]$Arguments = @()
  )

  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$Command $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Read-VercelEnvNames {
  param([string]$TargetEnvironment)

  $output = & npx vercel env ls $TargetEnvironment
  if ($LASTEXITCODE -ne 0) {
    throw "vercel env ls $TargetEnvironment failed with exit code $LASTEXITCODE"
  }

  return @($output | ForEach-Object {
    if ($_ -match '^\s*([A-Z][A-Z0-9_]+)\s+') {
      $matches[1]
    }
  })
}

function Set-VercelEnvValue {
  param(
    [string]$Key,
    [string]$Value,
    [string]$TargetEnvironment,
    [string[]]$ExistingNames
  )

  if ([string]::IsNullOrWhiteSpace($Value)) {
    throw "$Key cannot be empty."
  }

  $command = if ($ExistingNames -contains $Key) { "update" } else { "add" }
  $arguments = @("vercel", "env", $command, $Key, $TargetEnvironment, "--sensitive", "--yes")

  $Value.Trim() | & npx @arguments
  if ($LASTEXITCODE -ne 0) {
    throw "npx $($arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Read-PlainRequired {
  param([string]$Prompt)

  $value = Read-Host $Prompt

  if ([string]::IsNullOrWhiteSpace($value)) {
    throw "$Prompt cannot be empty."
  }

  return $value.Trim()
}

function Read-PlainWithDefault {
  param(
    [string]$Prompt,
    [string]$DefaultValue
  )

  $value = Read-Host "$Prompt [$DefaultValue]"

  if ([string]::IsNullOrWhiteSpace($value)) {
    return $DefaultValue
  }

  return $value.Trim()
}

function Read-SecretRequired {
  param([string]$Prompt)

  $secureValue = Read-Host $Prompt -AsSecureString
  $plainValue = Convert-SecureStringToPlainText $secureValue

  if ([string]::IsNullOrWhiteSpace($plainValue)) {
    throw "$Prompt cannot be empty."
  }

  return $plainValue.Trim()
}

$authUrl = Read-PlainWithDefault "DocuMind production URL / AUTH_URL" $ProductionUrl
$callbackUrl = (New-Object System.Uri((New-Object System.Uri($authUrl), "/api/auth/callback/google"))).ToString()

Write-Host ""
Write-Host "Google OAuth callback URL to register:"
Write-Host "  $callbackUrl"
Write-Host ""
Write-Host "After registering that callback URL in Google Cloud Console, enter the OAuth credentials below."
Write-Host "The client secret is read with Read-Host -AsSecureString and is not printed."
Write-Host ""

$googleClientId = Read-PlainRequired "Google OAuth client ID"
$googleClientSecret = Read-SecretRequired "Google OAuth client secret"
$existingNames = Read-VercelEnvNames $Environment

Set-VercelEnvValue "AUTH_URL" $authUrl $Environment $existingNames
Set-VercelEnvValue "AUTH_TRUST_HOST" "true" $Environment $existingNames
Set-VercelEnvValue "AUTH_GOOGLE_ID" $googleClientId $Environment $existingNames
Set-VercelEnvValue "AUTH_GOOGLE_SECRET" $googleClientSecret $Environment $existingNames

Write-Host ""
Write-Host "Updated Vercel $Environment variables for Google OAuth. Secret values were not printed."
Write-Host "Login page provider button becomes available after a new deployment."

if ($Redeploy) {
  Write-Host ""
  Write-Host "Redeploying production..."
  Invoke-Checked -Command "npx" -Arguments @("vercel", "deploy", "--prod", "--yes")
} elseif ($Environment -eq "production") {
  $redeployChoice = Read-Host "Redeploy production now? Type yes to deploy"

  if ($redeployChoice.Trim().ToLowerInvariant() -eq "yes") {
    Invoke-Checked -Command "npx" -Arguments @("vercel", "deploy", "--prod", "--yes")
  } else {
    Write-Host "Redeploy later with:"
    Write-Host "  npx vercel deploy --prod --yes"
  }
}
