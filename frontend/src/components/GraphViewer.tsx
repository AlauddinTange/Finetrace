import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Node, Edge, Controls, Background, BackgroundVariant, NodeTypes, Handle, Position,
  useNodesState, useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, User, Users, CreditCard, ArrowRightLeft, Monitor } from 'lucide-react';

export type GraphNodeType = 'employee' | 'customer' | 'account' | 'transaction' | 'device';

export interface GraphNodeData {
  label: string;
  type: GraphNodeType;
  details?: Record<string, string | number | null | undefined>;
}

const NODE_CFG: Record<GraphNodeType, { border: string; bg: string; color: string; Icon: React.ElementType }> = {
  employee:    { border: '#F5A623', bg: '#F5A62312', color: '#F5A623', Icon: User },
  customer:    { border: '#4ADEDE', bg: '#4ADEDE12', color: '#4ADEDE', Icon: Users },
  account:     { border: '#00E5A0', bg: '#00E5A012', color: '#00E5A0', Icon: CreditCard },
  transaction: { border: '#8B92A6', bg: '#8B92A612', color: '#8B92A6', Icon: ArrowRightLeft },
  device:      { border: '#9B59B6', bg: '#9B59B612', color: '#9B59B6', Icon: Monitor },
};

function CustomNode({ data }: { data: GraphNodeData }) {
  const cfg = NODE_CFG[data.type] ?? NODE_CFG.transaction;
  const Icon = cfg.Icon;
  return (
    <div style={{
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      borderRadius: '10px', padding: '8px 12px', fontSize: '12px', fontWeight: 600,
      display: 'flex', alignItems: 'center', gap: '6px', minWidth: '130px',
      boxShadow: `0 0 12px ${cfg.border}25`,
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0, pointerEvents: 'none' }} />
      <Icon size={13} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{data.label}</span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0, pointerEvents: 'none' }} />
    </div>
  );
}

const nodeTypes: NodeTypes = { custom: CustomNode };

interface GraphViewerProps {
  nodes?: Node[];
  edges?: Edge[];
}

const GraphViewer: React.FC<GraphViewerProps> = ({ nodes: initNodes = [], edges: initEdges = [] }) => {
  const [nodes, , onNodesChange] = useNodesState(initNodes);
  const [edges, , onEdgesChange] = useEdgesState(initEdges);
  const [selected, setSelected] = useState<GraphNodeData | null>(null);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelected(node.data as GraphNodeData);
  }, []);

  return (
    <div className="relative w-full h-full">
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onPaneClick={() => setSelected(null)}
        nodeTypes={nodeTypes} fitView fitViewOptions={{ padding: 0.2 }}
        style={{ background: '#0B0E14' }}
      >
        <Controls showInteractive={false} />
        <Background variant={BackgroundVariant.Dots} color="#1A1F2E" gap={22} size={1.5} />
      </ReactFlow>
      {selected && (
        <div className="absolute top-4 right-4 w-72 bg-bg-card border border-border rounded-xl p-4 shadow-2xl z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-text-primary truncate">{selected.label}</span>
            <button onClick={() => setSelected(null)} className="text-text-muted hover:text-text-primary">
              <X size={13} />
            </button>
          </div>
          <span className="text-xs font-semibold capitalize px-2 py-0.5 rounded-md border"
            style={{ color: NODE_CFG[selected.type]?.color, background: `${NODE_CFG[selected.type]?.border}12`, borderColor: `${NODE_CFG[selected.type]?.border}30` }}>
            {selected.type}
          </span>
        </div>
      )}
    </div>
  );
};

export default GraphViewer;