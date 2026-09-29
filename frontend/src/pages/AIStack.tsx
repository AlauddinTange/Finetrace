import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Cpu } from 'lucide-react';
import { apiClient } from '../api/client';

interface ModelInfo {
  name: string;
  type: string;
  purpose: string;
  library: string;
}

interface TrainedModel {
  model: string;
  dataset_size: number;
  train_size: number;
  test_size: number;
  positive_class: number;
  negative_class: number;
  test_metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    roc_auc: number;
  };
  cross_validation: {
    folds: number;
    accuracy_mean: number;
    accuracy_std: number;
  };
  feature_importances?: Record<string, number>;
}

interface AIStats {
  models: ModelInfo[];
  detectors: string[];
  benchmark: Record<string, number>;
  ground_truth_total: number;
  trained_model?: TrainedModel;
}

export const AIStack: React.FC = () => {
  const [stats, setStats] = useState<AIStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get<AIStats>('/api/v1/ai-stats/')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-secondary">
        Loading AI Stack…
      </div>
    );

  if (!stats)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center text-accent-red">
        Failed to load AI stats
      </div>
    );

  const tm = stats.trained_model;
  const hasTrained = tm && tm.test_metrics;

  return (
    <div className="min-h-screen bg-bg-primary">
      <Header />
      <main className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-text-primary">AI/ML Stack</h1>
          <p className="text-text-secondary text-sm mt-1">
            Five models · Six detectors · One hybrid pipeline
          </p>
        </div>

        {/* ── Trained Model Card (top — the headline) ── */}
        {hasTrained && tm && (
          <div className="bg-bg-card border-2 border-accent-green/50 rounded-xl p-6 shadow-[0_0_30px_rgba(0,229,160,0.1)]">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent-green">
                Supervised Model — Trained &amp; Tested
              </h3>
            </div>
            <p className="text-xs text-text-muted mb-5">
              {tm.model} · trained on {tm.train_size} employees · tested on {tm.test_size} unseen employees
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-accent-green">
                  {(tm.test_metrics.accuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                  Test Accuracy
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-accent-cyan">
                  {(tm.test_metrics.precision * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                  Precision
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-accent-cyan">
                  {(tm.test_metrics.recall * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                  Recall
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-accent-amber">
                  {(tm.test_metrics.f1 * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                  F1 Score
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-extrabold text-accent-green">
                  {(tm.test_metrics.roc_auc * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                  ROC-AUC
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-border flex flex-wrap justify-between gap-2 text-xs text-text-muted">
              <span>
                Cross-validation ({tm.cross_validation.folds}-fold):{' '}
                <span className="text-text-primary font-semibold">
                  {(tm.cross_validation.accuracy_mean * 100).toFixed(1)}% ±{' '}
                  {(tm.cross_validation.accuracy_std * 100).toFixed(1)}%
                </span>
              </span>
              <span>
                Dataset:{' '}
                <span className="text-text-primary font-semibold">
                  {tm.dataset_size} employees
                </span>{' '}
                · Positive: {tm.positive_class} · Negative: {tm.negative_class}
              </span>
            </div>
          </div>
        )}

        {/* ── Model Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.models.map((m, i) => (
            <div key={i} className="bg-bg-card border border-border rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-accent-cyan">
                <Cpu size={16} />
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                  {m.name}
                </h3>
              </div>
              <p className="text-xs uppercase tracking-wider text-accent-amber font-semibold">
                {m.type}
              </p>
              <p className="text-sm text-text-secondary">{m.purpose}</p>
              <p className="text-xs text-text-muted font-mono">Library: {m.library}</p>
            </div>
          ))}
        </div>

        {/* ── Detection Signals ── */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-4">
            Six Detection Signals
          </h3>
          <div className="flex flex-wrap gap-2">
            {stats.detectors.map((d, i) => (
              <span
                key={i}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30"
              >
                {d}
              </span>
            ))}
          </div>
        </div>

        {/* ── Pipeline Benchmark ── */}
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary mb-1">
            Pipeline Benchmark
          </h3>
          <p className="text-xs text-text-muted mb-4">
            End-to-end alert quality on ground-truth scenario labels
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-green">
                {stats.benchmark.precision ?? 0}
              </div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                Precision
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-amber">
                {stats.benchmark.recall ?? 0}
              </div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                Recall
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-cyan">
                {stats.benchmark.f1 ?? 0}
              </div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                F1 Score
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-accent-green">
                {stats.benchmark.fpr ?? 0}
              </div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                False Positive Rate
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-text-primary">
                {stats.ground_truth_total}
              </div>
              <div className="text-xs text-text-muted mt-1 uppercase tracking-wider">
                Scenarios Tested
              </div>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-4 text-center">
            Trained classifier + Isolation Forest + K-Means + LLM fact-verification · synthetic
            Aegis Bank data
          </p>
        </div>
      </main>
    </div>
  );
};

export default AIStack;