try {
    Start-Sleep -Seconds 5
    $r = Invoke-WebRequest 'https://boox-store.vercel.app' -UseBasicParsing -MaximumRedirection 5
    Write-Host ('HTTP STATUS: ' + $r.StatusCode)
    
    # Use -match for regex/substring search
    if ($r.Content -match 'Boox Store|بوكس ستور') {
        Write-Host 'CONTENT VERIFIED: Found Boox Store'
    } else {
        Write-Host 'CONTENT ERROR: Boox Store text not found'
        # Optional: dump content for debugging
        # $r.Content | Out-File -FilePath content_debug.txt
    }
} catch {
    Write-Host ('ERROR: ' + $_.Exception.Message)
}
