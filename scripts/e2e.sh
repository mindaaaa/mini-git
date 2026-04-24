#!/usr/bin/env bash
# End-to-end test against a running dev server.
# Usage:  PORT=4321 ./scripts/e2e.sh
set -euo pipefail
PORT="${PORT:-4321}"
URL="http://localhost:$PORT/api/exec"

call() {
  local payload="$1"
  curl -sS -X POST "$URL" -H 'Content-Type: application/json' -d "$payload"
}

echo "=== step 1: init (no snapshot) ==="
R1=$(call '{"command":"init","args":[],"snapshot":null}')
echo "$R1" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{const o=JSON.parse(j); console.log("ok=",o.ok,"| stdout=",o.stdout,"| snap keys=",Object.keys(o.snapshot).length)})'
SNAP1=$(echo "$R1" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{process.stdout.write(JSON.stringify(JSON.parse(j).snapshot))})')

echo ""
echo "=== step 2: add hello.txt (snapshot from step 1 + file) ==="
PAYLOAD=$(node -e "console.log(JSON.stringify({command:'add',args:['hello.txt'],snapshot:$SNAP1,files:{'hello.txt':'hello world\n'}}))")
R2=$(call "$PAYLOAD")
echo "$R2" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{const o=JSON.parse(j); console.log("ok=",o.ok,"| stdout=",o.stdout,"| workingTree=",JSON.stringify(o.state.workingTree),"| index=",JSON.stringify(o.state.index))})'
SNAP2=$(echo "$R2" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{process.stdout.write(JSON.stringify(JSON.parse(j).snapshot))})')

echo ""
echo "=== step 3: commit \"first commit\" ==="
PAYLOAD=$(node -e "console.log(JSON.stringify({command:'commit',args:['first','commit'],snapshot:$SNAP2}))")
R3=$(call "$PAYLOAD")
echo "$R3" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{const o=JSON.parse(j); console.log("ok=",o.ok,"| stdout=",o.stdout,"| graph length=",o.state.graph.length,"| head=",JSON.stringify(o.state.head))})'
SNAP3=$(echo "$R3" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{process.stdout.write(JSON.stringify(JSON.parse(j).snapshot))})')

echo ""
echo "=== step 4: branch feature ==="
PAYLOAD=$(node -e "console.log(JSON.stringify({command:'branch',args:['feature'],snapshot:$SNAP3}))")
R4=$(call "$PAYLOAD")
echo "$R4" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{const o=JSON.parse(j); console.log("ok=",o.ok,"| stdout=",o.stdout,"| branches=",JSON.stringify(o.state.refs.branches.map(b=>b.name)))})'

echo ""
echo "=== step 5: log ==="
PAYLOAD=$(node -e "console.log(JSON.stringify({command:'log',args:[],snapshot:$SNAP3}))")
R5=$(call "$PAYLOAD")
echo "$R5" | node -e 'let j=""; process.stdin.on("data",d=>j+=d); process.stdin.on("end",()=>{const o=JSON.parse(j); console.log("ok=",o.ok); console.log("--- log stdout ---"); console.log(o.stdout); console.log("--- graph commits:", o.state.graph.length)})'
