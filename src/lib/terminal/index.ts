import { commands, sections } from "../../utils/constants";
import { errors } from "../../utils/errors";
import { CatCommand } from "./commands/catCommand";
import type { Command } from "./commands/command";
import { ContactCommand } from "./commands/contactCommand";
import { HelpCommand } from "./commands/helpCommand";
import { ListCommand } from "./commands/listCommand";

export class Terminal {
  private static instance: Terminal;
  private commandHistory: string[] = [];
  private currentIndex: number = 0;
  private elCommandHistory: HTMLDivElement;
  private activeFlowCommand: Command | null = null;
  private constructor() {
    this.elCommandHistory = document.getElementById('command-history') as HTMLDivElement;
  }

  static getInstance() {
    if (!Terminal.instance) {
      Terminal.instance = new Terminal();
    }
    return Terminal.instance;
  }

  autoComplete(command: string): string {
    const [commandName, ...args] = command.split(' ');
    if (!commandName) {
      return '';
    }
    const matchingCommand = commands.find(c => c.name.startsWith(commandName));
    if (!matchingCommand) {
      return command;
    }
    if (matchingCommand.name === 'cat [section]') {
      const sectionMatch = sections.find(s => s.startsWith(args[0] || ''));
      return `cat ${sectionMatch || ''}`.trim();
    }
    
    return `${matchingCommand.name} ${args.join(' ')}`.trim();
  }

  getPreviousCommand() {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    return this.commandHistory[this.currentIndex] || '';
  }

  getNextCommand() {
    this.currentIndex = Math.min(this.commandHistory.length, this.currentIndex + 1);
    return this.commandHistory[this.currentIndex] || '';
  }

  addCommandHistory(command: string, output: string) {
    this.commandHistory.push(command);
    this.currentIndex = this.commandHistory.length;
    const elCommand = document.createElement('p');
    const pCommand = document.createElement('span');
    const pOutput = document.createElement('span');
    
    pCommand.innerHTML = `<div class="input-line">
      <span class="prompt">guest@dev-machine:~$</span>
      <span class="command-input">${command}</span>
    </div>
    `;
    pOutput.innerHTML = output;
    elCommand.appendChild(pCommand);
    elCommand.appendChild(pOutput);
    this.elCommandHistory.appendChild(elCommand);
  }

  clearCommandHistory() {
    this.elCommandHistory.innerHTML = '';
  }

  processCommand(command: string, args: string[]) {
    switch (command) {
      case HelpCommand.name:
        return new HelpCommand().process(args);
      case ListCommand.name:
        return new ListCommand().process(args);
      case CatCommand.name:
        this.clearCommandHistory();
        return new CatCommand().process(args);
      case ContactCommand.name:
        if (!this.activeFlowCommand) {
          this.activeFlowCommand = new ContactCommand();
        }
        return this.activeFlowCommand.process(args);
      default:
        return `<p class="error">${errors.INVALID_COMMAND.replace('{command}', command)}</p>`;
    }
  }

  clearSections() {
    const siblings = document.querySelectorAll('.section');
    siblings.forEach((sibling: Element) => {
      (sibling as HTMLDivElement).style.display = 'none';
    });
  }

  runCommand(command: string) {
    // Si estamos en un flujo activo, procesamos todo con esa instancia
    if (this.activeFlowCommand) {
      const [firstWord] = command.split(' ');
  
      if (firstWord.toLowerCase() === 'cancel') {
        this.addCommandHistory(command, this.activeFlowCommand.process(['cancel']));
        this.activeFlowCommand = null;
        return;
      }
  
      const output = this.activeFlowCommand.process(command.split(' '));
      this.addCommandHistory(command, output);
  
      // Si se completó (por ejemplo, con "send" o se canceló)
      if (command.toLowerCase() === 'send' || output.includes('Contact form cancelled')) {
        this.activeFlowCommand = null;
      }
  
      return;
    }
  
    const [commandName, ...args] = command.split(' ');
    if (!commandName) {
      return;
    }
  
    if (commandName === 'clear') {
      this.clearCommandHistory();
      this.clearSections();
      return;
    }
  
    if (commandName === 'exit') {
      location.reload();
      return;
    }
  
    // Limpio secciones si no es 'cat'
    if (commandName !== CatCommand.name) {
      this.clearSections();
    }
  
    const output = this.processCommand(commandName, args);
    this.addCommandHistory(command, output);
  }  
}