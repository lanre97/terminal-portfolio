import { sections } from "../../../utils/constants";
import type { Command } from "./command";

export class ListCommand implements Command {
  static name: string = 'ls';
  process(args: string[]): string {
    return `
      <p class="section-list">
        ${sections.map(section => `<span class="section-name">${section}</span>`).join('')}
      </p>
    `;
  }
}