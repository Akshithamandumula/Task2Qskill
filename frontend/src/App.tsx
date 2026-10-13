import React, { useState, useEffect } from 'react';
import { AppShell } from './components/layout/AppShell';
import { LoadingState } from './components/ui/LoadingState';
import { OverviewPage } from './pages/OverviewPage';
import { PredictPage } from './pages/PredictPage';
import { ExplorerPage } from './pages/ExplorerPage';
import { PreprocessingPage } from './pages/PreprocessingPage';
import { TrainingPage } from './pages/TrainingPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { InsightsPage } from './pages/InsightsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsAboutPage } from './pages/SettingsAboutPage';
import { api } from './services/api';
import { DatasetStatus, DatasetSummary, ModelStatus } from './types';

export function App() {
  const [activePage, setActivePage] = useState('overview');
  const [datasetStatus, setDatasetStatus] = useState<DatasetStatus | null>(null);
  const [datasetSummary, setDatasetSummary] = useState<DatasetSummary | null>(null);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  const refreshDataset = async () => {
    try {
      const [status, summary] = await Promise.all([
        api.getDatasetStatus(),
        api.getDatasetSummary(),
      ]);
      setDatasetStatus(status);
      setDatasetSummary(summary);
    } catch (err) {
      console.error('Failed to load dataset status:', err);
    }
  };

  const refreshModel = async () => {
    try {
      const status = await api.getModelStatus();
      setModelStatus(status);
    } catch (err) {
      console.error('Failed to load model status:', err);
    }
  };

  useEffect(() => {
    Promise.all([refreshDataset(), refreshModel()])
      .finally(() => setInitialLoading(false));
  }, []);

  if (initialLoading) {
    return (
      <div className="flex h-screen bg-[#0b0f19] items-center justify-center p-6">
        <LoadingState message="Initializing Estately AI Platform & ML Pipelines..." />
      </div>
    );
  }

  return (
    <AppShell
      activePage={activePage}
      setActivePage={setActivePage}
      datasetStatus={datasetStatus}
      modelStatus={modelStatus}
    >
      {activePage === 'overview' && (
        <OverviewPage
          datasetStatus={datasetStatus}
          datasetSummary={datasetSummary}
          modelStatus={modelStatus}
          setActivePage={setActivePage}
        />
      )}
      {activePage === 'predict' && (
        <PredictPage modelStatus={modelStatus} />
      )}
      {activePage === 'explorer' && (
        <ExplorerPage
          datasetStatus={datasetStatus}
          refreshDataset={refreshDataset}
        />
      )}
      {activePage === 'preprocessing' && <PreprocessingPage />}
      {activePage === 'training' && (
        <TrainingPage
          modelStatus={modelStatus}
          refreshModel={refreshModel}
          setActivePage={setActivePage}
        />
      )}
      {activePage === 'evaluation' && (
        <EvaluationPage modelStatus={modelStatus} />
      )}
      {activePage === 'insights' && <InsightsPage />}
      {activePage === 'history' && <HistoryPage />}
      {activePage === 'settings' && <SettingsAboutPage />}
    </AppShell>
  );
}

export default App;
