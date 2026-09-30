import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import GraphViewer from '../components/GraphViewer';
import { getAlerts, getEmployees, getTransactions } from '../api/endpoints';
import type { Node, Edge } from 'reactflow';

const Graph: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [alerts, employees, txns] = await Promise.all([
          getAlerts(),
          getEmployees(),
          getTransactions(),
        ]);

        const nodeMap = new Map<string, Node>();
        const edgeList: Edge[] = [];

        const topAlerts = alerts.slice(0, 15);
        topAlerts.forEach((a, i) => {
          const x = (i % 5) * 220;
          const y = Math.floor(i / 5) * 150;

          if (a.primary_employee_id && !nodeMap.has(`emp-${a.primary_employee_id}`)) {
            nodeMap.set(`emp-${a.primary_employee_id}`, {
              id: `emp-${a.primary_employee_id}`,
              type: 'custom',
              position: { x, y },
              data: { label: a.primary_employee_id, type: 'employee' },
            });
          }

          if (a.primary_transaction_id && !nodeMap.has(`txn-${a.primary_transaction_id}`)) {
            nodeMap.set(`txn-${a.primary_transaction_id}`, {
              id: `txn-${a.primary_transaction_id}`,
              type: 'custom',
              position: { x: x + 110, y: y + 80 },
              data: { label: a.primary_transaction_id.slice(0, 10), type: 'transaction' },
            });

            if (a.primary_employee_id) {
              edgeList.push({
                id: `e-${a.primary_employee_id}-${a.primary_transaction_id}`,
                source: `emp-${a.primary_employee_id}`,
                target: `txn-${a.primary_transaction_id}`,
                style: { stroke: '#232838', strokeWidth: 1.5 },
              });
            }
          }

          if (a.primary_customer_id && !nodeMap.has(`cust-${a.primary_customer_id}`)) {
            nodeMap.set(`cust-${a.primary_customer_id}`, {
              id: `cust-${a.primary_customer_id}`,
              type: 'custom',
              position: { x: x + 220, y },
              data: { label: a.primary_customer_id, type: 'customer' },
            });
          }
        });

        setNodes(Array.from(nodeMap.values()));
        setEdges(edgeList);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="px-6 py-6 max-w-screen-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-2xl font-extrabold text-text-primary">Investigation Graph</h1>
          <p className="text-text-secondary text-sm mt-1">
            {nodes.length} nodes · {edges.length} edges
          </p>
        </div>
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden h-[calc(100vh-220px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              Loading graph…
            </div>
          ) : nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full text-text-muted">
              No entities to graph yet
            </div>
          ) : (
            <GraphViewer nodes={nodes} edges={edges} />
          )}
        </div>
      </main>
    </div>
  );
};

export default Graph;
