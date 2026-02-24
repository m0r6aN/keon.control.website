"""
Phase 1: Extract Azure credentials from MSAL cache via Windows DPAPI.
NO network calls. Writes refresh_token + tenant_id + sub_id to C:\\temp\\az_creds.json.
Run az_ops.ps1 (Phase 2) after this completes successfully.
"""
import json, os, sys, ctypes, ctypes.wintypes, traceback, time

os.makedirs("C:\\temp", exist_ok=True)
_log = open("C:\\temp\\az_log.txt", "w", encoding="utf-8", buffering=1)

def log(msg):
    print(msg, flush=True)
    _log.write(msg + "\n")
    _log.flush()

log("=== az_token_test.py (Phase 1 - DPAPI only) START ===")

AZ_CLIENT_ID = "04b07795-8ddb-461a-bbee-02f9e1bf7b46"
_home = os.environ.get("USERPROFILE") or os.environ.get("HOME") or os.path.expanduser("~")
log(f"HOME={_home}")
AZURE_DIR  = os.path.join(_home, ".azure")
PROFILE_FILE    = os.path.join(AZURE_DIR, "azureProfile.json")
TOKEN_CACHE_FILE = os.path.join(AZURE_DIR, "msal_token_cache.bin")


class DATA_BLOB(ctypes.Structure):
    _fields_ = [("cbData", ctypes.wintypes.DWORD), ("pbData", ctypes.POINTER(ctypes.c_char))]


def dpapi_decrypt(data: bytes) -> bytes:
    buf    = ctypes.create_string_buffer(data, len(data))
    inp    = DATA_BLOB(ctypes.sizeof(buf), buf)
    out    = DATA_BLOB()
    ok     = ctypes.windll.crypt32.CryptUnprotectData(
        ctypes.byref(inp), None, None, None, None, 0, ctypes.byref(out)
    )
    if not ok or not out.cbData:
        raise RuntimeError("CryptUnprotectData failed or returned empty")
    result = ctypes.string_at(out.pbData, out.cbData)
    ctypes.windll.kernel32.LocalFree(out.pbData)
    return result


def main():
    # ── 1. Read Azure subscription profile ─────────────────────────────────
    log(f"Reading profile: {PROFILE_FILE}")
    try:
        profile = json.load(open(PROFILE_FILE, encoding="utf-8-sig"))
    except Exception as e:
        log(f"PROFILE_ERROR={e}"); sys.exit(1)

    subs = profile.get("subscriptions", [])
    default_sub = next((s for s in subs if s.get("isDefault")), subs[0] if subs else None)
    if not default_sub:
        log("ERROR: no subscriptions found"); sys.exit(1)

    sub_id    = default_sub["id"]
    tenant_id = default_sub.get("tenantId", "")
    log(f"SUB_ID={sub_id}  TENANT={tenant_id}  NAME={default_sub.get('name','')}")

    # ── 2. DPAPI-decrypt the MSAL token cache ───────────────────────────────
    log(f"Reading token cache: {TOKEN_CACHE_FILE}")
    try:
        raw       = open(TOKEN_CACHE_FILE, "rb").read()
        log(f"CACHE_SIZE={len(raw)}")
        decrypted = dpapi_decrypt(raw)
        log(f"DPAPI_OK len={len(decrypted)}")
        cache     = json.loads(decrypted)
        log("CACHE_PARSED_OK")
    except Exception as e:
        log(f"DPAPI_ERROR={e}"); log(traceback.format_exc()); sys.exit(1)

    # -- 3. Scan AccessToken section: find valid token + correct auth realm ----
    # The 'realm' field on existing access tokens is the EXACT tenant Azure CLI
    # used when it acquired them. Use that for refresh instead of guessing.
    access_tokens = cache.get("AccessToken", {})
    refresh_tokens = cache.get("RefreshToken", {})
    log(f"AT_COUNT={len(access_tokens)}  RT_COUNT={len(refresh_tokens)}")

    now = time.time()
    access_tok = None
    auth_realm = None  # realm extracted from AT entries - correct endpoint for refresh

    for k, t in access_tokens.items():
        if t.get("client_id") != AZ_CLIENT_ID:
            continue
        tgt = t.get("target", "").lower()
        if "management" not in tgt:
            continue
        realm = t.get("realm", "")
        exp = int(t.get("expires_on", "0") or "0")
        exp_in = exp - int(now)
        log(f"MGMT_AT realm={realm} expires_in={exp_in}s target={tgt[:80]}")
        if auth_realm is None:
            auth_realm = realm  # save even if expired - right realm for refresh
        if exp_in > 30 and access_tok is None:
            access_tok = t.get("secret")
            log(f"AT_VALID len={len(access_tok) if access_tok else 0}")

    # -- 4. Find refresh token (fallback if access token expired) ---------------
    refresh_tok = None
    matched_entry = None
    for t in refresh_tokens.values():
        client, tgt = t.get("client_id", ""), t.get("target", "")
        if client == AZ_CLIENT_ID or "management" in tgt:
            refresh_tok = t.get("secret")
            matched_entry = t
            log(f"FOUND_RT client={client} target={tgt[:80]}")
            break
    if not refresh_tok and refresh_tokens:
        first = list(refresh_tokens.values())[0]
        refresh_tok = first.get("secret")
        matched_entry = first
        log(f"FALLBACK_RT client={first.get('client_id','')} target={first.get('target','')[:60]}")

    if not access_tok and not refresh_tok:
        log("ERROR: no token found - run 'az login' to re-authenticate"); sys.exit(1)

    # auth_realm priority: from AT entries > home_account_id > common
    if not auth_realm and matched_entry:
        haid = matched_entry.get("home_account_id", "")
        if "." in haid:
            candidate = haid.split(".")[-1]
            if len(candidate) == 36 and candidate.count("-") == 4:
                auth_realm = candidate
    if not auth_realm:
        auth_realm = "common"
    log(f"AUTH_REALM={auth_realm}  HAS_AT={'yes' if access_tok else 'no-expired'}  HAS_RT={'yes' if refresh_tok else 'no'}")

    # -- 5. Write credentials file (no network) ---------------------------------
    out_path = "C:\\temp\\az_creds.json"
    with open(out_path, "w") as f:
        json.dump({"refresh_token": refresh_tok,
                   "access_token": access_tok,
                   "auth_tenant": auth_realm,
                   "tenant_id": tenant_id,
                   "sub_id": sub_id,
                   "client_id": AZ_CLIENT_ID}, f)
    log(f"CREDS_WRITTEN -> {out_path}")
    log("=== Phase 1 COMPLETE. Run az_ops.ps1 next. ===")
    _log.close()


if __name__ == "__main__":
    main()
