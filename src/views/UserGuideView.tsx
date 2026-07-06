import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../App';
import UserGuideCenter from '../components/UserGuideCenter';

interface GuideFile {
  githubPath: string;
  filename: string;
  section: string;
  rawUrl: string;
  isSynced: boolean;
  sha: string;
  lastSyncedAt: string;
}

interface TreeNode {
  id: string;
  name: string;
  label: string;
  path: string;
  isFile: boolean;
  children: TreeNode[];
  file?: GuideFile;
}

interface UserGuideViewProps {
  jumpPath?: string | null;
  returnView?: string | null;
  onReturn?: () => void;
  onConsumeJump?: () => void;
}

export default function UserGuideView({ jumpPath, returnView, onReturn, onConsumeJump }: UserGuideViewProps) {
  const [files, setFiles] = useState<GuideFile[]>([]);
  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('edq_guide_nav_collapsed') === 'true'; } catch { return false; }
  });
  const toggleNav = () => setNavCollapsed(v => {
    const next = !v;
    try { localStorage.setItem('edq_guide_nav_collapsed', String(next)); } catch {}
    return next;
  });
  
  // Selected file — always starts null so the User Guide opens on its HOME
  // landing rather than resuming into a deep article (e.g. Contact Information).
  const [selectedFile, setSelectedFile] = useState<GuideFile | null>(null);

  // Ref so fetchFiles can read the latest jumpPath without a stale closure.
  const jumpPathRef = useRef(jumpPath);
  useEffect(() => { jumpPathRef.current = jumpPath; }, [jumpPath]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Expanded categories & nested folder nodes state loaded/restored from localStorage
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('edq_guide_expanded_categories');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('edq_guide_expanded_nodes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save changes to localStorage to remember position across route switching
  useEffect(() => {
    try {
      localStorage.setItem('edq_guide_expanded_categories', JSON.stringify(expandedCategories));
    } catch {}
  }, [expandedCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('edq_guide_expanded_nodes', JSON.stringify(expandedNodes));
    } catch {}
  }, [expandedNodes]);

  useEffect(() => {
    try {
      if (selectedFile) localStorage.setItem('edq_guide_selected_file', JSON.stringify(selectedFile));
      else localStorage.removeItem('edq_guide_selected_file');
    } catch {}
  }, [selectedFile]);

  // Fetch all user guide files from the server API
  const fetchFiles = () => {
    setIsLoading(true);
    fetch('/api/user-guide/files')
      .then(res => res.json())
      .then(data => {
        if (data && data.files) {
          setFiles(data.files);
          // Check for a jump target set by search (sessionStorage bridge)
          try {
            const jumpPath = sessionStorage.getItem('edq_guide_jump_path');
            if (jumpPath) {
              sessionStorage.removeItem('edq_guide_jump_path');
              const target = data.files.find((f: GuideFile) => f.githubPath === jumpPath);
              if (target) { setSelectedFile(target); return; }
            }
          } catch {}
          // Default landing → the Get Started index.md page.
          // Skip if a jump is pending — the jump effect will select the right article.
          if (!selectedFile && data.files.length > 0 && !jumpPathRef.current) {
            const getStarted = data.files.find((f: GuideFile) =>
              f.githubPath.toLowerCase() === 'docs/user guide/get_started/index.md'
            ) ?? data.files.find((f: GuideFile) =>
              f.section === 'get_started' && /index\.md$/i.test(f.filename)
            );
            if (getStarted) setSelectedFile(getStarted);
          }
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching user guide files inside UserGuideView:", err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // Open the article requested via a suggested-article jump, as soon as the file
  // list is available. Robust to warm navigation (prop-driven, not mount-only).
  useEffect(() => {
    if (!jumpPath || !files.length) return;
    const target = files.find(f => f.githubPath === jumpPath);
    if (target) {
      setSelectedFile(target);
      onConsumeJump?.();
    }
  }, [jumpPath, files]);

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => {
      const isOpen = prev[categoryKey];
      // Accordion: close all others when opening one
      return isOpen ? {} : { [categoryKey]: true };
    });
  };

  const toggleExpandNode = (nodeId: string) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Categories mapping to friendly names and relevant sections matching original Braze structure
  const categoryConfig = [
    { key: 'get_started', label: 'Get started', icon: 'explore', sections: ['get_started', 'root'] },
    { key: 'administer', label: 'Administer', icon: 'settings_accessibility', sections: ['administer'] },
    { key: 'data', label: 'Data', icon: 'database', sections: ['data'] },
    { key: 'audience', label: 'Audience', icon: 'groups', sections: ['audience'] },
    { key: 'messaging', label: 'Messaging', icon: 'chat_bubble', sections: ['messaging'] },
    { key: 'channels', label: 'Channels', icon: 'cell_tower', sections: ['channels'] },
    { key: 'analytics', label: 'Analytics', icon: 'monitoring', sections: ['analytics'] },
    { key: 'brazeai', label: 'Braze AI', icon: 'auto_awesome', sections: ['brazeai', 'braze_ai'] }
  ];

  // Helper generator to build a recursive tree structure under each section
  const buildTreeForCategory = (sections: string[]): TreeNode[] => {
    // Filter matching files for this category
    const matchedFiles = files.filter(f => sections.includes(f.section));
    
    const rootObj: any = {};

    matchedFiles.forEach(file => {
      let cleanPath = file.githubPath;
      if (cleanPath.startsWith("docs/User Guide/")) {
        cleanPath = cleanPath.slice("docs/User Guide/".length);
      }
      const parts = cleanPath.split("/").filter(p => p !== "");
      
      // Skip the section name itself inside the tree (e.g. skip "channels" in "channels/email/setup/index.md") Let the category header handle that level!
      const relativeParts = parts.length > 1 ? parts.slice(1) : parts;

      let current = rootObj;
      relativeParts.forEach((part, idx) => {
        if (!current[part]) {
          current[part] = { _name: part, _children: {}, _file: null };
        }
        if (idx === relativeParts.length - 1) {
          current[part]._file = file;
        }
        current = current[part]._children;
      });
    });

    const convertNode = (name: string, obj: any, parentPath = ""): TreeNode => {
      const currentPath = parentPath ? `${parentPath}/${name}` : name;
      const childKeys = Object.keys(obj._children);
      let fileRef = obj._file;
      const children: TreeNode[] = [];

      childKeys.forEach(key => {
        const childObj = obj._children[key];
        if (key === 'index.md') {
          fileRef = childObj._file;
        } else {
          children.push(convertNode(key, childObj, currentPath));
        }
      });

      // User-friendly filename/directory display formatter
      let label = name.replace('.md', '').replace(/[-_]/g, ' ');
      
      const specialMappings: Record<string, string> = {
        'faq': 'FAQ',
        'sso': 'SSO',
        'saml': 'SAML',
        'dns': 'DNS',
        'spf': 'SPF',
        'dkim': 'DKIM',
        'dmarc': 'DMARC',
        'drag and drop editor': 'Drag-and-drop editor',
        'content cards': 'Content Cards',
        'sms': 'SMS'
      };

      const lowerKey = label.toLowerCase().trim();
      if (specialMappings[lowerKey]) {
        label = specialMappings[lowerKey];
      } else {
        label = label.replace(/\b\w/g, char => char.toUpperCase());
      }

      return {
        id: currentPath,
        name,
        label,
        path: fileRef?.githubPath || currentPath,
        isFile: children.length === 0,
        children: children.sort((a, b) => {
          if (a.isFile !== b.isFile) {
            return a.isFile ? 1 : -1;
          }
          return a.label.localeCompare(b.label);
        }),
        file: fileRef
      };
    };

    return Object.keys(rootObj).map(key => convertNode(key, rootObj[key]))
      .sort((a, b) => {
        if (a.isFile !== b.isFile) {
          return a.isFile ? 1 : -1;
        }
        return a.label.localeCompare(b.label);
      });
  };

  // Filter categories by search keywords if there is a query
  const getFilteredCategories = () => {
    return categoryConfig.map(cat => {
      const children = buildTreeForCategory(cat.sections);
      
      // If we are searching, we should filter down the tree nodes recursively
      const filterTree = (nodes: TreeNode[]): TreeNode[] => {
        return nodes
          .map(node => ({
            ...node,
            children: filterTree(node.children)
          }))
          .filter(node => {
            const matchesQuery = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 (node.file && node.file.filename.toLowerCase().includes(searchQuery.toLowerCase()));
            return matchesQuery || node.children.length > 0;
          });
      };

      const filteredChildren = searchQuery.trim() ? filterTree(children) : children;

      return {
        ...cat,
        children: filteredChildren,
        hasMatches: filteredChildren.length > 0
      };
    }).filter(cat => !searchQuery.trim() || cat.hasMatches);
  };

  // Recursive Nav Node Renderer
  const renderTreeNode = (node: TreeNode, level: number) => {
    const isExpanded = expandedNodes[node.id];
    
    // Check if the current file or any descendant of this folder node is currently selected
    const isSelected = selectedFile?.githubPath === node.file?.githubPath && node.file !== undefined;
    
    const hasActiveDescendant = (n: TreeNode): boolean => {
      if (n.file && selectedFile && n.file.githubPath === selectedFile.githubPath) return true;
      return n.children.some(child => hasActiveDescendant(child));
    };
    const isActivePath = hasActiveDescendant(node);

    const handleNodeClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (node.children.length > 0) {
        toggleExpandNode(node.id);
        if (node.file) {
          setSelectedFile(node.file);
        }
      } else if (node.file) {
        setSelectedFile(node.file);
      }
    };

    // Level-based visual differentiation
    const isSubSection = level >= 2;
    const isLeafNode = node.children.length === 0;

    return (
      <div key={node.id} className="flex flex-col relative w-full">
        {/* Node label block */}
        <div
          onClick={handleNodeClick}
          {...(node.file ? { 'data-gem-panel': '', 'data-gem-panel-label': node.label, 'data-gem-article-path': node.file.githubPath } : {})}
          className={cn(
            "group flex items-center gap-2 rounded-xl cursor-pointer transition-all duration-150 mb-0.5 relative select-none",
            // Level-based sizing and padding
            isSubSection
              ? "py-1.5 px-3 text-[11px]"
              : "py-2 px-3.5 text-xs font-semibold",
            // State colors — same brand palette, softer at deeper levels
            isSelected
              ? "bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#D2E3FC] font-semibold"
              : isActivePath
                ? "text-[#1A73E8] dark:text-[#D2E3FC] font-semibold bg-[#E8F0FE]/70 dark:bg-[#1A73E8]/12"
                : isSubSection
                  ? "text-on-surface-variant/55 dark:text-inverse-on-surface/50 hover:bg-[#E8F0FE]/50 dark:hover:bg-[#1A73E8]/12 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC]"
                  : "text-on-surface-variant/80 dark:text-inverse-on-surface/80 hover:bg-[#E8F0FE]/60 dark:hover:bg-[#1A73E8]/14 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC]"
          )}
        >
          {/* Edge highlight — selected pill accent bar */}
          {isSelected && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#1A73E8] dark:bg-[#8AB4F8] rounded-r"></div>
          )}
          {!isSelected && isActivePath && node.children.length > 0 && (
            <div className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#1A73E8]/40 dark:bg-[#8AB4F8]/35 rounded-r"></div>
          )}

          {/* Leaf sub-section dot indicator */}
          {isSubSection && isLeafNode && (
            <span className={cn(
              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
              isSelected
                ? "bg-[#1A73E8] dark:bg-[#8AB4F8]"
                : "bg-neutral-300 dark:bg-outline-variant/40 group-hover:bg-[#1A73E8]/60 dark:group-hover:bg-[#8AB4F8]/55"
            )}></span>
          )}

          <span className="truncate flex-1">{node.label}</span>

          {node.children.length > 0 ? (
            <span className={cn(
              "material-symbols-outlined shrink-0 text-neutral-400 group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC] transition-transform duration-200",
              isSubSection ? "text-[13px]" : "text-[15px]",
              isExpanded && "rotate-90 text-[#1A73E8] dark:text-[#D2E3FC]"
            )}>
              chevron_right
            </span>
          ) : null}
        </div>

        {/* Nested levels of rendering under directories (Adds vertical guideline) */}
        {isExpanded && node.children.length > 0 && (
          <div className={cn(
            "flex flex-col gap-[2px] mt-0.5 mb-1",
            isSubSection
              ? "pl-3 ml-1.5 border-l border-neutral-200/70 dark:border-outline-variant/10"
              : "pl-3.5 ml-2 border-l border-neutral-200 dark:border-outline-variant/15"
          )}>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="flex w-full h-[calc(100vh-68px)] bg-white dark:bg-[#151419] font-sans overflow-hidden">
      {/* LIST PANE: Category / File Explorer Tree */}
      <div className={cn(
        "bg-[#F8F9FA] dark:bg-[#121115] flex flex-col flex-shrink-0 h-full overflow-hidden border-r border-[#E8EAED] dark:border-outline-variant/15 z-10 transition-[width] duration-300 ease-out",
        navCollapsed ? "w-0" : "w-[300px]"
      )}>
        {/* Categories Nested Explorer Tree Pane */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 pt-4 space-y-1.5">
          {/* Sub-Folders lists with recursive drawer expand and guidelines */}
          {filteredCategories.map(cat => {
            const isCatExpanded = expandedCategories[cat.key];
            const hasChildren = cat.children.length > 0;

            return (
              <div key={cat.key} className="flex flex-col mb-1 relative">
                {/* Category Group Header Block */}
                <div
                  onClick={() => toggleCategory(cat.key)}
                  className={cn(
                    "py-2.5 px-3.5 rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer select-none group mb-1",
                    isCatExpanded
                      ? "bg-[#E8F0FE] text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#D2E3FC] font-bold"
                      : "text-on-surface dark:text-inverse-on-surface hover:bg-[#E8F0FE]/60 dark:hover:bg-[#1A73E8]/14 hover:text-[#1A73E8] dark:hover:text-[#D2E3FC]"
                  )}
                >
                  <div className="flex items-center gap-3 font-semibold text-[13px]">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  {hasChildren && (
                    <span 
                      className={cn(
                        "material-symbols-outlined text-[16px] transition-transform duration-250 text-neutral-400 group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]",
                        isCatExpanded && "rotate-90 text-[#1A73E8] dark:text-[#D2E3FC]"
                      )}
                    >
                      chevron_right
                    </span>
                  )}
                </div>

                {/* Root level nodes of the Category */}
                {isCatExpanded && hasChildren && (
                  <div className="pl-3.5 ml-2.5 border-l border-neutral-200 dark:border-outline-variant/15 flex flex-col gap-1 mt-1 mb-2 rounded">
                    {cat.children.map(node => renderTreeNode(node, 1))}
                  </div>
                )}
              </div>
            );
          })}

          {filteredCategories.length === 0 && (
            <div className="py-8 text-center text-xs font-bold text-neutral-400">
              No matching pages found.
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PREVIEW: Reading Module & Assistant */}
      <div className="flex-1 h-full flex flex-col overflow-hidden relative z-10">
        {/* Collapse handle — on the left border of the content panel */}
        <button
          onClick={toggleNav}
          title={navCollapsed ? 'Show navigation' : 'Hide navigation'}
          aria-label={navCollapsed ? 'Show navigation' : 'Hide navigation'}
          className="group absolute left-0 top-1/2 -translate-y-1/2 z-30 w-5 flex items-center justify-center cursor-pointer select-none"
        >
          <div className="w-1.5 h-12 bg-[#CAC4D0]/60 dark:bg-white/15 rounded-full group-hover:bg-[#1A73E8]/60 transition-colors duration-150" />
        </button>
        <UserGuideCenter
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          files={files}
          onRefresh={fetchFiles}
        />

        {/* Floating back button — returns to the view the user came from */}
        {returnView && onReturn && (
          <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
            <button
              onClick={onReturn}
              className="pointer-events-auto flex items-center gap-2 pl-4 pr-5 py-2.5 bg-white dark:bg-[#1E1D22] rounded-full shadow-2xl border border-outline-variant/20 dark:border-outline-variant/15 text-sm font-bold text-on-surface dark:text-inverse-on-surface hover:bg-[#E8F0FE] dark:hover:bg-[#1A73E8]/20 hover:text-[#1A73E8] dark:hover:text-[#74BBFF] transition-all select-none"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
