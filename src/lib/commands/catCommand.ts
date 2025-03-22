import type { Command } from "./command";

const sectionsMap: Record<string,string> = {
  'experience': 'experience-section',
  'education': 'education-section',
  'projects': 'projects-section',
}

export class CatCommand implements Command {
  static name: string = 'cat';
  constructor() {}
  process(args: string[]): string {
    const [section] = args;
    if (!section) {
      return 'Please provide a section name. Type "ls" to list all available sections.';
    }
    const sectionId = sectionsMap[section];
    if (!sectionId) {
      return `Section not found: ${section}. Type "ls" to list all available sections.`;
    }

    const sectionElement = document.getElementById(sectionId);
    if (!sectionElement) {
      return `Section not found: ${section}. Type "ls" to list all available sections.`;
    }
    const siblings = document.querySelectorAll('.section');
    siblings.forEach((sibling: Element) => {
      (sibling as HTMLDivElement).style.display = 'none';
    });
    sectionElement.style.display = 'block';
    return '';
  }
}