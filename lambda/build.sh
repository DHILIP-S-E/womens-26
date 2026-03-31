#!/bin/bash
# Build Lambda functions for deployment
# Run this BEFORE terraform apply

set -e

LAMBDA_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$LAMBDA_DIR/.." && pwd)"

echo "==> Installing Lambda dependencies..."
cd "$LAMBDA_DIR"
npm install

echo "==> Compiling TypeScript..."
npm run build

# Function to package a Lambda
package_lambda() {
  local NAME=$1
  local PKG_DIR="$LAMBDA_DIR/dist/packages/$NAME"

  echo "==> Packaging $NAME..."
  rm -rf "$PKG_DIR"
  mkdir -p "$PKG_DIR"

  # Copy compiled JS
  cp "$LAMBDA_DIR/dist/lambda/$NAME/index.js" "$PKG_DIR/"
  cp "$LAMBDA_DIR/dist/lambda/shared/db.js" "$PKG_DIR/"
  cp "$LAMBDA_DIR/dist/lambda/shared/sns.js" "$PKG_DIR/"

  # Fix relative imports
  sed -i 's|../shared/db|./db|g' "$PKG_DIR/index.js"
  sed -i 's|../shared/sns|./sns|g' "$PKG_DIR/index.js"
  sed -i 's|../../src/generated/prisma/client.js|./generated/prisma/client.js|g' "$PKG_DIR/db.js"

  # Copy generated Prisma client (small — just the generated code)
  cp -r "$LAMBDA_DIR/dist/src/generated" "$PKG_DIR/"

  # Copy ONLY the required node_modules (not AWS SDK — already in Lambda runtime)
  mkdir -p "$PKG_DIR/node_modules"

  # Prisma runtime essentials only
  mkdir -p "$PKG_DIR/node_modules/@prisma"
  cp -r "$LAMBDA_DIR/node_modules/@prisma/client" "$PKG_DIR/node_modules/@prisma/client"
  cp -r "$LAMBDA_DIR/node_modules/@prisma/adapter-pg" "$PKG_DIR/node_modules/@prisma/adapter-pg"
  cp -r "$LAMBDA_DIR/node_modules/@prisma/driver-adapter-utils" "$PKG_DIR/node_modules/@prisma/driver-adapter-utils"
  cp -r "$LAMBDA_DIR/node_modules/@prisma/engines" "$PKG_DIR/node_modules/@prisma/engines"

  # pg (PostgreSQL client)
  cp -r "$LAMBDA_DIR/node_modules/pg" "$PKG_DIR/node_modules/pg"
  cp -r "$LAMBDA_DIR/node_modules/pg-types" "$PKG_DIR/node_modules/pg-types" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pg-pool" "$PKG_DIR/node_modules/pg-pool" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pg-protocol" "$PKG_DIR/node_modules/pg-protocol" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pg-connection-string" "$PKG_DIR/node_modules/pg-connection-string" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pg-int8" "$PKG_DIR/node_modules/pg-int8" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pg-numeric" "$PKG_DIR/node_modules/pg-numeric" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/pgpass" "$PKG_DIR/node_modules/pgpass" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/postgres-array" "$PKG_DIR/node_modules/postgres-array" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/postgres-bytea" "$PKG_DIR/node_modules/postgres-bytea" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/postgres-date" "$PKG_DIR/node_modules/postgres-date" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/postgres-interval" "$PKG_DIR/node_modules/postgres-interval" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/postgres-range" "$PKG_DIR/node_modules/postgres-range" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/buffer-writer" "$PKG_DIR/node_modules/buffer-writer" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/packet-reader" "$PKG_DIR/node_modules/packet-reader" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/split2" "$PKG_DIR/node_modules/split2" 2>/dev/null || true
  cp -r "$LAMBDA_DIR/node_modules/obuf" "$PKG_DIR/node_modules/obuf" 2>/dev/null || true

  # Remove Prisma query engine for non-Linux platforms (Lambda is Linux)
  # Keep only rhel-openssl-* or debian-openssl-* or linux-* engines
  find "$PKG_DIR/node_modules/@prisma/engines" -name "*.exe" -delete 2>/dev/null || true
  find "$PKG_DIR/node_modules/@prisma/engines" -name "*darwin*" -delete 2>/dev/null || true
  find "$PKG_DIR/node_modules/@prisma/engines" -name "*windows*" -delete 2>/dev/null || true

  local SIZE=$(du -sh "$PKG_DIR" | cut -f1)
  echo "    $NAME package size: $SIZE"
}

package_lambda "reminder-processor"
package_lambda "period-alert"

echo ""
echo "==> Build complete!"
echo "    - dist/packages/reminder-processor/"
echo "    - dist/packages/period-alert/"
echo ""
echo "Now run: cd ../terraform && terraform init && terraform apply"
