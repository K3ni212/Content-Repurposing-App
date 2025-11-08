import React from 'react';

export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const parseInline = (line: string) => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded font-mono text-sm">$1</code>');
    };

    // Fix: Use React.ReactElement to avoid issues with the global JSX namespace.
    const elements: React.ReactElement[] = [];
    const lines = content.split('\n');

    let currentList: { type: 'ul' | 'ol', items: string[] } | null = null;
    let inCodeBlock = false;
    let codeBlockContent = '';

    const flushList = () => {
        if (currentList) {
            const ListTag = currentList.type;
            elements.push(
                <ListTag key={`list-${elements.length}`} className={`my-2 space-y-1 pl-6 ${ListTag === 'ul' ? 'list-disc' : 'list-decimal'}`}>
                    {currentList.items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: parseInline(item) }} />)}
                </ListTag>
            );
            currentList = null;
        }
    };
    
    lines.forEach((line, index) => {
        if (line.startsWith('```')) {
            flushList();
            if (inCodeBlock) {
                elements.push(
                    <pre key={`code-${index}`} className="bg-gray-100 dark:bg-gray-900 p-3 my-2 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                        {codeBlockContent}
                    </pre>
                );
                codeBlockContent = '';
            }
            inCodeBlock = !inCodeBlock;
            return;
        }

        if (inCodeBlock) {
            codeBlockContent += line + '\n';
            return;
        }
        
        if (line.startsWith('# ')) { flushList(); elements.push(<h1 className="text-2xl font-bold mt-4 mb-2" key={index} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(2)) }} />); return; }
        if (line.startsWith('## ')) { flushList(); elements.push(<h2 className="text-xl font-bold mt-3 mb-2" key={index} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(3)) }} />); return; }
        if (line.startsWith('### ')) { flushList(); elements.push(<h3 className="text-lg font-bold mt-2 mb-1" key={index} dangerouslySetInnerHTML={{ __html: parseInline(line.substring(4)) }} />); return; }
        
        const ulMatch = line.match(/^\s*[-\\*]\s+(.*)/);
        if (ulMatch) {
            if (!currentList || currentList.type !== 'ul') {
                flushList();
                currentList = { type: 'ul', items: [] };
            }
            currentList.items.push(ulMatch[1]);
            return;
        }
        
        const olMatch = line.match(/^\s*\d+\.\s+(.*)/);
        if (olMatch) {
            if (!currentList || currentList.type !== 'ol') {
                flushList();
                currentList = { type: 'ol', items: [] };
            }
            currentList.items.push(olMatch[1]);
            return;
        }
        
        flushList();

        if (line.trim() !== '') {
            elements.push(<p key={index} dangerouslySetInnerHTML={{ __html: parseInline(line) }} />);
        }
    });

    flushList(); // Flush any remaining list at the end
     if (inCodeBlock) { // handle unclosed code block
        elements.push(
            <pre key="code-final" className="bg-gray-100 dark:bg-gray-900 p-3 my-2 rounded-md overflow-x-auto text-sm font-mono whitespace-pre-wrap">
                {codeBlockContent}
            </pre>
        );
    }
    
    return <div className="leading-relaxed space-y-2">{elements}</div>;
};
