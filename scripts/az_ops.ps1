<#
.SYNOPSIS
    Manage Azure Container Apps via REST API.
    Uses 'az account get-access-token' for authentication (az CLI must be in PATH and logged in).
.PARAMETER Execute
    Actually perform destructive operations. Without this flag, runs dry-run only.
.PARAMETER CustomDomain
    Also configure forgepilot.ai custom domain on forgepilot-web.
#>
param([switch]$Execute, [switch]$CustomDomain)

$ErrorActionPreference = "Stop"
New-Item -Force -ItemType Directory C:\temp | Out-Null
$LogFile = "C:\temp\az_ops_log.txt"
Set-Content $LogFile ""
function Log([string]$msg) {
    $line = "[$(Get-Date -Format 'HH:mm:ss')] $msg"
    Add-Content $LogFile $line; Write-Host $line
}
Log "=== az_ops.ps1 START | Execute=$Execute | CustomDomain=$CustomDomain ==="

# -- Get access token via az CLI --------------------------------------------
Log "Getting access token via az CLI..."
try {
    $azOut  = az account get-access-token --output json 2>&1
    $tokObj = $azOut | ConvertFrom-Json
    $tok    = $tokObj.accessToken
    $subId  = $tokObj.subscription
    $tenantId = $tokObj.tenant
    Log "TOKEN_OK len=$($tok.Length) sub=$subId expires=$($tokObj.expiresOn)"
} catch { Log "TOKEN_ERROR: $_ -- ensure az is in PATH and logged in (run: az login)"; exit 1 }

$hdr    = @{ Authorization = "Bearer $tok" }
$base   = "https://management.azure.com"
$apiVer = "2023-05-01"

function Add-ApiVersion([string]$url) {
    if ($url -notmatch 'api-version') {
        $sep = if ($url -match '\?') { '&' } else { '?' }
        $url = "${url}${sep}api-version=$script:apiVer"
    }
    return $url
}
function AzGet([string]$url) {
    $url = Add-ApiVersion $url
    Invoke-RestMethod -Uri $url -Headers $script:hdr -Method GET
}
function AzPut([string]$url, $b) {
    $url = Add-ApiVersion $url
    Invoke-RestMethod -Uri $url -Headers $script:hdr -Method PUT `
        -Body ($b | ConvertTo-Json -Depth 20) -ContentType "application/json"
}
function AzDelete([string]$url) {
    $url = Add-ApiVersion $url
    Invoke-RestMethod -Uri $url -Headers $script:hdr -Method DELETE
}
function AzPost([string]$url) {
    $url = Add-ApiVersion $url
    Invoke-RestMethod -Uri $url -Headers $script:hdr -Method POST `
        -ContentType "application/json" -Body "{}"
}

# -- List environments ------------------------------------------------------
Log "`n=== Container App Environments ==="
$envs = (AzGet "$base/subscriptions/$subId/providers/Microsoft.App/managedEnvironments?api-version=$apiVer").value
$srcEnv = $null; $dstEnv = $null
foreach ($e in $envs) {
    $rg = $e.id.Split("/")[4]
    Log "  ENV=$($e.name)  RG=$rg  LOC=$($e.location)"
    if ($e.name -eq "forgepilot-web-env")     { $srcEnv = $e }
    if ($e.name -eq "omega-core-env-eastus2") { $dstEnv = $e }
}
if (-not $srcEnv) { Log "ERROR: forgepilot-web-env not found!"; exit 1 }

# -- List container apps ----------------------------------------------------
Log "`n=== Container Apps ==="
$apps = (AzGet "$base/subscriptions/$subId/providers/Microsoft.App/containerApps?api-version=$apiVer").value
$toMove = @(); $webApp = $null
foreach ($a in $apps) {
    $rg      = $a.id.Split("/")[4]
    $envName = $a.properties.managedEnvironmentId.Split("/")[-1]
    $fqdn    = $a.properties.configuration.ingress.fqdn
    Log "  APP=$($a.name)  ENV=$envName  RG=$rg  FQDN=$fqdn"
    if ($a.properties.managedEnvironmentId -eq $srcEnv.id) {
        if ($a.name -eq "forgepilot-web") { $webApp = $a } else { $toMove += $a }
    }
}

# -- Plan -------------------------------------------------------------------
Log "`n=== Apps to move -> omega-core-env-eastus2 ==="
if ($toMove.Count -eq 0) { Log "  None - already in correct environments" }
else { $toMove | ForEach-Object { Log "  WILL_MOVE: $($_.name)" } }

# -- Create destination env if missing -------------------------------------
$srcRg    = $srcEnv.id.Split("/")[4]
$dstEnvId = if ($dstEnv) { $dstEnv.id } else {
    "/subscriptions/$subId/resourceGroups/$srcRg/providers/Microsoft.App/managedEnvironments/omega-core-env-eastus2"
}
if (-not $dstEnv -and $toMove.Count -gt 0) {
    Log "omega-core-env-eastus2 not found - will create in RG=$srcRg loc=$($srcEnv.location)"
    if ($Execute) {
        $envUrl = "$base/subscriptions/$subId/resourceGroups/$srcRg/providers/Microsoft.App/managedEnvironments/omega-core-env-eastus2?api-version=$apiVer"
        AzPut $envUrl @{ location = $srcEnv.location; properties = @{} } | Out-Null
        Log "CREATE_ENV submitted - waiting 60s for provisioning..."
        Start-Sleep -Seconds 60
        $dstEnvObj = AzGet $envUrl; $dstEnvId = $dstEnvObj.id
        Log "CREATED_ENV id=$dstEnvId"
    } else { Log "[DRY-RUN] Would CREATE omega-core-env-eastus2 in RG=$srcRg" }
}

# -- Move apps --------------------------------------------------------------
if ($toMove.Count -gt 0) {
    Log "`n=== Moving apps ==="
    foreach ($a in $toMove) {
        $rg      = $a.id.Split("/")[4]
        $appName = $a.name
        $appUrl  = "$base/subscriptions/$subId/resourceGroups/$rg/providers/Microsoft.App/containerApps/${appName}?api-version=$apiVer"
        if ($Execute) {
            Log "  Fetching full config for $appName ..."
            Log "  URL: $appUrl"
            $full = AzGet $appUrl
            # Strip read-only fields before re-PUT
            foreach ($f in @("systemData","etag")) { $full.PSObject.Properties.Remove($f) }
            foreach ($f in @("latestRevisionFqdn","latestRevisionName","provisioningState","outboundIpAddresses","customDomainVerificationId")) {
                $full.properties.PSObject.Properties.Remove($f)
            }
            $full.properties.managedEnvironmentId = $dstEnvId
            # environmentId is the canonical field in API 2023-05-01; set/overwrite it
            $full.properties | Add-Member -NotePropertyName environmentId -NotePropertyValue $dstEnvId -Force
            # Clear env-specific read-only ingress FQDN so Azure assigns a new one
            if ($full.properties.configuration -and $full.properties.configuration.ingress) {
                $full.properties.configuration.ingress.PSObject.Properties.Remove("fqdn")
            }
            # GET redacts secret values; fetch real values via listSecrets before DELETE
            $secretsUrl = "$base/subscriptions/$subId/resourceGroups/$rg/providers/Microsoft.App/containerApps/${appName}/listSecrets"
            try {
                $secretsResult = AzPost $secretsUrl
                if ($secretsResult -and $secretsResult.value -and $secretsResult.value.Count -gt 0) {
                    $full.properties.configuration.secrets = $secretsResult.value
                    Log "  Resolved $($secretsResult.value.Count) secret(s) via listSecrets"
                }
            } catch {
                Log "  WARN: listSecrets failed ($_) - stripping secrets from PUT body"
                if ($full.properties.configuration) {
                    $full.properties.configuration.PSObject.Properties.Remove("secrets")
                }
            }
            Log "  DELETING $appName from forgepilot-web-env ..."
            AzDelete $appUrl | Out-Null
            Start-Sleep -Seconds 15
            Log "  CREATING $appName in omega-core-env-eastus2 ..."
            AzPut $appUrl $full | Out-Null
            Log "  MOVED $appName -> omega-core-env-eastus2"
        } else {
            Log "  [DRY-RUN] Would delete+recreate $appName in omega-core-env-eastus2"
        }
    }
}

# -- Custom domain: forgepilot.ai ------------------------------------------
if ($CustomDomain) {
    Log "`n=== Custom Domain: forgepilot.ai -> forgepilot-web ==="
    if (-not $webApp) { Log "ERROR: forgepilot-web app not found"; exit 1 }
    $rg     = $webApp.id.Split("/")[4]
    $appUrl = "$base/subscriptions/$subId/resourceGroups/$rg/providers/Microsoft.App/containerApps/forgepilot-web?api-version=$apiVer"
    $full   = AzGet $appUrl
    $fqdn   = $full.properties.configuration.ingress.fqdn
    Log "  CURRENT_FQDN=$fqdn"

    # Verification ID: available directly on app properties from the GET above
    $verId = $full.properties.customDomainVerificationId
    if (-not $verId) {
        # Fallback: call listCustomHostNameAnalysis
        try {
            $verUrl = "$base/subscriptions/$subId/resourceGroups/$rg/providers/Microsoft.App/containerApps/forgepilot-web/listCustomHostNameAnalysis?customHostname=forgepilot.ai&api-version=$apiVer"
            $ver    = AzPost $verUrl
            $verId  = $ver.customDomainVerificationId
            Log "  VERIFICATION_ID (from analysis)=$verId"
        } catch {
            Log "  VERIFY_ERROR: $_ -- will proceed without TXT record"
        }
    } else {
        Log "  VERIFICATION_ID (from app properties)=$verId"
    }
    Log "  +-- DNS records to create in your registrar/DNS provider -----------+"
    Log "  |   CNAME  forgepilot.ai        ->  $fqdn"
    Log "  |   TXT    asuid.forgepilot.ai  ->  $verId"
    Log "  +-------------------------------------------------------------------+"
    Log "  Add those DNS records, wait for propagation, then re-run: .\az_ops.ps1 -Execute -CustomDomain"

    if ($Execute) {
        if (-not $full.properties.configuration.ingress.PSObject.Properties["customDomains"]) {
            $full.properties.configuration.ingress | Add-Member -NotePropertyName customDomains -NotePropertyValue @() -Force
        }
        $full.properties.configuration.ingress.customDomains = @(
            $full.properties.configuration.ingress.customDomains | Where-Object { $_.name -ne "forgepilot.ai" }
        ) + @(@{ name = "forgepilot.ai"; bindingType = "Disabled" })
        AzPut $appUrl $full | Out-Null
        Log "  CUSTOM_DOMAIN_ADDED (bindingType=Disabled - Azure provisions managed cert once DNS is live)"
        Log "  After cert is issued, re-run -Execute -CustomDomain to flip to bindingType=SniEnabled"
    } else {
        Log "  [DRY-RUN] Would add forgepilot.ai to ingress.customDomains (bindingType=Disabled)"
    }
}

Log "`n=== az_ops.ps1 COMPLETE ==="
Log "Full log: $LogFile"
