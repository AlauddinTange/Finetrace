import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Header } from '../components/Header';
import { Search, ShieldAlert, Filter, User, CreditCard, ExternalLink, RefreshCw } from 'lucide-react';

const initialNodes: Node[] = [
  {
    id: 'emp-102',
    type: 'default',
    position: { x: 100, y: 150 },
    data: {
      label: (
        <div className="p-3 bg-bg-card border border-accent-red/50 rounded-xl shadow-lg w-48 text-left">
          <div className="flex items-center gap-2 mb-1">
            <User size={14} className="text-accent-red" />
            <span className="text-xs font-bold text-text-primary">Emp #102 (Flagged)</span>
          </div>
          <p className="text-[10px] text-text-muted">Risk Score: 92/100</p>
        </div>
      ),
    },
  },
  {
    id: 'acc-5521',
    type: 'default',
    position: { x: 400, y: 80 },
    data: {
      label: (
        <div className="p-3 bg-bg-card border border-accent-amber/50 rounded-xl shadow-lg w-48 text-left">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-accent-amber" />
            <span className="text-xs font-bold text-text-primary">Acct: ...5521</span>
          </div>
          <p className="text-[10px] text-text-muted">Volume: $540,000</p>
        </div>
      ),
    },
  },
  {
    id: 'acc-9912',
    type: 'default',
    position: { x: 400, y: 240 },
    data: {
      label: (
        <div className="p-3 bg-bg-card border border-border rounded-xl shadow-lg w-48 text-left">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard size={14} className="text-accent-cyan" />
            <span className="text-xs font-bold text-text-primary">Acct: ...9912</span>
          </div>
          <p className="text-[10px] text-text-muted">Volume: $120,000</p>
        </div>
      ),
    },
  },
  {
    id: 'beneficiary-ext',
    type: 'default',
    position: { x: 750, y: 150 },
    data: {
      label: (
        <div className="p-3 bg-bg-card border border-accent-red/50 rounded-xl shadow-lg w-48 text-left">
          <div className="flex items-center gap-2 mb-1">
            <ExternalLink size={14} className="text-accent-red" />
            <span className="text-xs font-bold text-text-primary">Ext Beneficiary</span>
          </div>
          <p className="text-[10px] text-text-muted">Shell Entity Risk</p>
        </div>
      ),
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'emp-102', target: 'acc-5521', animated: true, style: { stroke: '#FF4D6D', strokeWidth: 2 }, label: '$250,000' },
  { id: 'e1-3', source: 'emp-102', target: 'acc-9912', style: { stroke: '#4ADEDE', strokeWidth: 2 }, label: '$85,000' },
  { id: 'e2-4', source: 'acc-5521', target: 'beneficiary-ext', animated: true, style: { stroke: '#FF4D6D', strokeWidth: 3 }, label: '$499,000 (Structuring)' },
];

export const Graph: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [filterType, setFilterType] = useState('ALL');

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <main className="flex-1 flex flex-col p-6 max-w-7xl mx-auto w-full space-y-4">
        {/* Top Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card border border-border rounded-xl p-4">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Network Graph Explorer</h1>
            <p className="text-xs text-text-secondary mt-0.5">Multi-hop relationship mapping for financial crime investigation</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search nodes..."
                className="pl-9 pr-4 py-1.5 bg-bg-elevated border border-border rounded-lg text-xs text-text-primary focus:outline-none focus:border-accent-cyan"
              />
            </div>

            <div className="flex items-center gap-2 bg-bg-elevated border border-border rounded-lg px-3 py-1.5">
              <Filter className="text-text-muted" size={14} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs text-text-primary focus:outline-none"
              >
                <option value="ALL" className="bg-bg-card">All Entities</option>
                <option value="EMPLOYEE" className="bg-bg-card">Employees</option>
                <option value="ACCOUNT" className="bg-bg-card">Accounts</option>
                <option value="BENEFICIARY" className="bg-bg-card">Beneficiaries</option>
              </select>
            </div>

            <button
              onClick={() => {
                setNodes(initialNodes);
                setEdges(initialEdges);
              }}
              className="p-2 bg-bg-elevated border border-border hover:border-accent-cyan rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              title="Reset Graph Layout"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </div>

        {/* Main Canvas + Details Pane */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
          {/* React Flow Viewport */}
          <div className="lg:col-span-3 bg-bg-card border border-border rounded-xl overflow-hidden relative shadow-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={onNodeClick}
              connectionMode={ConnectionMode.Loose}
              fitView
            >
              <Background color="#232838" gap={20} />
              <Controls className="bg-bg-elevated border border-border rounded-lg fill-text-primary text-text-primary shadow-md" />
              <MiniMap
                style={{ backgroundColor: '#131721', border: '1px solid #232838', borderRadius: '8px' }}
                nodeColor="#4ADEDE"
                maskColor="rgba(19, 23, 33, 0.7)"
              />
            </ReactFlow>
          </div>

          {/* Right Inspector Sidebar */}
          <div className="bg-bg-card border border-border rounded-xl p-5 flex flex-col space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border">
              <ShieldAlert className="text-accent-cyan" size={18} />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">Entity Inspector</h2>
            </div>

            {selectedNode ? (
              <div className="space-y-4 text-sm text-text-primary">
                <div>
                  <span className="text-xs text-text-muted uppercase">Node ID</span>
                  <div className="font-mono font-semibold text-accent-cyan">{selectedNode.id}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase">Entity Type</span>
                  <div className="font-medium capitalize">{selectedNode.id.split('-')[0]}</div>
                </div>
                <div>
                  <span className="text-xs text-text-muted uppercase">Risk Level</span>
                  <div className="mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-accent-red/10 border border-accent-red/30 text-accent-red text-xs font-semibold">
                      HIGH RISK
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-border space-y-2">
                  <span className="text-xs text-text-muted uppercase">Connected Transactions</span>
                  <div className="p-3 bg-bg-elevated border border-border rounded-lg text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">TxID: #TX-9921</span>
                      <span className="text-accent-red font-semibold">$250,000</span>
                    </div>
                    <div className="text-[10px] text-text-muted">Flagged for rapid movement patterns</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-text-muted">
                <ShieldAlert size={32} className="text-text-muted/40 mb-2" />
                <p className="text-xs">Click any node on the canvas to inspect entity details, risk scores, and relationship paths.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};