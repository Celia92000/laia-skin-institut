"use client";

import { useState, useEffect } from 'react';

export default function TestSyncPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/services-sync');
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      console.error('Erreur:', error);
      setTestResults({ error: 'Erreur lors du test' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Test de Synchronisation des Services
        </h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">État des tests</h2>
            <button
              onClick={runTests}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Test en cours...' : 'Relancer les tests'}
            </button>
          </div>
          
          {testResults?.summary && (
            <div className={`p-4 rounded-lg ${
              testResults.summary.status === 'ALL_PASSED' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <p className="font-semibold">
                {testResults.summary.status === 'ALL_PASSED' ? '✅ Tous les tests réussis' : '❌ Certains tests ont échoué'}
              </p>
              <p>
                {testResults.summary.passed}/{testResults.summary.totalTests} tests réussis
              </p>
            </div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Exécution des tests...</p>
          </div>
        )}

        {testResults?.tests && (
          <div className="space-y-6">
            {testResults.tests.map((test: any, index: number) => (
              <div key={index} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-2xl ${
                    test.status === 'success' ? '✅' : '❌'
                  }`}>
                    {test.status === 'success' ? '✅' : '❌'}
                  </span>
                  <h3 className="text-lg font-semibold">{test.name}</h3>
                </div>
                
                {test.error && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-red-800">{test.error}</p>
                  </div>
                )}
                
                {test.data && (
                  <div className="bg-gray-50 rounded p-4">
                    <pre className="text-sm overflow-auto">
                      {JSON.stringify(test.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {testResults?.error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>Erreur: {testResults.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}