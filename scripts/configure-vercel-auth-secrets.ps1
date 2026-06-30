param(
  [switch]$LaunchNewWindow,
  [ValidateSet("production", "preview", "development")]
  [string]$Environment = "production",
  [string]$ProductionUrl = "https://documind-chi.vercel.app"
)

$ErrorActionPreference = "Stop"

if ($LaunchNewWindow) {
  $scriptPath = $PSCommandPath
  Start-Process powershell -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$scriptPath`" -Environment `"$Environment`" -ProductionUrl `"$ProductionUrl`"" -WindowStyle Normal
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

function Invoke-Vercel {
  param([string[]]$Arguments)

  & npx vercel @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "vercel $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

function Get-VercelEnvNames {
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
  $Value.Trim() | & npx vercel env $command $Key $TargetEnvironment
  if ($LASTEXITCODE -ne 0) {
    throw "vercel env $command $Key $TargetEnvironment failed with exit code $LASTEXITCODE"
  }
}

function Read-PlainSetting {
  param(
    [string]$Prompt,
    [string]$DefaultValue = ""
  )

  $suffix = if ([string]::IsNullOrWhiteSpace($DefaultValue)) { "" } else { " [$DefaultValue]" }
  $value = Read-Host "$Prompt$suffix"

  if ([string]::IsNullOrWhiteSpace($value)) {
    return $DefaultValue
  }

  return $value.Trim()
}

function Read-SecretSetting {
  param([string]$Prompt)

  $secureValue = Read-Host $Prompt -AsSecureString
  $plainValue = Convert-SecureStringToPlainText $secureValue

  if ([string]::IsNullOrWhiteSpace($plainValue)) {
    throw "$Prompt cannot be empty."
  }

  return $plainValue.Trim()
}

$authUrl = Read-PlainSetting "Production AUTH_URL" $ProductionUrl
$googleClientId = Read-PlainSetting "Google OAuth client ID"
$googleClientSecret = Read-SecretSetting "Google OAuth client secret"
$configureEmail = Read-Host "Configure Resend password reset email for $Environment now? Type yes to configure"

$existingNames = Get-VercelEnvNames $Environment

Set-VercelEnvValue "AUTH_URL" $authUrl $Environment $existingNames
Set-VercelEnvValue "AUTH_TRUST_HOST" "true" $Environment $existingNames
Set-VercelEnvValue "PASSWORD_RESET_BASE_URL" $authUrl $Environment $existingNames
Set-VercelEnvValue "AUTH_GOOGLE_ID" $googleClientId $Environment $existingNames
Set-VercelEnvValue "AUTH_GOOGLE_SECRET" $googleClientSecret $Environment $existingNames

if ($configureEmail.Trim().ToLowerInvariant() -eq "yes") {
  $resetEmailFrom = Read-PlainSetting "Password reset email from address"
  $resendApiKey = Read-SecretSetting "Resend API key"

  Set-VercelEnvValue "PASSWORD_RESET_EMAIL_FROM" $resetEmailFrom $Environment $existingNames
  Set-VercelEnvValue "RESEND_API_KEY" $resendApiKey $Environment $existingNames
}

$callbackUrl = (New-Object System.Uri((New-Object System.Uri($authUrl), "/api/auth/callback/google"))).ToString()

Write-Host ""
Write-Host "Updated Vercel $Environment auth settings. Secret values were not printed."
Write-Host "Register this Google OAuth callback URL:"
Write-Host "  $callbackUrl"
Write-Host ""
Write-Host "Redeploy production after changing Vercel environment variables:"
Write-Host "  npx vercel deploy --prod --yes"
