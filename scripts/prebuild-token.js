const fs = require('fs');
const inputPath = 'token.json';
const outputPath = 'token.build.json';

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

/**
 * Token Studio 구조:
 * {
 *   primitive: {...},
 *   scheme: {...},
 *   sementic: {...},
 *   $themes: [],
 *   $metadata: {...}
 * }
 *
 * → Style Dictionary 입력용:
 * {
 *   ...primitive,
 *   scheme,
 *   sementic,
 *   $themes,
 *   $metadata
 * }
 */

const output = {
  ...raw.primitive,
  scheme: raw.scheme,
  sementic: raw.sementic,
  $themes: raw.$themes,
  $metadata: raw.$metadata,
};

fs.writeFileSync(
  outputPath,
  JSON.stringify(output, null, 2)
);

console.log('✅ token.build.json generated');

