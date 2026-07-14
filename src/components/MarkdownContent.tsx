import React from 'react';
import { marked } from 'marked';
import InteractiveChart from './charts/InteractiveChart';
import { cn } from '../App';

interface InlineAppAction {
  id: string;
  label: string;
  description?: string;
  icon: string;
  view: 'glance' | 'investigation' | 'tools' | 'user_guide' | 'settings';
  toolsTab?: 'dig' | 'mx' | 'analyzer' | 'ip_warming';
  ticketSection?: 'Overview' | 'Authentication' | 'Deliverability' | 'Email Performance' | 'Support History' | 'Workspace';
  panelLabel?: string;
  toolPrefill?: 'sending_domain' | 'sending_ip';
}

interface Props {
  content: string;
  className?: string;
  inlineActions?: InlineAppAction[];
  onRunAction?: (action: InlineAppAction) => void;
  isDark?: boolean;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function actionAliases(action: InlineAppAction) {
  const base = action.label.replace(/^Open\s+/i, '').trim();
  const aliases = new Set([action.label]);

  if (/ip warming/i.test(base)) {
    aliases.add('IP Warming Planner');
  } else {
    aliases.add(base);
  }
  if (/google dig/i.test(base)) aliases.add('Google Dig');
  if (/mx tool/i.test(base)) aliases.add('MX Tool');
  if (/header analyzer/i.test(base)) aliases.add('Message Header Analyzer');
  if (/tickets/i.test(base)) aliases.add('Tickets');
  if (/user guide/i.test(base)) aliases.add('User Guide');
  if (/dashboard/i.test(base)) aliases.add('EDQ Dashboard');
  if (/settings/i.test(base)) aliases.add('App Settings');

  return Array.from(aliases).filter(Boolean).sort((a, b) => b.length - a.length);
}

function injectActionButtons(html: string, actions: InlineAppAction[] = []) {
  if (!actions.length) return html;

  const replacements = actions.flatMap(action =>
    actionAliases(action).map(alias => ({ action, alias }))
  );
  if (!replacements.length) return html;

  const pattern = new RegExp(`\\b(${replacements.map(({ alias }) => escapeRegExp(alias)).join('|')})\\b`, 'g');
  const tagSplit = /(<[^>]+>)/g;
  let skipDepth = 0;
  const usedActionIds = new Set<string>();

  return html.split(tagSplit).map(part => {
    if (!part) return part;
    if (part.startsWith('<')) {
      if (/^<(pre|code|button|a)\b/i.test(part)) skipDepth += 1;
      if (/^<\/(pre|code|button|a)>/i.test(part)) skipDepth = Math.max(0, skipDepth - 1);
      return part;
    }
    if (skipDepth > 0) return part;

    return part.replace(pattern, match => {
      const found = replacements.find(({ alias }) => alias === match);
      if (!found || usedActionIds.has(found.action.id)) return match;
      usedActionIds.add(found.action.id);
      return `<button type="button" class="app-action-inline-chip" data-app-action-id="${found.action.id}"><span class="material-symbols-outlined app-action-inline-icon">${found.action.icon}</span><span>${match}</span></button>`;
    });
  }).join('');
}

export default function MarkdownContent({ content, className, inlineActions = [], onRunAction, isDark }: Props) {
  if (!content) return null;

  // Split by code blocks of type ```json or ```chart
  const parts = content.split(/(```(?:json|chart)[\s\S]*?```)/g);
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-app-action-id]');
    if (!target) return;
    const action = inlineActions.find(item => item.id === target.dataset.appActionId);
    if (!action) return;
    event.preventDefault();
    event.stopPropagation();
    onRunAction?.(action);
  };

  return (
    <div className={cn(className, isDark ? 'app-action-inline-dark' : 'app-action-inline-light')} onClick={handleClick}>
      {parts.map((part, index) => {
        if (part.startsWith('```json') || part.startsWith('```chart')) {
          const rawCode = part.replace(/^```(?:json|chart)/, '').replace(/```$/, '').trim();
          try {
            const parsed = JSON.parse(rawCode);
            const chartLike = parsed && (parsed.type === 'chart' || parsed.chartType || parsed.xField);
            if (chartLike) {
              return parsed.allowChart === true ? <InteractiveChart key={index} config={parsed} /> : null;
            }
          } catch (e) {
            // Failed to parse, fall back to rendering as normal code
          }
        }
        
        return (
          <div
            key={index}
            className="prose-custom max-w-none"
            dangerouslySetInnerHTML={{ __html: injectActionButtons(marked.parse(part) as string, inlineActions) }}
          />
        );
      })}
    </div>
  );
}
