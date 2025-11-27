"use client";

import { useAction } from "convex/react";
import { useState } from "react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";

export const KnowledgeBaseDebugger = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const debugKB = useAction(api.debug.knowledge.debugKnowledgeBase);
  const testSearch = useAction(api.debug.knowledge.testSearch);

  const handleDebugKB = async () => {
    setLoading(true);
    try {
      const result = await debugKB({ 
        organizationId: "org_31QtvqJKwhtvop04esLJMkmFouB" 
      });
      setResults({ type: "debug", ...result });
    } catch (error) {
      setResults({ type: "error", error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const handleTestSearch = async (query: string) => {
    setLoading(true);
    try {
      const result = await testSearch({ 
        organizationId: "org_31QtvqJKwhtvop04esLJMkmFouB",
        query 
      });
      setResults({ type: "search", query, ...result });
    } catch (error) {
      setResults({ type: "error", error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4 border rounded-lg">
      <h3 className="text-lg font-semibold">Knowledge Base Debugger</h3>
      
      <div className="flex gap-2 flex-wrap">
        <Button onClick={handleDebugKB} disabled={loading}>
          Debug Knowledge Base
        </Button>
        
        <Button onClick={() => handleTestSearch("shift creation")} disabled={loading}>
          Test: "shift creation"
        </Button>
        
        <Button onClick={() => handleTestSearch("assignment process")} disabled={loading}>
          Test: "assignment process"
        </Button>
        
        <Button onClick={() => handleTestSearch("how to create shift")} disabled={loading}>
          Test: "how to create shift"
        </Button>
      </div>

      {loading && <div>Loading...</div>}
      
      {results && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-semibold mb-2">Results:</h4>
          <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};