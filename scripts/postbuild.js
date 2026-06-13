const fs = require('fs');
const path = require('path');

const cjsIndexPath = path.join(__dirname, '../dist/cjs/index.js');
if (fs.existsSync(cjsIndexPath)) {
  let content = fs.readFileSync(cjsIndexPath, 'utf8');
  content += '\nmodule.exports = NhacCuaTui;\nmodule.exports.NhacCuaTui = NhacCuaTui;\nmodule.exports.default = NhacCuaTui;\n';
  fs.writeFileSync(cjsIndexPath, content, 'utf8');
  console.log('✅ Successfully appended CommonJS module compatibility exports.');
} else {
  console.error('❌ dist/cjs/index.js not found for postbuild step!');
  process.exit(1);
}
