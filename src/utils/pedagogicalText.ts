export interface ExplanationSection {
  id: string;
  heading?: string;
  content: string;
  type?: 'normal' | 'tip';
}

/**
 * Parses raw text or markdown into structured explanation sections
 * with enlarged headings and spaced paragraphs.
 */
export function parseExplanationText(raw: string): ExplanationSection[] {
  if (!raw || !raw.trim()) {
    return [
      {
        id: 'sec-1',
        heading: '',
        content: '',
        type: 'normal'
      }
    ];
  }

  const trimmed = raw.trim();

  // Check if raw text uses markdown headings (###, ##, #)
  if (trimmed.includes('###') || trimmed.includes('##') || trimmed.includes('# ')) {
    const lines = trimmed.split('\n');
    const sections: ExplanationSection[] = [];
    let currentHeading = '';
    let currentLines: string[] = [];
    let currentType: 'normal' | 'tip' = 'normal';

    for (const line of lines) {
      const headingMatch = line.match(/^#{1,4}\s*(.*)$/);
      if (headingMatch) {
        if (currentHeading || currentLines.length > 0) {
          sections.push({
            id: `sec-${sections.length + 1}`,
            heading: currentHeading.trim(),
            content: currentLines.join('\n').trim(),
            type: currentType
          });
          currentLines = [];
          currentType = 'normal';
        }
        currentHeading = headingMatch[1].trim();
      } else {
        if (line.includes('💡') || line.startsWith('>')) {
          currentType = 'tip';
        }
        currentLines.push(line);
      }
    }

    if (currentHeading || currentLines.length > 0) {
      sections.push({
        id: `sec-${sections.length + 1}`,
        heading: currentHeading.trim(),
        content: currentLines.join('\n').trim(),
        type: currentType
      });
    }

    return sections.length > 0
      ? sections
      : [{ id: 'sec-1', heading: '', content: trimmed, type: 'normal' }];
  }

  // If no markdown headings, split by double newlines (\n\n) or blank lines
  const rawParagraphs = trimmed.split(/\n\s*\n/);
  const sections: ExplanationSection[] = [];

  for (let i = 0; i < rawParagraphs.length; i++) {
    const p = rawParagraphs[i].trim();
    if (!p) continue;

    const lines = p.split('\n');
    const firstLine = lines[0].trim();
    const isTip = p.includes('💡') || p.startsWith('דגש:');

    // If first line is short and ends with a colon or has heading-like markers
    if (lines.length > 1 && (firstLine.endsWith(':') || firstLine.startsWith('**') || firstLine.length < 50)) {
      const cleanHeading = firstLine.replace(/^\*\*|\*\*$/g, '').replace(/:$/, '').trim();
      const body = lines.slice(1).join('\n').trim();
      sections.push({
        id: `sec-${i + 1}`,
        heading: cleanHeading,
        content: body,
        type: isTip ? 'tip' : 'normal'
      });
    } else {
      sections.push({
        id: `sec-${i + 1}`,
        heading: '',
        content: p,
        type: isTip ? 'tip' : 'normal'
      });
    }
  }

  return sections.length > 0
    ? sections
    : [{ id: 'sec-1', heading: '', content: trimmed, type: 'normal' }];
}

/**
 * Serializes structured sections back into clean, readable formatted text (markdown)
 * which preserves headings, paragraphs, and tips across devices and Firestore.
 */
export function serializeSectionsToText(sections: ExplanationSection[]): string {
  if (!Array.isArray(sections)) return '';
  return sections
    .filter(Boolean)
    .map((sec) => {
      const parts: string[] = [];
      const heading = typeof sec?.heading === 'string' ? sec.heading.trim() : '';
      const content = typeof sec?.content === 'string' ? sec.content.trim() : '';
      if (heading) {
        parts.push(`### ${heading}`);
      }
      if (content) {
        if (sec.type === 'tip' && !content.includes('💡')) {
          parts.push(`💡 ${content}`);
        } else {
          parts.push(content);
        }
      }
      return parts.join('\n');
    })
    .filter((chunk) => chunk.trim().length > 0)
    .join('\n\n');
}

