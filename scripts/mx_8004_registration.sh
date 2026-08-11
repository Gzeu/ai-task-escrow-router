#!/bin/bash
set -euo pipefail

API="https://devnet-mx8004-api.multiversx.com"
AGENT_NAME="AI Task Escrow Router"
DESCRIPTION="End-to-end AI task escrow & settlement protocol implementation"
CATEGORY="task-routing"

# Generate keypair
PRIVKEY=$(openssl genpkey -algorithm Ed25519 2>/dev/null)
PUBKEY_HEX="0x$(echo "$PRIVKEY" | openssl pkey -pubout -outform DER 2>/dev/null | tail -c 32 | xxd -p | tr -d '\n')"

# Create manifest content
MANIFEST_JSON='{
  "type": "https://multiversx.com/standards/mx-8004#registration-v1",
  "name": "'"$AGENT_NAME"'",
  "description": "'"$DESCRIPTION"'",
  "version": "0.5.0",
  "publicKey": "'"$PUBKEY_HEX"'",
  "metadata": [
    {
      "key": "category",
      "value": "'"$CATEGORY"'"
    }
  ],
  "oasf": {
    "schemaVersion": "0.8.0",
    "skills": [
      {
        "category": "Coordination",
        "items": [
          "task_routing",
          "escrow_management"
        ]
      }
    ],
    "domains": [
      {
        "category": "Finance",
        "items": [
          "defi"
        ]
      }
    ]
  },
  "standards_compliance": {
    "mx_8004_standard": true,
    "mx_address_standard": true,
    "escrow_standard": true
  }
}'

# Registration payload
REGISTER_PAYLOAD='{
  "name": "'"$AGENT_NAME"'",
  "uri": "'"$MANIFEST_JSON"'",
  "publicKey": "'"$PUBKEY_HEX"'",
  "metadata": [
    {
      "key": "category",
      "value": "'"$CATEGORY"'"
    }
  ]
}'

curl -s -X POST "$API/agents" \
  -H "Content-Type: application/json" \
  -d "$REGISTER_PAYLOAD"
