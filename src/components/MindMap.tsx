import { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotebookStore } from '../store/useNotebookStore';

// Portuguese stop words to filter out
const STOP_WORDS = new Set([
  'a', 'o', 'e', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas',
  'um', 'uma', 'uns', 'umas', 'com', 'por', 'para', 'que', 'se', 'ou', 'mais',
  'como', 'mas', 'ao', 'aos', 'pela', 'pelo', 'pelas', 'pelos', 'ser', 'ter',
  'foi', 'sao', 'tem', 'sua', 'seu', 'seus', 'suas', 'isso', 'isto', 'esta',
  'este', 'esse', 'essa', 'aqui', 'ali', 'la', 'nao', 'sim', 'muito', 'tambem',
  'ja', 'quando', 'onde', 'entre', 'sobre', 'ate', 'pode', 'deve', 'cada',
  'todo', 'toda', 'todos', 'todas', 'ele', 'ela', 'eles', 'elas', 'nos', 'voce',
  'eu', 'meu', 'minha', 'etc', 'the', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'need', 'dare', 'ought', 'used',
  'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'between', 'out',
  'off', 'over', 'under', 'again', 'further', 'then', 'once', 'and', 'but',
  'or', 'nor', 'not', 'so', 'than', 'too', 'very', 'just', 'because', 'while',
  'although', 'however', 'thus', 'hence', 'therefore', 'its', 'it', 'this',
  'that', 'these', 'those', 'there', 'their', 'they', 'them', 'which', 'who',
  'whom', 'what', 'where', 'when', 'why', 'how', 'all', 'any', 'both', 'each',
  'few', 'more', 'most', 'other', 'some', 'such', 'no', 'only', 'own', 'same',
  'so', 'than', 'also', 'an', 'if',
]);

interface MindMapNodeData {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  size: number;
  type: 'root' | 'section' | 'topic' | 'keyword';
  parentId: string | null;
}

function extractKeywords(text: string, max: number): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^\w\sà-ú]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) {
    freq[w] = (freq[w] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word);
}

export default function MindMap() {
  const { showSummary, setShowSummary, pages, sections } = useNotebookStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tab, setTab] = useState<'map' | 'summary'>('map');

  const { nodes, edges, summary } = useMemo(() => {
    const allNodes: MindMapNodeData[] = [];
    const allEdges: { from: string; to: string }[] = [];

    const cx = 500;
    const cy = 350;

    // Root node
    allNodes.push({
      id: 'root',
      label: 'Resumo do Momo',
      x: cx,
      y: cy,
      color: '#ec4899',
      size: 50,
      type: 'root',
      parentId: null,
    });

    const sectionGroups = sections.map((section) => {
      const sectionPages = pages
        .filter((p) => p.sectionId === section.id)
        .sort((a, b) => a.order - b.order);

      const topics = sectionPages
        .filter((p) => p.content.trim() || p.title.trim())
        .map((p) => {
          const lines = p.content.split('\n').filter((l) => l.trim());
          const keywords = extractKeywords(p.content, 4);
          return {
            title: p.title || 'Sem titulo',
            points: lines.slice(0, 5),
            keywords,
            hasMore: lines.length > 5,
            totalLines: lines.length,
          };
        });

      return { section, topics, totalNotes: sectionPages.length };
    }).filter((g) => g.topics.length > 0);

    // Layout sections in a circle around root
    const sectionCount = sectionGroups.length;
    const sectionRadius = 180;

    sectionGroups.forEach((group, si) => {
      const angle = (si / Math.max(sectionCount, 1)) * Math.PI * 2 - Math.PI / 2;
      const sx = cx + Math.cos(angle) * sectionRadius;
      const sy = cy + Math.sin(angle) * sectionRadius;

      const sectionId = `section-${group.section.id}`;
      allNodes.push({
        id: sectionId,
        label: group.section.name,
        x: sx,
        y: sy,
        color: group.section.color,
        size: 38,
        type: 'section',
        parentId: 'root',
      });
      allEdges.push({ from: 'root', to: sectionId });

      // Topics branch out from section
      const topicCount = group.topics.length;
      const topicRadius = 120;
      const angleSpread = Math.min(Math.PI * 0.6, topicCount * 0.4);
      const startAngle = angle - angleSpread / 2;

      group.topics.forEach((topic, ti) => {
        const tAngle = topicCount === 1
          ? angle
          : startAngle + (ti / (topicCount - 1)) * angleSpread;
        const tx = sx + Math.cos(tAngle) * topicRadius;
        const ty = sy + Math.sin(tAngle) * topicRadius;

        const topicId = `topic-${si}-${ti}`;
        allNodes.push({
          id: topicId,
          label: topic.title,
          x: tx,
          y: ty,
          color: group.section.color,
          size: 28,
          type: 'topic',
          parentId: sectionId,
        });
        allEdges.push({ from: sectionId, to: topicId });

        // Keywords branch out from topic
        const kwRadius = 70;
        const kwSpread = Math.min(Math.PI * 0.5, topic.keywords.length * 0.35);
        const kwStart = tAngle - kwSpread / 2;

        topic.keywords.forEach((kw, ki) => {
          const kAngle = topic.keywords.length === 1
            ? tAngle
            : kwStart + (ki / (topic.keywords.length - 1)) * kwSpread;
          const kx = tx + Math.cos(kAngle) * kwRadius;
          const ky = ty + Math.sin(kAngle) * kwRadius;

          const kwId = `kw-${si}-${ti}-${ki}`;
          allNodes.push({
            id: kwId,
            label: kw,
            x: kx,
            y: ky,
            color: group.section.color,
            size: 18,
            type: 'keyword',
            parentId: topicId,
          });
          allEdges.push({ from: topicId, to: kwId });
        });
      });
    });

    return { nodes: allNodes, edges: allEdges, summary: sectionGroups };
  }, [pages, sections]);

  const totalTopics = summary.reduce((acc, g) => acc + g.topics.length, 0);

  const nodeById = useMemo(() => {
    const map: Record<string, MindMapNodeData> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  return (
    <AnimatePresence>
      {showSummary && (
        <motion.div
          className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSummary(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-lettering text-3xl">Resumo do Estudo</h2>
                  <p className="text-violet-200 text-sm mt-0.5">
                    {totalTopics} topico(s) em {summary.length} sessao(oes)
                  </p>
                </div>
                <button
                  onClick={() => setShowSummary(false)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-lg"
                >
                  &times;
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setTab('map')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    tab === 'map' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  Mapa Mental
                </button>
                <button
                  onClick={() => setTab('summary')}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    tab === 'summary' ? 'bg-white text-purple-600' : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  Resumo
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {summary.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="font-caveat text-2xl">Nenhuma anotacao encontrada.</p>
                  <p className="text-sm mt-2">Comece a escrever nas paginas do caderno!</p>
                </div>
              ) : tab === 'map' ? (
                /* ===== MAPA MENTAL SVG ===== */
                <div className="relative w-full overflow-auto bg-gray-50" style={{ minHeight: 700 }}>
                  <svg
                    ref={svgRef}
                    viewBox="0 0 1000 700"
                    className="w-full h-auto"
                    style={{ minWidth: 800, minHeight: 600 }}
                  >
                    {/* Defs for glow/shadow */}
                    <defs>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="shadow">
                        <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.15" />
                      </filter>
                    </defs>

                    {/* Edges (curved lines) */}
                    {edges.map((edge, i) => {
                      const from = nodeById[edge.from];
                      const to = nodeById[edge.to];
                      if (!from || !to) return null;

                      const dx = to.x - from.x;
                      const dy = to.y - from.y;
                      const cx1 = from.x + dx * 0.4;
                      const cy1 = from.y;
                      const cx2 = from.x + dx * 0.6;
                      const cy2 = to.y;

                      return (
                        <motion.path
                          key={`edge-${i}`}
                          d={`M ${from.x} ${from.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${to.x} ${to.y}`}
                          fill="none"
                          stroke={to.color}
                          strokeWidth={to.type === 'keyword' ? 1 : to.type === 'topic' ? 1.5 : 2.5}
                          strokeOpacity={to.type === 'keyword' ? 0.3 : to.type === 'topic' ? 0.4 : 0.5}
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 0.8, delay: i * 0.03 }}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {nodes.map((node, i) => {
                      const isRoot = node.type === 'root';
                      const isSection = node.type === 'section';
                      const isKeyword = node.type === 'keyword';

                      const rx = isRoot ? 70 : isSection ? 50 : isKeyword ? 30 : 40;
                      const ry = isRoot ? 30 : isSection ? 22 : isKeyword ? 14 : 18;

                      return (
                        <motion.g
                          key={node.id}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            delay: 0.1 + i * 0.04,
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <ellipse
                            cx={node.x}
                            cy={node.y}
                            rx={rx}
                            ry={ry}
                            fill={isRoot ? '#ec4899' : isKeyword ? `${node.color}30` : `${node.color}20`}
                            stroke={node.color}
                            strokeWidth={isRoot ? 3 : isSection ? 2 : 1}
                            filter={isRoot ? 'url(#glow)' : 'url(#shadow)'}
                          />
                          <text
                            x={node.x}
                            y={node.y}
                            textAnchor="middle"
                            dominantBaseline="central"
                            fill={isRoot ? 'white' : '#374151'}
                            fontSize={isRoot ? 15 : isSection ? 13 : isKeyword ? 10 : 11}
                            fontWeight={isRoot || isSection ? 'bold' : 'normal'}
                            fontFamily="Caveat, cursive"
                            style={{ pointerEvents: 'none' }}
                          >
                            {node.label.length > 18 ? node.label.slice(0, 16) + '...' : node.label}
                          </text>
                        </motion.g>
                      );
                    })}
                  </svg>
                </div>
              ) : (
                /* ===== RESUMO TEXTUAL ===== */
                <div className="p-6 space-y-6">
                  {summary.map((group) => (
                    <div key={group.section.id}>
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: group.section.color }}
                        />
                        <h3 className="font-semibold text-gray-800">
                          {group.section.name}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {group.totalNotes} pagina(s)
                        </span>
                      </div>

                      <div className="space-y-3 ml-6">
                        {group.topics.map((topic, ti) => (
                          <motion.div
                            key={ti}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: ti * 0.08 }}
                            className="bg-gray-50 rounded-lg p-3"
                          >
                            <h4 className="font-caveat text-lg text-gray-800 font-bold flex items-center gap-2">
                              {topic.title}
                            </h4>

                            {/* Keywords badges */}
                            {topic.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 mb-2">
                                {topic.keywords.map((kw, ki) => (
                                  <span
                                    key={ki}
                                    className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                                    style={{ backgroundColor: group.section.color }}
                                  >
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            )}

                            {topic.points.length > 0 && (
                              <ul className="space-y-1">
                                {topic.points.map((point, pi) => (
                                  <li key={pi} className="text-sm text-gray-600 flex gap-2">
                                    <span className="text-pink-400 mt-0.5 flex-shrink-0">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                            {topic.hasMore && (
                              <p className="text-xs text-gray-400 mt-1">
                                +{topic.totalLines - 5} linhas...
                              </p>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => {
                  const text = summary.map((g) => {
                    const topicsText = g.topics.map((t) => {
                      const kws = t.keywords.length > 0
                        ? `  Palavras-chave: ${t.keywords.join(', ')}\n`
                        : '';
                      return `  ${t.title}\n${kws}${t.points.map((p) => `    - ${p}`).join('\n')}`;
                    }).join('\n\n');
                    return `[${g.section.name}]\n${topicsText}`;
                  }).join('\n\n---\n\n');
                  navigator.clipboard.writeText(`Resumo do Momo\n\n${text}`);
                }}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Copiar resumo
              </button>
              <button
                onClick={() => setShowSummary(false)}
                className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
