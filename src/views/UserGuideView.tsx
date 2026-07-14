import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../App';
import UserGuideCenter from '../components/UserGuideCenter';
import { md3Ease, md3QuickEnter } from '../lib/md3Motion';

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

const GUIDE_NAV_WIDTH = 300;

export default function UserGuideView({
  jumpPath,
  returnView,
  onReturn,
  onConsumeJump,
}: UserGuideViewProps) {
  const [files, setFiles] = useState<GuideFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<GuideFile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [navCollapsed, setNavCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('edq_guide_nav_collapsed') === 'true';
    } catch {
      return false;
    }
  });

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

  const jumpPathRef = useRef(jumpPath);

  useEffect(() => {
    jumpPathRef.current = jumpPath;
  }, [jumpPath]);

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
      if (selectedFile) {
        localStorage.setItem('edq_guide_selected_file', JSON.stringify(selectedFile));
      } else {
        localStorage.removeItem('edq_guide_selected_file');
      }
    } catch {}
  }, [selectedFile]);

  const toggleNav = () => {
    setNavCollapsed(currentValue => {
      const nextValue = !currentValue;

      try {
        localStorage.setItem('edq_guide_nav_collapsed', String(nextValue));
      } catch {}

      return nextValue;
    });
  };

  const fetchFiles = () => {
    setIsLoading(true);

    fetch('/api/user-guide/files')
      .then(response => response.json())
      .then(data => {
        if (data?.files) {
          setFiles(data.files);

          let selectedFromJump = false;

          try {
            const storedJumpPath = sessionStorage.getItem('edq_guide_jump_path');

            if (storedJumpPath) {
              sessionStorage.removeItem('edq_guide_jump_path');

              const target = data.files.find(
                (file: GuideFile) => file.githubPath === storedJumpPath
              );

              if (target) {
                setSelectedFile(target);
                selectedFromJump = true;
              }
            }
          } catch {}

          if (!selectedFromJump && !selectedFile && data.files.length > 0 && !jumpPathRef.current) {
            const getStarted =
              data.files.find(
                (file: GuideFile) =>
                  file.githubPath.toLowerCase() === 'docs/user guide/get_started/index.md'
              ) ??
              data.files.find(
                (file: GuideFile) =>
                  file.section === 'get_started' && /index\.md$/i.test(file.filename)
              );

            if (getStarted) {
              setSelectedFile(getStarted);
            }
          }
        }

        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user guide files inside UserGuideView:', error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    if (!jumpPath || !files.length) return;

    const target = files.find(file => file.githubPath === jumpPath);

    if (target) {
      setSelectedFile(target);
      onConsumeJump?.();
    }
  }, [jumpPath, files, onConsumeJump]);

  const categoryConfig = [
    {
      key: 'get_started',
      label: 'Get started',
      icon: 'explore',
      sections: ['get_started', 'root'],
    },
    {
      key: 'administer',
      label: 'Administer',
      icon: 'settings_accessibility',
      sections: ['administer'],
    },
    {
      key: 'data',
      label: 'Data',
      icon: 'database',
      sections: ['data'],
    },
    {
      key: 'audience',
      label: 'Audience',
      icon: 'groups',
      sections: ['audience'],
    },
    {
      key: 'messaging',
      label: 'Messaging',
      icon: 'chat_bubble',
      sections: ['messaging'],
    },
    {
      key: 'channels',
      label: 'Channels',
      icon: 'cell_tower',
      sections: ['channels'],
    },
    {
      key: 'analytics',
      label: 'Analytics',
      icon: 'monitoring',
      sections: ['analytics'],
    },
    {
      key: 'brazeai',
      label: 'Braze AI',
      icon: 'auto_awesome',
      sections: ['brazeai', 'braze_ai'],
    },
  ];

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(previousValue => {
      const isOpen = previousValue[categoryKey];
      return isOpen ? {} : { [categoryKey]: true };
    });
  };

  const toggleExpandNode = (nodeId: string) => {
    setExpandedNodes(previousValue => ({
      ...previousValue,
      [nodeId]: !previousValue[nodeId],
    }));
  };

  const formatLabel = (name: string) => {
    let label = name.replace('.md', '').replace(/[-_]/g, ' ');

    const specialMappings: Record<string, string> = {
      api: 'API',
      apis: 'APIs',
      faq: 'FAQ',
      id: 'ID',
      ids: 'IDs',
      ip: 'IP',
      ips: 'IPs',
      qa: 'QA',
      sdk: 'SDK',
      sdks: 'SDKs',
      sso: 'SSO',
      saml: 'SAML',
      dns: 'DNS',
      spf: 'SPF',
      dkim: 'DKIM',
      dmarc: 'DMARC',
      'drag and drop editor': 'Drag-and-drop editor',
      'content cards': 'Content Cards',
      sms: 'SMS',
      sql: 'SQL',
    };

    const lowerKey = label.toLowerCase().trim();

    if (specialMappings[lowerKey]) {
      return specialMappings[lowerKey];
    }

    return label.replace(/\b[\w']+\b/g, word => specialMappings[word.toLowerCase()] ?? (word.charAt(0).toUpperCase() + word.slice(1)));
  };

  const buildTreeForCategory = (sections: string[]): TreeNode[] => {
    const matchedFiles = files.filter(file => sections.includes(file.section));
    const rootObj: any = {};

    matchedFiles.forEach(file => {
      let cleanPath = file.githubPath;

      if (cleanPath.startsWith('docs/User Guide/')) {
        cleanPath = cleanPath.slice('docs/User Guide/'.length);
      }

      const parts = cleanPath.split('/').filter(Boolean);
      const relativeParts = parts.length > 1 ? parts.slice(1) : parts;

      let current = rootObj;

      relativeParts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            _name: part,
            _children: {},
            _file: null,
          };
        }

        if (index === relativeParts.length - 1) {
          current[part]._file = file;
        }

        current = current[part]._children;
      });
    });

    const convertNode = (name: string, obj: any, parentPath = ''): TreeNode => {
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

      return {
        id: currentPath,
        name,
        label: formatLabel(name),
        path: fileRef?.githubPath || currentPath,
        isFile: children.length === 0,
        children: children.sort((a, b) => {
          if (a.isFile !== b.isFile) {
            return a.isFile ? 1 : -1;
          }

          return a.label.localeCompare(b.label);
        }),
        file: fileRef,
      };
    };

    return Object.keys(rootObj)
      .map(key => convertNode(key, rootObj[key]))
      .sort((a, b) => {
        if (a.isFile !== b.isFile) {
          return a.isFile ? 1 : -1;
        }

        return a.label.localeCompare(b.label);
      });
  };

  const findActiveNodePath = (nodes: TreeNode[], githubPath: string): TreeNode[] => {
    for (const node of nodes) {
      if (node.file?.githubPath === githubPath) {
        return [node];
      }

      const childPath = findActiveNodePath(node.children, githubPath);

      if (childPath.length > 0) {
        return [node, ...childPath];
      }
    }

    return [];
  };

  const activeCategory = selectedFile
    ? categoryConfig.find(category => category.sections.includes(selectedFile.section))
    : undefined;

  const activePathNodes =
    activeCategory && selectedFile
      ? findActiveNodePath(buildTreeForCategory(activeCategory.sections), selectedFile.githubPath)
      : [];

  const activePathIndexById = activePathNodes.reduce<Record<string, number>>(
    (accumulator, node, index) => {
      accumulator[node.id] = index;
      return accumulator;
    },
    {}
  );

  const hasActiveDescendant = (node: TreeNode): boolean => {
    if (node.file && selectedFile && node.file.githubPath === selectedFile.githubPath) {
      return true;
    }

    return node.children.some(child => hasActiveDescendant(child));
  };

  const getFilteredCategories = () => {
    return categoryConfig
      .map(category => {
        const children = buildTreeForCategory(category.sections);

        const filterTree = (nodes: TreeNode[]): TreeNode[] => {
          return nodes
            .map(node => ({
              ...node,
              children: filterTree(node.children),
            }))
            .filter(node => {
              const query = searchQuery.toLowerCase();

              const matchesQuery =
                node.label.toLowerCase().includes(query) ||
                Boolean(node.file?.filename.toLowerCase().includes(query));

              return matchesQuery || node.children.length > 0;
            });
        };

        const filteredChildren = searchQuery.trim() ? filterTree(children) : children;

        return {
          ...category,
          children: filteredChildren,
          hasMatches: filteredChildren.length > 0,
        };
      })
      .filter(category => !searchQuery.trim() || category.hasMatches);
  };

  const renderTreeNode = (node: TreeNode, level: number) => {
    const isExpanded = expandedNodes[node.id];

    const isSelected =
      selectedFile?.githubPath === node.file?.githubPath && node.file !== undefined;

    const isActivePath = hasActiveDescendant(node);
    const isSubSection = level >= 2;
    const isLeafNode = node.children.length === 0;

    const activeStickyIndexRaw = activePathIndexById[node.id];
    const activeStickyIndex = typeof activeStickyIndexRaw === 'number' ? activeStickyIndexRaw : -1;

    const shouldFreezeActiveNode = !searchQuery.trim() && activeStickyIndex >= 0;

    const activeNodeTopOffset = 54 + activeStickyIndex * 38;
    const activeNodeZIndex = 29 - activeStickyIndex;

    const handleNodeClick = (event: React.MouseEvent) => {
      event.stopPropagation();

      if (node.children.length > 0) {
        toggleExpandNode(node.id);

        if (node.file) {
          setSelectedFile(node.file);
        }
      } else if (node.file) {
        setSelectedFile(node.file);
      }
    };

    return (
      <motion.div
        key={node.id}
        className="relative flex w-full min-w-0 flex-col"
        {...md3QuickEnter}
        transition={{ duration: 0.26, ease: md3Ease, delay: Math.min(level * 0.02, 0.08) }}
      >
        <motion.div
          onClick={handleNodeClick}
          style={
            shouldFreezeActiveNode
              ? {
                  top: activeNodeTopOffset,
                  zIndex: activeNodeZIndex,
                }
              : undefined
          }
          {...(node.file
            ? {
                'data-gem-panel': '',
                'data-gem-panel-label': node.label,
                'data-gem-article-path': node.file.githubPath,
              }
            : {})}
          className={cn(
            'group relative mb-0.5 flex min-w-0 cursor-pointer select-none items-center gap-2 rounded-xl transition-all duration-150',
            shouldFreezeActiveNode &&
              'sticky bg-[#F8F9FA]/95 shadow-[0_10px_18px_-18px_rgba(0,0,0,0.35)] backdrop-blur-md dark:bg-[#121115]/95',
            isSubSection ? 'px-3 py-1.5 text-[11px]' : 'px-3.5 py-2 text-xs font-semibold',
            isSelected
              ? 'bg-[#E8F0FE] font-semibold text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#D2E3FC]'
              : isActivePath
                ? 'bg-[#E8F0FE]/70 font-semibold text-[#1A73E8] dark:bg-[#1A73E8]/12 dark:text-[#D2E3FC]'
                : isSubSection
                  ? 'text-on-surface-variant/55 hover:bg-[#E8F0FE]/50 hover:text-[#1A73E8] dark:text-inverse-on-surface/50 dark:hover:bg-[#1A73E8]/12 dark:hover:text-[#D2E3FC]'
                  : 'text-on-surface-variant/80 hover:bg-[#E8F0FE]/60 hover:text-[#1A73E8] dark:text-inverse-on-surface/80 dark:hover:bg-[#1A73E8]/14 dark:hover:text-[#D2E3FC]'
          )}
        >
          {isSubSection && isLeafNode && (
            <span
              className={cn(
                'h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                isSelected
                  ? 'bg-[#1A73E8] dark:bg-[#8AB4F8]'
                  : 'bg-neutral-300 group-hover:bg-[#1A73E8]/60 dark:bg-outline-variant/40 dark:group-hover:bg-[#8AB4F8]/55'
              )}
            />
          )}

          <span className="min-w-0 flex-1 truncate whitespace-nowrap">
            {node.label}
          </span>

          {node.children.length > 0 && (
            <span
              className={cn(
                'material-symbols-outlined shrink-0 text-neutral-400 transition-transform duration-200 group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]',
                isSubSection ? 'text-[13px]' : 'text-[15px]',
                isExpanded && 'rotate-90 text-[#1A73E8] dark:text-[#D2E3FC]'
              )}
            >
              chevron_right
            </span>
          )}
        </motion.div>

        <AnimatePresence initial={false}>
          {isExpanded && node.children.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.24, ease: md3Ease }}
              className={cn(
                'mt-0.5 mb-1 flex min-w-0 flex-col gap-[2px] overflow-hidden',
                isSubSection
                  ? 'ml-1.5 border-l border-neutral-200/70 pl-3 dark:border-outline-variant/10'
                  : 'ml-2 border-l border-neutral-200 pl-3.5 dark:border-outline-variant/15'
              )}
            >
              {node.children.map(child => renderTreeNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const filteredCategories = getFilteredCategories();

  return (
    <div className="flex h-[calc(100vh-68px)] w-full min-w-0 overflow-hidden bg-white font-sans dark:bg-[#151419]">
      {/* LIST PANE: Category / File Explorer Tree */}
      <motion.div
        initial={false}
        animate={{
          width: navCollapsed ? 0 : GUIDE_NAV_WIDTH,
        }}
        transition={{
          duration: 0.28,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          pointerEvents: navCollapsed ? 'none' : 'auto',
        }}
        aria-hidden={navCollapsed}
        className="z-10 h-full flex-shrink-0 overflow-hidden border-r border-[#E8EAED] bg-[#F8F9FA] dark:border-outline-variant/15 dark:bg-[#121115]"
      >
        <div className="flex h-full w-[300px] min-w-[300px] max-w-[300px] flex-col overflow-hidden">
          {searchQuery.trim() && (
            <div className="px-3 pt-3">
              <button
                onClick={() => setSearchQuery('')}
                className="h-8 w-full rounded-xl border border-[#E8EAED] bg-white text-[11px] font-bold text-on-surface-variant transition-colors hover:text-[#1A73E8] dark:border-white/10 dark:bg-white/5 dark:text-inverse-on-surface/70"
              >
                Clear search
              </button>
            </div>
          )}

          <div className="custom-scrollbar flex-1 overflow-y-auto px-3 pt-4 pb-3">
            <div className="space-y-1.5">
              {isLoading && files.length === 0 ? (
                <div className="py-8 text-center text-xs font-bold text-neutral-400">
                  Loading guide pages...
                </div>
              ) : (
                <>
                  {filteredCategories.map(category => {
                    const isCategoryExpanded = expandedCategories[category.key];
                    const hasChildren = category.children.length > 0;

                    const isActiveCategory =
                      !!selectedFile && category.sections.includes(selectedFile.section);

                    const shouldFreezeCategory =
                      !searchQuery.trim() && isActiveCategory && isCategoryExpanded;

                    return (
                      <motion.div
                        key={category.key}
                        className="relative mb-1 flex min-w-0 flex-col"
                        {...md3QuickEnter}
                        transition={{ duration: 0.28, ease: md3Ease, delay: Math.min(filteredCategories.indexOf(category) * 0.03, 0.18) }}
                      >
                        <motion.div
                          onClick={() => toggleCategory(category.key)}
                          className={cn(
                            'group mb-1 flex min-w-0 cursor-pointer select-none items-center justify-between rounded-xl px-3.5 py-2.5 transition-all duration-150',
                            shouldFreezeCategory &&
                              'sticky top-0 z-30 bg-[#F8F9FA]/95 shadow-[0_10px_18px_-18px_rgba(0,0,0,0.35)] backdrop-blur-md dark:bg-[#121115]/95',
                            isCategoryExpanded
                              ? 'bg-[#E8F0FE] font-bold text-[#1A73E8] dark:bg-[#1A73E8]/20 dark:text-[#D2E3FC]'
                              : 'text-on-surface hover:bg-[#E8F0FE]/60 hover:text-[#1A73E8] dark:text-inverse-on-surface dark:hover:bg-[#1A73E8]/14 dark:hover:text-[#D2E3FC]'
                          )}
                        >
                          <div className="flex min-w-0 items-center gap-3 text-[13px] font-semibold">
                            <span className="material-symbols-outlined shrink-0 text-[18px] text-on-surface-variant group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]">
                              {category.icon}
                            </span>

                            <span className="min-w-0 truncate whitespace-nowrap">
                              {category.label}
                            </span>
                          </div>

                          {hasChildren && (
                            <span
                              className={cn(
                                'material-symbols-outlined shrink-0 text-[16px] text-neutral-400 transition-transform duration-250 group-hover:text-[#1A73E8] dark:group-hover:text-[#D2E3FC]',
                                isCategoryExpanded && 'rotate-90 text-[#1A73E8] dark:text-[#D2E3FC]'
                              )}
                            >
                              chevron_right
                            </span>
                          )}
                        </motion.div>

                        <AnimatePresence initial={false}>
                          {isCategoryExpanded && hasChildren && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.26, ease: md3Ease }}
                              className="mt-1 mb-2 ml-2.5 flex min-w-0 flex-col gap-1 overflow-hidden rounded border-l border-neutral-200 pl-3.5 dark:border-outline-variant/15"
                            >
                              {category.children.map(node => renderTreeNode(node, 1))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}

                  {filteredCategories.length === 0 && (
                    <div className="py-8 text-center text-xs font-bold text-neutral-400">
                      No matching pages found.
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* RIGHT PREVIEW: Reading Module & Assistant */}
      <div className="relative z-10 flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <button
          onClick={toggleNav}
          title={navCollapsed ? 'Show navigation' : 'Hide navigation'}
          aria-label={navCollapsed ? 'Show navigation' : 'Hide navigation'}
          className="group absolute left-0 top-1/2 z-30 flex w-5 -translate-y-1/2 cursor-pointer select-none items-center justify-center"
        >
          <div className="h-12 w-1.5 rounded-full bg-[#CAC4D0]/60 transition-colors duration-150 group-hover:bg-[#1A73E8]/60 dark:bg-white/15" />
        </button>

        <UserGuideCenter
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          files={files}
          onRefresh={fetchFiles}
        />

        {returnView && onReturn && (
          <div className="pointer-events-none absolute bottom-6 left-6 z-30">
            <button
              onClick={onReturn}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-outline-variant/20 bg-white py-2.5 pr-5 pl-4 text-sm font-bold text-on-surface shadow-2xl transition-all select-none hover:bg-[#E8F0FE] hover:text-[#1A73E8] dark:border-outline-variant/15 dark:bg-[#1E1D22] dark:text-inverse-on-surface dark:hover:bg-[#1A73E8]/20 dark:hover:text-[#74BBFF]"
            >
              <span className="material-symbols-outlined text-[18px]">
                arrow_back
              </span>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
