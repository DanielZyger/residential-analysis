interface RobotsRules {
  allow: string[];
  disallow: string[];
}

function toRegex(pattern: string): RegExp {
  const anchored = pattern.endsWith('$');
  const body = (anchored ? pattern.slice(0, -1) : pattern)
    .split('*')
    .map((part) => part.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
    .join('.*');
  return new RegExp(`^${body}${anchored ? '$' : ''}`);
}

export function parseRobots(content: string, userAgent: string): RobotsRules {
  const groups: { agents: string[]; rules: RobotsRules }[] = [];
  let current: { agents: string[]; rules: RobotsRules } | null = null;
  let lastWasAgent = false;
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*/, '').trim();
    const sep = line.indexOf(':');
    if (sep < 0) continue;
    const field = line.slice(0, sep).trim().toLowerCase();
    const value = line.slice(sep + 1).trim();
    if (field === 'user-agent') {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: { allow: [], disallow: [] } };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
      continue;
    }
    lastWasAgent = false;
    if (!current || !value) continue;
    if (field === 'allow') current.rules.allow.push(value);
    if (field === 'disallow') current.rules.disallow.push(value);
  }
  const ua = userAgent.toLowerCase();
  const specific = groups.find((g) => g.agents.some((a) => a !== '*' && ua.includes(a)));
  const generic = groups.find((g) => g.agents.includes('*'));
  return (specific ?? generic)?.rules ?? { allow: [], disallow: [] };
}

export function isAllowed(rules: RobotsRules, path: string): boolean {
  const longest = (patterns: string[]) =>
    patterns.filter((p) => toRegex(p).test(path)).reduce((max, p) => Math.max(max, p.length), -1);
  const allow = longest(rules.allow);
  const disallow = longest(rules.disallow);
  return disallow < 0 || allow >= disallow;
}

export type { RobotsRules };
