
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { Workflow, WorkflowNode, NodeType, WorkflowEdge, BrandIntelligence } from '../../types';
import { DraggableNode, nodeInfo } from './DraggableNode';
import { WorkflowNodeComponent } from './WorkflowNodeComponent';
import { NodeConfigPanel } from './NodeConfigPanel';
import { ChevronLeftIcon } from '../icons/ChevronLeftIcon';
import { SaveIcon } from '../icons/SaveIcon';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDownIcon } from '../icons/ChevronDownIcon';
import { ChevronRightIcon } from '../icons/ChevronRightIcon';
import { SearchIcon } from '../icons/SearchIcon';
import { XCloseIcon } from '../icons/XCloseIcon';
import { executeWorkflowGraph } from '../../services/workflowExecutionService';
import { SpinnerIcon } from '../icons/SpinnerIcon';
import { PlusIcon } from '../icons/PlusIcon';
import { MinusIcon } from '../icons/MinusIcon';
import { ClipboardListIcon } from '../icons/ClipboardListIcon';
import { WorkflowResultsModal } from './WorkflowResultsModal';


interface WorkflowBuilderProps {
    workflow: Workflow;
    onSave: (workflow: Workflow) => void;
    onClose: () => void;
    brandIntelligence?: BrandIntelligence;
    onCreateProject?: (project: any) => void;
}

const nodeCategories: { name: string; types: NodeType[] }[] = [
    {
        name: 'Input / Source',
        types: ['URLScraper', 'FileUpload', 'GoogleDriveImport', 'YouTubeVimeoImport', 'RSSFeed', 'FormIntake', 'BrandMemoryLoader']
    },
    {
        name: 'Processing / AI',
        types: ['AIRepurpose', 'Summarize', 'KeywordExtractor', 'CTAGenerator', 'HookGenerator', 'FactCheck', 'Translate', 'StyleTransfer']
    },
    {
        name: 'Human-in-the-Loop',
        types: ['EditorReview', 'FounderVoiceCheck', 'TeamCollaboration', 'QCChecklist', 'FeedbackCollector']
    },
    {
        name: 'Output / Distribution',
        types: ['ExportToGoogleDocs', 'ExportToAirtableNotion', 'ZapierWebhook', 'SocialMediaPublisher', 'EmailCampaign', 'PreviewLink', 'Archive']
    },
    {
        name: 'Logic / Automation',
        types: ['Trigger', 'Branch', 'Merge', 'TimerDelay', 'Webhook', 'Loop', 'DataParser', 'MetricsTracker']
    },
    {
        name: 'Analytics & Insights',
        types: ['EngagementTracker', 'SmartScore', 'FormatInsight', 'VoiceAccuracy', 'TimeSavedCalculator', 'CostEfficiency', 'AnalyticsAgent']
    },
    {
        name: 'Platform & Utility',
        types: ['Authentication', 'UserData', 'PlatformProject', 'Notification', 'Storage', 'Changelog']
    },
    {
        name: 'Advanced (Future)',
        types: ['PredictiveOptimization', 'TrendDetection', 'AudiencePersona', 'AdCopyABTest', 'AIVideoScript', 'AIVoiceover']
    }
];


const NodeCategory: React.FC<{ name: string, types: NodeType[] }> = ({ name, types }) => {
    const [isOpen, setIsOpen] = useState(true);

    if (types.length === 0) return null;

    return (
        <div>
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left py-2 px-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <h3 className="text-sm font-semibold uppercase text-gray-600 dark:text-gray-400">{name}</h3>
                <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
            </button>
            {isOpen && (
                <div className="space-y-2 mt-2">
                    {types.map(type => <DraggableNode key={type} type={type} />)}
                </div>
            )}
        </div>
    );
};


export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({ workflow, onSave, onClose, brandIntelligence, onCreateProject }) => {
    const [nodes, setNodes] = useState<WorkflowNode[]>(workflow.nodes);
    const [edges, setEdges] = useState<WorkflowEdge[]>(workflow.edges);
    const [name, setName] = useState(workflow.name);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
    const [isNodeLibraryCollapsed, setIsNodeLibraryCollapsed] = useState(false);
    const [nodeSearchQuery, setNodeSearchQuery] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
    
    // Canvas Navigation State
    const [viewport, setViewport] = useState({ x: 0, y: 0, zoom: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef<HTMLDivElement>(null);
    
    // Sync state if the workflow prop changes ID (switched workflows)
    useEffect(() => {
        setNodes(workflow.nodes);
        setEdges(workflow.edges);
        setName(workflow.name);
        // Reset viewport on workflow switch
        setViewport({ x: 0, y: 0, zoom: 1 });
    }, [workflow.id]); // Only reset if switching workflows

    // Auto-save logic
    useEffect(() => {
        if (!isRunning) {
             const handler = setTimeout(() => {
                onSave({ ...workflow, name, nodes, edges });
            }, 2000); 
            return () => clearTimeout(handler);
        }
    }, [nodes, edges, name, workflow, onSave, isRunning]);

    // Canvas Navigation Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        // Allow panning only if clicking on background (not on a node)
        // Nodes have a distinct class we can check against or stopPropagation in node component
        // The check here is a backup
        if ((e.target as HTMLElement).closest('.node-element')) return;
        
        setIsPanning(true);
        lastMousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            setViewport(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            // Zooming
            e.preventDefault();
            const zoomSensitivity = 0.001;
            const newZoom = Math.min(Math.max(viewport.zoom - e.deltaY * zoomSensitivity, 0.2), 2.5);
            setViewport(prev => ({ ...prev, zoom: newZoom }));
        } else {
            // Panning (Trackpad style)
            setViewport(prev => ({ ...prev, x: prev.x - e.deltaX, y: prev.y - e.deltaY }));
        }
    };
    
    const handleZoomIn = () => setViewport(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.2, 2.5) }));
    const handleZoomOut = () => setViewport(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.2, 0.2) }));
    const handleResetView = () => setViewport({ x: 0, y: 0, zoom: 1 });

    // Connection Logic
    const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
    const [tempEdgeEnd, setTempEdgeEnd] = useState<{ x: number, y: number } | null>(null);

    const handleConnectStart = (nodeId: string) => {
        setConnectingSourceId(nodeId);
    };

    const handleConnectEnd = (targetNodeId: string) => {
        if (connectingSourceId && connectingSourceId !== targetNodeId) {
            // Check if edge exists
            const exists = edges.some(e => e.source === connectingSourceId && e.target === targetNodeId);
            if (!exists) {
                const newEdge: WorkflowEdge = {
                    id: uuidv4(),
                    source: connectingSourceId,
                    target: targetNodeId
                };
                setEdges(prev => [...prev, newEdge]);
            }
        }
        setConnectingSourceId(null);
        setTempEdgeEnd(null);
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (connectingSourceId && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            // Transform mouse coordinates to canvas space
            const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
            const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
            setTempEdgeEnd({ x, y });
        }
        handleMouseMove(e);
    };

    const handleCanvasMouseUp = () => {
        if (connectingSourceId) {
            setConnectingSourceId(null);
            setTempEdgeEnd(null);
        }
        handleMouseUp();
    };

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        if (!canvasRef.current) return;
        
        const rect = canvasRef.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/node') as NodeType;
        if (!type) return;

        // Calculate position relative to the transformed canvas
        const position = {
            x: (event.clientX - rect.left - viewport.x) / viewport.zoom - 75, // Center node roughly
            y: (event.clientY - rect.top - viewport.y) / viewport.zoom - 20,
        };

        const newNode: WorkflowNode = {
            id: uuidv4(),
            type,
            position,
            data: { label: `${type} Node` },
            executionStatus: 'idle'
        };

        setNodes((nds) => nds.concat(newNode));
    }, [viewport]);
    
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onNodeDrag = (id: string, newPosition: { x: number, y: number }) => {
        setNodes((nds) =>
            nds.map((node) =>
                node.id === id
                    ? { ...node, position: { x: newPosition.x, y: newPosition.y } }
                    : node
            )
        );
    };

    const updateNodeData = (nodeId: string, data: Partial<WorkflowNode['data']>) => {
        setNodes(nds => nds.map(n => n.id === nodeId ? { ...n, data: {...n.data, ...data} } : n));
    };
    
    const updateNodeStatus = (id: string, status: 'running' | 'completed' | 'error' | 'idle', output?: any) => {
        setNodes(nds => nds.map(n => n.id === id ? { ...n, executionStatus: status, outputData: output } : n));
    };

    const handleRunWorkflow = async () => {
        if (isRunning) return;
        setIsRunning(true);
        try {
            // Pass a live update function so we see progress
            await executeWorkflowGraph(nodes, edges, updateNodeStatus, brandIntelligence);
            // Auto-open results when finished
            setIsResultsModalOpen(true);
        } catch (e) {
            console.error("Workflow failed", e);
        } finally {
            setIsRunning(false);
        }
    };

    const filteredCategories = useMemo(() => {
        if (!nodeSearchQuery) {
            return nodeCategories;
        }
        const lowerCaseQuery = nodeSearchQuery.toLowerCase();
        return nodeCategories.map(category => ({
            ...category,
            types: category.types.filter(type => {
                const info = nodeInfo[type];
                return info.label.toLowerCase().includes(lowerCaseQuery) || info.description.toLowerCase().includes(lowerCaseQuery);
            })
        })).filter(category => category.types.length > 0);
    }, [nodeSearchQuery]);

    const selectedNode = nodes.find(n => n.id === selectedNodeId);

    return (
        <div className="flex h-full w-full bg-[#F5F6F8] dark:bg-gray-900 animate-fade-in overflow-hidden">
            {/* Sidebar */}
            {!isNodeLibraryCollapsed ? (
                <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col p-4 overflow-y-auto shrink-0 transition-all duration-300 z-20 shadow-sm">
                     <div className="flex justify-between items-center mb-2 px-2">
                        <h2 className="text-lg font-bold">Node Library</h2>
                        <button 
                            onClick={() => setIsNodeLibraryCollapsed(true)} 
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            aria-label="Collapse node library"
                        >
                           <ChevronLeftIcon className="w-5 h-5"/>
                        </button>
                    </div>
                     <div className="relative mb-4 px-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                            <SearchIcon className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={nodeSearchQuery}
                            onChange={(e) => setNodeSearchQuery(e.target.value)}
                            className="block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 py-2 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                        />
                        {nodeSearchQuery && (
                            <button onClick={() => setNodeSearchQuery('')} className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <XCloseIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                    <div className="space-y-4">
                        {filteredCategories.map(category => (
                            <NodeCategory key={category.name} name={category.name} types={category.types} />
                        ))}
                    </div>
                </aside>
            ) : (
                <div className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-2 shrink-0 z-20">
                     <button 
                        onClick={() => setIsNodeLibraryCollapsed(false)} 
                        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        aria-label="Expand node library"
                    >
                           <ChevronRightIcon className="w-5 h-5"/>
                        </button>
                </div>
            )}


            {/* Main Content */}
            <div className="flex-1 flex flex-col relative">
                <header className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                             <ChevronLeftIcon className="w-5 h-5"/>
                        </button>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="text-xl font-bold bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-2"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                         <button 
                            onClick={() => setIsResultsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                            title="View Results"
                        >
                            <ClipboardListIcon className="w-4 h-4"/>
                            Results
                        </button>
                         <button 
                            onClick={handleRunWorkflow}
                            disabled={isRunning}
                            className={`flex items-center gap-2 px-6 py-2 text-sm font-bold text-white rounded-lg shadow-md transition-transform hover:scale-105 ${isRunning ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                        >
                            {isRunning ? <SpinnerIcon className="w-4 h-4"/> : "▶ Run Workflow"}
                        </button>
                        <button onClick={() => onSave({ ...workflow, name, nodes, edges })} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                            <SaveIcon className="w-4 h-4"/>
                            Save
                        </button>
                    </div>
                </header>

                {/* Navigable Canvas */}
                <div 
                    ref={canvasRef} 
                    onDrop={onDrop} 
                    onDragOver={onDragOver}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    onWheel={handleWheel}
                    className={`flex-1 relative overflow-hidden bg-[#F5F6F8] dark:bg-[#0B0C15] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                >
                    {/* Grid Background */}
                    <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#9CA3AF 1px, transparent 1px)',
                            backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
                            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
                            opacity: 0.15
                        }}
                    />

                    {/* Transform Container for Nodes/Edges */}
                    <div 
                        style={{ 
                            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
                            transformOrigin: '0 0',
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0
                        }}
                    >
                        {/* Render Edges */}
                        <svg className="absolute w-full h-full pointer-events-none overflow-visible">
                            <defs>
                                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                                    <polygon points="0 0, 10 3.5, 0 7" fill="#9CA3AF" />
                                </marker>
                            </defs>
                            {/* Temp Edge */}
                            {connectingSourceId && tempEdgeEnd && (
                                 <path 
                                    d={`M ${nodes.find(n => n.id === connectingSourceId)!.position.x + 160} ${nodes.find(n => n.id === connectingSourceId)!.position.y + 42} L ${tempEdgeEnd.x} ${tempEdgeEnd.y}`}
                                    stroke="#9CA3AF" 
                                    strokeWidth="3" 
                                    strokeDasharray="5,5"
                                    fill="none" 
                                />
                            )}
                            
                            {edges.map(edge => {
                                const sourceNode = nodes.find(n => n.id === edge.source);
                                const targetNode = nodes.find(n => n.id === edge.target);
                                if (!sourceNode || !targetNode) return null;
                                const x1 = sourceNode.position.x + 160; // Middle of right side (width + padding)
                                const y1 = sourceNode.position.y + 42; // Middle of node (height/2 approx)
                                const x2 = targetNode.position.x;     // Middle of left side
                                const y2 = targetNode.position.y + 42; // Middle of node

                                return (
                                    <g key={edge.id} className="group">
                                        <path 
                                            d={`M ${x1} ${y1} C ${x1 + 60} ${y1} ${x2 - 60} ${y2} ${x2} ${y2}`} 
                                            stroke="transparent" 
                                            strokeWidth="20" 
                                            fill="none" 
                                            className="cursor-pointer"
                                        />
                                        <path 
                                            d={`M ${x1} ${y1} C ${x1 + 60} ${y1} ${x2 - 60} ${y2} ${x2} ${y2}`} 
                                            stroke="#9CA3AF" 
                                            strokeWidth="3" 
                                            fill="none" 
                                            markerEnd="url(#arrowhead)"
                                            className="group-hover:stroke-blue-500 transition-colors duration-300"
                                        />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Render Nodes */}
                        {nodes.map(node => (
                            <WorkflowNodeComponent 
                                key={node.id} 
                                node={node} 
                                onDrag={onNodeDrag} 
                                onSelect={setSelectedNodeId}
                                isSelected={selectedNodeId === node.id}
                                zoom={viewport.zoom}
                                onConnectStart={handleConnectStart}
                                onConnectEnd={handleConnectEnd}
                            />
                        ))}
                    </div>
                    
                    {/* Zoom Controls */}
                    <div className="absolute bottom-6 right-6 flex gap-2 z-30">
                        <button onClick={handleZoomOut} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700" title="Zoom Out">
                            <MinusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button onClick={handleResetView} className="px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300" title="Reset View">
                            {Math.round(viewport.zoom * 100)}%
                        </button>
                        <button onClick={handleZoomIn} className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700" title="Zoom In">
                            <PlusIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Config Panel */}
            <NodeConfigPanel
                node={selectedNode}
                onClose={() => setSelectedNodeId(null)}
                onUpdate={updateNodeData}
            />
            
            {/* Results Modal */}
            {isResultsModalOpen && (
                <WorkflowResultsModal 
                    nodes={nodes} 
                    onClose={() => setIsResultsModalOpen(false)} 
                    onCreateProject={onCreateProject}
                />
            )}
        </div>
    );
};
