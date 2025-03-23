import type { Command } from "./command";
import { commands } from "../../../utils/constants";

export class HelpCommand implements Command {
  static name: string = 'help';
  process(args: string[]): string {
    return `
      <div class="command-list">
        ${commands.map(command => `<p class="command-name">${command.name}</p><p class="command-description">${command.description}</p>`).join('')}
      </div>
    `;
  }
}