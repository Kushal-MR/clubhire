# End-to-end API test: talks to the running server like the browser would.
$base = "http://localhost:5050/api"
$pass = 0; $fail = 0

function Call($method, $path, $body, $session) {
  $req = @{ Method = $method; Uri = "$base$path"; WebSession = $session; ContentType = "application/json"; UseBasicParsing = $true }
  if ($body) { $req.Body = ($body | ConvertTo-Json) }
  try {
    $r = Invoke-WebRequest @req
    return @{ code = [int]$r.StatusCode; data = ($r.Content | ConvertFrom-Json) }
  } catch {
    $code = [int]$_.Exception.Response.StatusCode
    $msg = $_.ErrorDetails.Message
    return @{ code = $code; data = $(if ($msg) { $msg | ConvertFrom-Json } else { $null }) }
  }
}
function Check($name, $res, $expected) {
  if ($res.code -eq $expected) { $script:pass++; $s = "PASS" } else { $script:fail++; $s = "FAIL" }
  $err = if ($res.data -and $res.data.error) { " - " + $res.data.error } else { "" }
  Write-Output ("{0}  {1,-48} got {2}, expected {3}{4}" -f $s, $name, $res.code, $expected, $err)
}

function Expect($name, $ok, $detail) {
  if ($ok) { $script:pass++; $s = "PASS" } else { $script:fail++; $s = "FAIL" }
  Write-Output ("{0}  {1,-48} {2}" -f $s, $name, $detail)
}

$stu = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adm = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$adm2 = New-Object Microsoft.PowerShell.Commands.WebRequestSession

Check "me without login -> 401" (Call GET "/auth/me" $null $stu) 401
Check "register with bad data -> 400" (Call POST "/auth/register" @{ name = "A"; email = "bad"; password = "1"; usn = "x"; year = 9 } $stu) 400
Check "login wrong password -> 401" (Call POST "/auth/login" @{ email = "student@rvce.edu.in"; password = "nope1234" } $stu) 401
Check "login student" (Call POST "/auth/login" @{ email = "student@rvce.edu.in"; password = "password123" } $stu) 200

$list = Call GET "/openings" $null $stu
Check "list openings" $list 200
Write-Output ("      openings found: {0}" -f @($list.data).Count)
Check "search openings ?q=python" (Call GET "/openings?q=python" $null $stu) 200

$volunteer = @($list.data) | Where-Object { $_.title -eq "Event Volunteer" } | Select-Object -First 1
Check "apply with short message -> 400" (Call POST "/openings/$($volunteer._id)/apply" @{ message = "short" } $stu) 400
Check "apply to Event Volunteer" (Call POST "/openings/$($volunteer._id)/apply" @{ message = "I have volunteered at blood donation camps and enjoy organising events." } $stu) 201
Check "apply twice -> 409" (Call POST "/openings/$($volunteer._id)/apply" @{ message = "I have volunteered at blood donation camps and enjoy organising events." } $stu) 409
Check "student creates opening -> 403" (Call POST "/openings" @{ title = "x" } $stu) 403
$mine = Call GET "/applications/mine" $null $stu
Check "my applications" $mine 200
Write-Output ("      student has {0} applications" -f @($mine.data).Count)

Check "login GDG admin" (Call POST "/auth/login" @{ email = "gdg@rvce.edu.in"; password = "password123" } $adm) 200
$apps = Call GET "/openings/$($volunteer._id)/applications" $null $adm
Check "admin views applicants" $apps 200
$appId = @($apps.data)[0]._id
Check "Applied -> Selected (skip) -> 400" (Call PATCH "/applications/$appId/status" @{ status = "Selected" } $adm) 400
Check "Applied -> Shortlisted" (Call PATCH "/applications/$appId/status" @{ status = "Shortlisted"; note = "Interview Friday 4 PM" } $adm) 200
Check "student withdraw after shortlist -> 400" (Call DELETE "/applications/$appId" $null $stu) 400

$created = Call POST "/openings" @{ title = "Social Media Lead"; description = "Run our Instagram page and design posters for events."; skills = "Canva, Writing"; deadline = (Get-Date).AddDays(7).ToString("yyyy-MM-ddT23:59:00") } $adm
Check "admin creates opening" $created 201
$newId = $created.data._id
Check "create with past deadline -> 400" (Call POST "/openings" @{ title = "Old one"; description = "This opening has a deadline in the past."; deadline = "2020-01-01" } $adm) 400
Check "admin edits opening" (Call PUT "/openings/$newId" @{ title = "Social Media & Design Lead" } $adm) 200
Check "admin closes opening" (Call PUT "/openings/$newId" @{ isOpen = $false } $adm) 200

Check "student edits club details -> 403" (Call PUT "/clubs/mine" @{ rounds = "x" } $stu) 403
Check "club details: bad link -> 400" (Call PUT "/clubs/mine" @{ formLink = "javascript:alert(1)" } $adm) 400
Check "club details: invalid date -> 400" (Call PUT "/clubs/mine" @{ recruitmentDays = @("2026-13-45") } $adm) 400
Check "club details: unknown venue -> 400" (Call PUT "/clubs/mine" @{ venues = @("My Room") } $adm) 400

$astra = New-Object Microsoft.PowerShell.Commands.WebRequestSession
Check "login Astra admin" (Call POST "/auth/login" @{ email = "astra@rvce.edu.in"; password = "password123" } $astra) 200
$mineA = Call GET "/clubs/mine" $null $astra
Check "Astra sees its seeded clashes" $mineA 200
Expect "Astra has 2 clashes (SPARK + Dhruva)" (@($mineA.data.clashes).Count -eq 2) ("found " + @($mineA.data.clashes).Count)

$clash = Call PUT "/clubs/mine" @{ recruitmentDays = @("2026-10-30"); venues = @("MCA Seminar Hall"); rounds = "Round 1"; formLink = "https://forms.gle/example" } $adm
Check "GDG books MCA Seminar Hall on 30 Oct" $clash 200
Expect "...which is flagged as a clash" (@($clash.data.clashes).Count -ge 1) ("clashes: " + (@($clash.data.clashes) | ForEach-Object { $_.club }) -join ", ")
$fixed = Call PUT "/clubs/mine" @{ recruitmentDays = @("2026-11-05") } $adm
Check "GDG moves to 5 Nov" $fixed 200
Expect "...and the clash flag clears" (@($fixed.data.clashes).Count -eq 0) ("clashes: " + @($fixed.data.clashes).Count)

$dir = Call GET "/clubs" $null $stu
Check "directory lists all clubs" $dir 200
Write-Output ("      clubs in directory: {0}" -f @($dir.data).Count)

Check "login Coding Club admin" (Call POST "/auth/login" @{ email = "coding@rvce.edu.in"; password = "password123" } $adm2) 200
Check "other club edits opening -> 403" (Call PUT "/openings/$newId" @{ title = "hacked" } $adm2) 403
Check "other club moves applicant -> 403" (Call PATCH "/applications/$appId/status" @{ status = "Interview" } $adm2) 403

Check "admin deletes opening" (Call DELETE "/openings/$newId" $null $adm) 200
Check "get deleted opening -> 404" (Call GET "/openings/$newId" $null $adm) 404
Check "invalid id -> 400" (Call GET "/openings/not-an-id" $null $adm) 400
Check "logout" (Call POST "/auth/logout" $null $stu) 200
Check "me after logout -> 401" (Call GET "/auth/me" $null $stu) 401

Write-Output ""
Write-Output "RESULT: $pass passed, $fail failed"
