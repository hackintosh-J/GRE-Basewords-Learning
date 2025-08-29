
import { GoogleGenAI, Type } from "@google/genai";
import React, { useState, useEffect, useRef } from 'react';
import { EnrichedVocabulary } from '../types';
import { XMarkIcon } from './icons';

interface MindMapNode {
  id: number;
  label: string;
  words: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  x: number;
  y: number;
}

interface MindMapEdge {
  source: number;
  target: number;
}

interface MindMapData {
  nodes: MindMapNode[];
  edges: MindMapEdge[];
}

interface MindMapModalProps {
  vocabulary: EnrichedVocabulary[];
  sectionTitle: string;
  onClose: () => void;
}

const MindMapModal: React.FC<MindMapModalProps> = ({ vocabulary, sectionTitle, onClose }) => {
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const generateMindMap = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const schema = {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.INTEGER },
                    label: { type: Type.STRING },
                    words: { type: Type.ARRAY, items: { type: Type.STRING } },
                    sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                  },
                  required: ['id', 'label', 'words', 'sentiment', 'x', 'y']
                }
              },
              edges: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    source: { type: Type.INTEGER },
                    target: { type: Type.INTEGER },
                  },
                  required: ['source', 'target']
                }
              }
            },
            required: ['nodes', 'edges']
        };

        const wordList = JSON.stringify(vocabulary.map(v => ({ word: v.word, definition: v.definition, synonyms: v.synonyms || [] })));

        const prompt = `You are a data visualization expert and linguist, tasked with creating a vocabulary mind map. Your goal is to generate a JSON structure for a visually appealing, organic, "Connected Papers"-style network graph.

        Based on this list of GRE vocabulary words: ${wordList}.

        Your task is to:
        1.  **Identify Core Concepts:** Analyze the words and group them into semantically related clusters. Each cluster represents a core concept. A cluster can have one or more words.
        2.  **Label Nodes:** For each cluster, choose the most representative word as the node's 'label'.
        3.  **Determine Sentiment:** Classify the sentiment of each node's concept as 'positive', 'negative', or 'neutral'.
        4.  **Create Network Layout:**
            *   Identify the most central theme or concept from the word list. Place this central node near the center of the canvas (e.g., x: 50, y: 50).
            *   Arrange other nodes based on their semantic relationship to the central theme and to each other. Closely related nodes should be clustered together. The distance between nodes should reflect their semantic similarity.
            *   Distribute the nodes across the canvas (using x/y percentages from 5 to 95) to create a balanced, aesthetically pleasing, and non-overlapping layout. The layout should look organic, not like a rigid grid.
        5.  **Define Edges:** Create edges to connect nodes with strong semantic relationships (e.g., synonyms, antonyms, cause-effect, related concepts).

        The final output must be a single JSON object conforming to the provided schema. Return ONLY the JSON object.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const textResponse = response.text.trim();
        const parsedData: MindMapData = JSON.parse(textResponse);
        setMindMapData(parsedData);
      } catch (e) {
        console.error(e);
        setError("Sorry, the AI couldn't generate a mind map. This can happen with complex or very small word lists. Please try another section.");
      } finally {
        setIsLoading(false);
      }
    };

    if(vocabulary.length > 0) {
        generateMindMap();
    } else {
        setIsLoading(false);
        setError("There are no words in this list to generate a mind map.");
    }
  }, [vocabulary]);

  const sentimentClasses = {
    positive: 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900/50 dark:border-green-700 dark:text-green-300',
    negative: 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300',
    neutral: 'bg-blue-100 border-blue-500 text-blue-800 dark:bg-blue-900/50 dark:border-blue-700 dark:text-blue-300',
  };

  const lineSentimentClasses = {
    positive: 'stroke-green-500/70',
    negative: 'stroke-red-500/70',
    neutral: 'stroke-blue-500/70',
  }
  
  const getLineCoordinates = (edge: MindMapEdge) => {
    if (!mindMapData || !mapContainerRef.current) return null;
    const sourceNode = mindMapData.nodes.find(n => n.id === edge.source);
    const targetNode = mindMapData.nodes.find(n => n.id === edge.target);
    if (!sourceNode || !targetNode) return null;

    const { width, height } = mapContainerRef.current.getBoundingClientRect();

    return {
        x1: sourceNode.x * width / 100,
        y1: sourceNode.y * height / 100,
        x2: targetNode.x * width / 100,
        y2: targetNode.y * height / 100,
    };
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 w-full h-full max-w-6xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vocabulary Mind Map: <span className="text-indigo-600 dark:text-indigo-400">{sectionTitle}</span></h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <XMarkIcon className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </button>
        </header>

        <main className="flex-grow p-4 relative overflow-auto bg-slate-50 dark:bg-slate-900/50">
          {isLoading && <div className="absolute inset-0 flex items-center justify-center text-slate-500">Generating AI Mind Map...</div>}
          {error && <div className="absolute inset-0 flex items-center justify-center text-red-500 p-8 text-center">{error}</div>}
          
          {mindMapData && (
            <div className="w-full h-full relative" ref={mapContainerRef}>
                <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" width="100%" height="100%">
                    {mindMapData.edges.map((edge, i) => {
                        const coords = getLineCoordinates(edge);
                        if (!coords) return null;
                        const sourceNode = mindMapData.nodes.find(n => n.id === edge.source);
                        const sentiment = sourceNode?.sentiment || 'neutral';
                        return (
                            <line
                                key={i}
                                x1={coords.x1}
                                y1={coords.y1}
                                x2={coords.x2}
                                y2={coords.y2}
                                className={`stroke-2 ${lineSentimentClasses[sentiment]} opacity-50`}
                            />
                        )
                    })}
                </svg>

                {mindMapData.nodes.map(node => (
                    <div
                        key={node.id}
                        className={`absolute p-3 rounded-lg border-2 shadow-lg transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group ${sentimentClasses[node.sentiment]}`}
                        style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    >
                        <strong className="font-bold text-center block">{node.label}</strong>
                        <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-slate-800 text-white text-xs rounded-md shadow-lg w-max max-w-xs z-10">
                            {node.words.join(', ')}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
                        </div>
                    </div>
                ))}
            </div>
          )}
        </main>
        <footer className="p-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex justify-center items-center gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-500"></span> Positive</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-500"></span> Negative</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Neutral</div>
        </footer>
      </div>
    </div>
  );
};

export default MindMapModal;
