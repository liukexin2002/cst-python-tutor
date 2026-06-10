// ============================================================
// 服务端 JointJS 链接渲染诊断脚本
// 测试 circuitLinkAttrs 是否正确应用在 standard.Link 上
// ============================================================
import joint from 'jointjs';

// ---- 模拟 circuitLinkAttrs（与 src/shapes/index.ts 一致） ----
const circuitLinkAttrs = {
  line: {
    connection: true,
    stroke: '#00d9ff',
    strokeWidth: 2.5,
    strokeLinejoin: 'round',
    fill: 'none',
    targetMarker: {
      'type': 'path',
      'd': 'M 10 -5 L 0 0 L 10 5 z',
      'fill': '#00d9ff',
      'stroke': '#00d9ff',
      'stroke-width': 1,
    },
  },
  wrapper: {
    connection: true,
    'stroke-width': 20,
    stroke: 'transparent',
    fill: 'none',
    'stroke-linecap': 'round',
  },
};

// ---- 步骤 1: 验证标准 Link 的默认 markup ----
console.log('='.repeat(60));
console.log('【步骤1】验证 standard.Link 默认 markup');
console.log('='.repeat(60));
const defaultLink = new joint.shapes.standard.Link();
console.log('Link markup 选择器:', defaultLink.markup.map(m => m.selector));
console.log();

// ---- 步骤 2: 创建 Graph 和两个带端口的矩形 ----
console.log('='.repeat(60));
console.log('【步骤2】创建带端口的矩形元件');
console.log('='.repeat(60));

const graph = new joint.dia.Graph();

const rect1 = new joint.shapes.standard.Rectangle({
  id: 'r1',
  position: { x: 100, y: 100 },
  size: { width: 90, height: 50 },
  attrs: {
    body: { fill: '#1a1a3e', stroke: '#ff9500', strokeWidth: 2.5 },
    label: { text: 'R1', fill: '#ff9500' },
  },
  ports: {
    groups: {
      in:  { position: { name: 'left', args: { dr: 10 } }, attrs: { portBody: { magnet: true, r: 5, fill: '#00d9ff' } }, markup: [{ tagName: 'circle', selector: 'portBody' }] },
      out: { position: { name: 'right', args: { dr: 10 } }, attrs: { portBody: { magnet: true, r: 5, fill: '#00d9ff' } }, markup: [{ tagName: 'circle', selector: 'portBody' }] },
    },
    items: [
      { id: 'r1-in',  group: 'in'  },
      { id: 'r1-out', group: 'out' },
    ],
  },
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'g', selector: 'ports' },
  ],
});

const rect2 = new joint.shapes.standard.Rectangle({
  id: 'r2',
  position: { x: 350, y: 100 },
  size: { width: 90, height: 50 },
  attrs: {
    body: { fill: '#1a1a3e', stroke: '#00d9ff', strokeWidth: 2.5 },
    label: { text: 'C1', fill: '#00d9ff' },
  },
  ports: {
    groups: {
      in:  { position: { name: 'left', args: { dr: 10 } }, attrs: { portBody: { magnet: true, r: 5, fill: '#00d9ff' } }, markup: [{ tagName: 'circle', selector: 'portBody' }] },
      out: { position: { name: 'right', args: { dr: 10 } }, attrs: { portBody: { magnet: true, r: 5, fill: '#00d9ff' } }, markup: [{ tagName: 'circle', selector: 'portBody' }] },
    },
    items: [
      { id: 'r2-in',  group: 'in'  },
      { id: 'r2-out', group: 'out' },
    ],
  },
  markup: [
    { tagName: 'rect', selector: 'body' },
    { tagName: 'text', selector: 'label' },
    { tagName: 'g', selector: 'ports' },
  ],
});

graph.addCells([rect1, rect2]);

const pos1 = rect1.position();
const size1 = rect1.size();
console.log('rect1 位置:', pos1.x, pos1.y, '尺寸:', size1.width, size1.height);

const pos2 = rect2.position();
console.log('rect2 位置:', pos2.x, pos2.y);
console.log();

// ---- 步骤 3: 创建 standard.Link + 直接应用 attrs（方式1） ----
console.log('='.repeat(60));
console.log('【步骤3】创建 Link 并通过构造函数传 attrs');
console.log('='.repeat(60));

const link1 = new joint.shapes.standard.Link({
  source: { id: 'r1', port: 'r1-out' },
  target: { id: 'r2', port: 'r2-in' },
  attrs: circuitLinkAttrs,
});

graph.addCell(link1);

// 输出完整 JSON
const json1 = link1.toJSON();
console.log(JSON.stringify(json1, null, 2));
console.log();

// ---- 步骤 4: 用 link.attr() 方式（方式2 - 深层合并） ----
console.log('='.repeat(60));
console.log('【步骤4】验证 link.attr() 深层合并');
console.log('='.repeat(60));

const link2 = new joint.shapes.standard.Link({
  source: { id: 'r1', port: 'r1-out' },
  target: { id: 'r2', port: 'r2-in' },
});

// 先用构造函数带一些基础 attrs
link2.attr(circuitLinkAttrs);

graph.addCell(link2);

const json2 = link2.toJSON();
console.log(JSON.stringify(json2, null, 2));
console.log();

// ---- 步骤 5: 关键检查项 ----
console.log('='.repeat(60));
console.log('【步骤5】关键检查项');
console.log('='.repeat(60));

function checkLink(json, label) {
  const errors = [];
  const passes = [];
  const attrs = json.attrs || {};

  // 检查 line selector 存在
  if (attrs.line) {
    passes.push('✅ line selector exists');
  } else {
    errors.push('❌ line selector MISSING');
  }

  // 检查 wrapper selector 存在
  if (attrs.wrapper) {
    passes.push('✅ wrapper selector exists');
  } else {
    errors.push('❌ wrapper selector MISSING');
  }

  // 检查 line.connection 是否为 true
  if (attrs.line && attrs.line.connection === true) {
    passes.push('✅ line.connection = true');
  } else {
    errors.push(`❌ line.connection = ${attrs.line?.connection} (expected true)`);
  }

  // 检查 wrapper.connection 是否为 true
  if (attrs.wrapper && attrs.wrapper.connection === true) {
    passes.push('✅ wrapper.connection = true');
  } else {
    errors.push(`❌ wrapper.connection = ${attrs.wrapper?.connection} (expected true)`);
  }

  // 检查 line.stroke
  if (attrs.line && attrs.line.stroke) {
    passes.push(`✅ line.stroke = "${attrs.line.stroke}"`);
  } else {
    errors.push('❌ line.stroke MISSING');
  }

  // 检查 line.targetMarker
  if (attrs.line && attrs.line.targetMarker) {
    const tm = attrs.line.targetMarker;
    passes.push('✅ line.targetMarker exists');
    passes.push(`  - type: "${tm.type}"`);
    passes.push(`  - d: "${tm.d}"`);
    passes.push(`  - fill: "${tm.fill}"`);
  } else {
    errors.push('❌ line.targetMarker MISSING');
  }

  // 检查是否存在旧的 .marker-target（不应该有）
  if (attrs['.marker-target']) {
    errors.push('⚠️  遗留的 .marker-target selector (带点号) 仍然存在');
  } else {
    passes.push('✅ 无遗留的 .marker-target');
  }

  // 检查是否有带点的旧选择器
  for (const key of Object.keys(attrs)) {
    if (key.startsWith('.')) {
      errors.push(`⚠️  发现带点号的选择器: "${key}"（应为无点号）`);
    }
  }

  // 检查 source/target
  console.log(`\n--- ${label} ---`);
  if (json.source) {
    passes.push(`✅ source: id=${json.source.id}, port=${json.source.port}`);
  }
  if (json.target) {
    passes.push(`✅ target: id=${json.target.id}, port=${json.target.port}`);
  }

  for (const p of passes) console.log(p);
  for (const e of errors) console.log(e);

  if (errors.length === 0) {
    console.log('\n🎉 所有检查通过！');
  } else {
    console.log(`\n⚠️  共 ${errors.length} 个问题`);
  }
}

checkLink(json1, 'link1 (构造函数传attrs)');
checkLink(json2, 'link2 (link.attr() 深层合并)');

// ---- 步骤 6: 对比方式1 vs 方式2 ----
console.log('\n' + '='.repeat(60));
console.log('【步骤6】方式1 vs 方式2 深度对比');
console.log('='.repeat(60));
const deepEqual = JSON.stringify(json1.attrs) === JSON.stringify(json2.attrs);
console.log(`两种方式的 attrs 是否完全一致: ${deepEqual ? '✅ YES' : '⚠️  NO'}`);

if (!deepEqual) {
  console.log('\nlink1.attrs:');
  console.log(JSON.stringify(json1.attrs, null, 2));
  console.log('\nlink2.attrs:');
  console.log(JSON.stringify(json2.attrs, null, 2));
}

// ---- 步骤 7: 验证 graph 完整性 ----
console.log('\n' + '='.repeat(60));
console.log('【步骤7】Graph 完整性验证');
console.log('='.repeat(60));
console.log('Graph cells count:', graph.getCells().length);
console.log('Graph elements:', graph.getElements().length);
console.log('Graph links:', graph.getLinks().length);

// 确认 link 已连接到正确的 port
const links = graph.getLinks();
links.forEach((link, i) => {
  const src = link.get('source');
  const tgt = link.get('target');
  console.log(`\nLink ${i + 1}:`);
  console.log(`  source:`, JSON.stringify(src));
  console.log(`  target:`, JSON.stringify(tgt));

  // 验证 source 和 target 的 id/port 正确
  if (src && src.id === 'r1' && src.port === 'r1-out') {
    console.log('  ✅ source 连接正确');
  } else {
    console.log('  ❌ source 连接错误');
  }
  if (tgt && tgt.id === 'r2' && tgt.port === 'r2-in') {
    console.log('  ✅ target 连接正确');
  } else {
    console.log('  ❌ target 连接错误');
  }
});

console.log('\n' + '='.repeat(60));
console.log('测试完成');
console.log('='.repeat(60));