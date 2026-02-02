const fs = require('fs-extra');
const path = require('path');

function generateColorSets(dictionary, config) {
  const buildPath = config.buildPath || 'build/ios/Assets.xcassets/';
  
  console.log('\n🎨 Generating iOS Color Sets...\n');
  
  // Assets.xcassets 폴더 생성
  fs.ensureDirSync(buildPath);
  
  // Contents.json for Assets.xcassets
  const assetsContents = {
    info: {
      version: 1,
      author: "xcode"
    }
  };
  fs.writeFileSync(
    path.join(buildPath, 'Contents.json'),
    JSON.stringify(assetsContents, null, 2)
  );
  
  // ✅ sementic 레이어만 필터링
  const tokens = dictionary.allTokens.filter(token => {
    // token.path 예시: ['sementic', 'filled', 'button', 'bg']
    return token.type === 'color' && 
           token.path && 
           token.path[0] === 'sementic';
  });
  
  console.log(`Found ${tokens.length} sementic color tokens to process\n`);
  
  if (tokens.length === 0) {
    console.warn('⚠️  No sementic tokens found.');
    console.warn('    Available token paths:');
    dictionary.allTokens
      .filter(t => t.type === 'color')
      .slice(0, 5)
      .forEach(t => console.warn(`      - ${t.path.join('.')}`));
    return;
  }
  
  tokens.forEach(token => {
    let r, g, b, a = 1;
    
    // UIColor 형식 파싱
    if (token.value.includes('UIColor')) {
      const matches = token.value.match(/Red:([\d.]+)f\s+green:([\d.]+)f\s+blue:([\d.]+)f\s+alpha:([\d.]+)f/i);
      if (matches) {
        r = parseFloat(matches[1]);
        g = parseFloat(matches[2]);
        b = parseFloat(matches[3]);
        a = parseFloat(matches[4]);
      }
    }
    // HEX 형식 파싱
    else if (token.value.startsWith('#')) {
      const hex = token.value.replace('#', '');
      r = parseInt(hex.substring(0, 2), 16) / 255;
      g = parseInt(hex.substring(2, 4), 16) / 255;
      b = parseInt(hex.substring(4, 6), 16) / 255;
      if (hex.length === 8) {
        a = parseInt(hex.substring(6, 8), 16) / 255;
      }
    }
    // RGB 형식 파싱
    else if (token.value.startsWith('rgb')) {
      const matches = token.value.match(/[\d.]+/g);
      if (matches && matches.length >= 3) {
        r = parseInt(matches[0]) / 255;
        g = parseInt(matches[1]) / 255;
        b = parseInt(matches[2]) / 255;
        a = matches[3] ? parseFloat(matches[3]) : 1;
      }
    }
    else {
      console.warn(`⚠️  Unsupported color format for ${token.name}: ${token.value}`);
      return;
    }
    
    // NaN 체크
    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      console.error(`❌ Invalid color values for ${token.name}: ${token.value}`);
      return;
    }
    
    // ✅ 컬러 이름 생성 (sementic.filled.button.bg -> FilledButtonBg)
    const colorName = token.path
      .slice(1) // 'sementic' 제거
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    
    const colorsetPath = path.join(buildPath, `${colorName}.colorset`);
    
    // .colorset 폴더 생성
    fs.ensureDirSync(colorsetPath);
    
    // Contents.json 생성
    const contents = {
      info: {
        version: 1,
        author: "xcode"
      },
      colors: [
        {
          idiom: "universal",
          color: {
            "color-space": "srgb",
            components: {
              red: r.toFixed(3),
              green: g.toFixed(3),
              blue: b.toFixed(3),
              alpha: a.toFixed(3)
            }
          }
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(colorsetPath, 'Contents.json'),
      JSON.stringify(contents, null, 2)
    );
    
    console.log(`  ✅ ${colorName}.colorset (${token.value})`);
  });
  
  console.log(`\n✨ ${tokens.length} sementic colorsets generated at ${buildPath}\n`);
}

function cleanColorSets(dictionary, config) {
  const buildPath = config.buildPath || 'build/ios/Assets.xcassets/';
  
  if (fs.existsSync(buildPath)) {
    fs.removeSync(buildPath);
    console.log(`\n🗑️  Removed ${buildPath}\n`);
  }
}

module.exports = {
  do: generateColorSets,
  undo: cleanColorSets
};